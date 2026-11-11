# 🔐 Analyse de sécurité — Carbon Track

> Analyse réalisée par Mistral AI (Vibe Code) — février 2026
> Périmètre : backend Express, Cloud Functions Firebase, frontend Expo, historique git.

## 🔴 Critiques

### 1. Le backend local (dev) n'a aucune authentification
- `backend/src/server.js:63-70` : les routes sont montées **sans** `securityMiddleware`, contrairement aux Cloud Functions (`backend/firebase/functions/clouds-functions/api.mjs:31`). Toutes les routes (logements, transports, notifications…) sont publiques.
- Le serveur écoute sur `0.0.0.0` (`server.js:73`) et Swagger UI est exposé avec `tryItOutEnabled: true` — n'importe qui sur le réseau peut explorer et appeler l'API. Si ce serveur est un jour déployé tel quel (au lieu des Cloud Functions), tout est ouvert.
- Le rate limiting n'est présent que dans `security.mjs` (utilisé uniquement par les Functions).

**Recommandation** : appliquer le `securityMiddleware` (ou au minimum le rate limiting) au serveur Express local, et restreindre l'écoute à `127.0.0.1` en dev.

### 2. L'authentification Firebase anonyme ne protège rien
- `frontend/firebase/firebaseConfig.js:12` : `signInAnonymously`. N'importe qui peut obtenir un ID token valide sans restriction → le `securityMiddleware` des Cloud Functions valide un token, mais pas une identité réelle. Toutes les protections « authentifié » sont contournables gratuitement.

**Recommandation** : si l'anonymat doit rester, le backend ne doit pas considérer un token anonyme comme une preuve d'identité pour les données multi-utilisateurs ; sinon migrer vers une auth réelle (email, Google, etc.).

### 3. Fuite de tous les tokens push des utilisateurs
- `backend/api/routes/notifications.js:52` : `GET /notifications/get-users-to-notify` renvoie la liste de **tous** les tokens push Expo. Cet endpoint est destiné au cron quotidien, mais tout client (y compris avec un compte anonyme) peut l'appeler et récupérer la base complète des tokens → spam de notifications, énumération des utilisateurs.

**Recommandation** : supprimer cet endpoint public et le réserver au cron (vérification d'identité de service, ex. OIDC du Scheduler), ou le protéger par un secret dédié.

### 4. Écrasement / suppression de l'activité d'un autre utilisateur
- `backend/db/mongodb.js` et `backend/firebase/functions/db/firestore.mjs` : `users_activities` est indexé par `_id = expoToken`. Via `POST /notifications/save-user-activity`, n'importe quel appelant peut écraser ou supprimer (`deleteUser`) l'enregistrement d'un token connu — pas de vérification que le token appartient à l'appelant. DoS ciblé des notifications.

**Recommandation** : indexer `users_activities` par l'UID Firebase plutôt que par token push, et vérifier l'appartenance avant toute écriture/suppression.

## 🟠 Moyens

### 5. Aucune validation d'entrée + injection dans les URLs tierces
- Aucune lib de validation (express-validator / zod / joi) ; `req.query` / `req.body` utilisés bruts.
- `backend/api/services/alimentsService.js:30` : `?search_terms=${text}` non encodé → injection de paramètres dans l'API OpenFoodFacts ; `:69` `/product/${barcode}` → injection de chemin. Pas de SSRF complet (hôte fixe), mais manipulation d'API tierce possible.

**Recommandation** : valider les entrées (zod/joi) et encoder les paramètres avec `encodeURIComponent`.

### 6. Pas d'en-têtes de sécurité ni de CORS configuré
- Aucun `helmet`, aucun `cors` dans le backend. CORS par défaut = tout origine accepté ; Swagger UI et l'API sont appelables depuis n'importe quel navigateur. Aggravant combiné au point 1.

**Recommandation** : ajouter `helmet` et restreindre les origines CORS aux besoins réels.

### 7. Fuite d'informations internes via les réponses d'erreur
- Partout : `res.status(500).json({ error: "..." + error.message })` (ex. `notifications.js:114`). Les messages d'erreur bruts (DB, réseau, interne) sont renvoyés au client. Les logs affichent aussi les tokens push en clair (`notificationsService.js:33`).

**Recommandation** : renvoyer des messages d'erreur génériques au client et journaliser les détails côté serveur uniquement (sans données sensibles).

### 8. Rate limiting facilement contournable
- `backend/firebase/functions/clouds-functions/security.mjs` : limite par UID, mais les comptes anonymes Firebase sont illimités → rotation de comptes = nouveau quota à chaque fois. Le `failedAuthLimiter` utilise une clé constante `user_unauthenticated` : toutes les requêtes non authentifiées partagent le même bucket (verrouillage collectif possible).

**Recommandation** : combiner la limite par UID avec une limite par IP, et activer l'App Check Firebase (prévu mais non utilisé dans le middleware).

## 🟡 Faibles / à vérifier

- **Règles Firestore absentes du repo** : impossible de vérifier que la base n'est pas accessible en direct depuis les clients (auth anonyme). Si les règles laissent lire `users_activities`, le point 3 est doublé d'un accès direct. → Publier/vérifier `firestore.rules`.
- **`FUNCTIONS_EMULATOR=true` utilisé aussi pour `initdb:prod`** (`backend/package.json`) : charge `serviceAccountKey.json` en mode « prod » — risque de confusion de credentials entre preprod/prod.
- **`API_URL = ""` avec TODO** (`frontend/api/api.js:9`) : configuration incomplète ; les appels partiraient vers une origine vide.
- **Pas de CI de sécurité** : pas de `npm audit` / Dependabot / secret scanning, pas de tests (`"test": "echo Error..."`). Les dépendances sont récentes, mais rien ne les surveille dans la durée.
- **`ACCESS.md`** publie les emails de l'org et du propriétaire — mineur, mais c'est de l'OSINT gratuite dans un repo public.

## ✅ Points positifs

- Aucun secret en dur dans le code ni dans l'historique git (seuls des `.example` sont commis).
- `.gitignore` couvre bien `.env`, `serviceAccountKey.json`, `google-services.json`, clés et certificats.
- La clé API Impact CO2 est utilisée côté serveur uniquement, jamais dans le client.
- Les Cloud Functions ont un vrai middleware (Auth vérifié + rate limit).

## 📋 Plan d'action prioritaire

1. Supprimer ou verrouiller `GET /notifications/get-users-to-notify` (réservé au cron, avec vérification d'identité de service).
2. Indexer `users_activities` par l'UID Firebase plutôt que par token push, et vérifier l'appartenance avant écriture/suppression.
3. Ajouter le `securityMiddleware` (ou au minimum le rate limiting) au serveur Express local, et restreindre l'écoute à `127.0.0.1` en dev.
4. Ajouter `helmet`, valider les entrées (zod/joi), encoder les paramètres dans les URLs OpenFoodFacts (`encodeURIComponent`).
5. Vérifier/publier les règles Firestore ; générer des erreurs génériques côté client.
