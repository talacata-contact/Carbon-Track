# 📱 Frontend - Guide de démarrage

> ⚠️ **IMPORTANT** : Pour toutes les commandes suivantes, assurez-vous d'être dans le dossier `frontend` :
> ```bash
> cd frontend
> ```

## ⚙️ Prérequis

- Backend lancé en arrière-plan, sinon les appels API échoueront.
- Android Studio (Android) ou XCode (iOS) installés.

## 🔧 Configurations

1. Installez les dépendances :

```bash
npm install
```

2. Ajoutez les credentials Firebase :

- **Firebase Console** → **Paramètres du projet** → **Paramètres généraux**
- Téléchargez : `GoogleService-Info.plist` (iOS) et `google-services.json` (Android).
- Placez-les dans `/credentials` à la place des `.example`.

3. Activez l'authentification anonyme :

- **Firebase Console** → **Authentication** → **Méthode de connexion** → **Ajouter un fournisseur** → **Anonyme**

## 🚀 Lancement de l'application

### 🛠️ Mode Bare Workflow

👉 Utilisez ce mode pour développer en local (uniquement disponible sur Android Studio et iOS XCode).

1. Configurez l'URL de l'API :

- Assurez-vous que le backend est lancé en arrière-plan
- Dans `api/api.js`, indiquez l'URL fournie par les cloud functions emulator :

```javascript
// /api/api.js ligne 22
export const API_URL = ""; // TODO : changer par votre URL
```

2. Générez les dossiers natifs (/android et /ios) :

```bash
npx expo prebuild
```

3. Lancez sur un émulateur :

```bash
npx expo run:android # Android
npx expo run:ios # iOS
```

4. Relancez l'application :

```bash
npx expo start --dev-client
```

### ☁️ Mode EAS Build

👉 Utilisez ce mode pour générer une app distribuable.

1. Installez EAS CLI :

```bash
npm install -g eas-cli
```

2. Connectez-vous à votre compte Expo :

```bash
eas login
```

3. Ajoutez les secrets EAS (à faire une seule fois) :

```bash
eas secret:create GOOGLE_SERVICE_INFO_PLIST --value ./credentials/GoogleService-Info.plist --type file # visibility = secret, environments = all
eas secret:create GOOGLE_SERVICES_JSON --value ./credentials/google-services.json --type file # visibility = secret, environments = all
eas secret:create IS_EAS --value true --type string # visibility = plain text, environments = all
```

4. Utilisez les workflows EAS :

Pour tirer pleinement parti d’EAS (Expo Application Services), vous devez configurer les builds pour tous les environnements : iOS, Android (simulateur et appareil physique).
Consultez le guide officiel pour la configuration initiale : [Setup your environment for EAS](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&platform=android&device=physical)

---

4.1 Générer une version _développement_ (uniquement disponible pour Android)

- Utilisez cette configuration pour continuer à développer sur des appareils physiques avec le backend déployé.
- Configurez l'URL de l'API :

```javascript
// /api/api.js ligne 22
export const API_URL = ""; // TODO : changer par votre URL
```

- Lancez le workflow :
```bash
eas workflow:run .eas/workflows/create-development-builds.yml
```

- Lancez l'application :

```bash
npx expo start --dev-client
```

---

4.2 Générer une version _preview_ de l’application

- Les versions _preview_ permettent de générer une version pré-production de l'application partageable via un QR Code.
- Configurez l'URL de l'API :

```javascript
// /api/api.js ligne 22
export const API_URL = ""; // TODO : changer par votre URL
```
- Configurez EAS Update :
```bash
eas update:configure
```
- Lancez le workflow :
```bash
eas workflow:run .eas/workflows/publish-preview-update.yml
```

---

4.3 Déployer l’application sur les stores

- Utilisez cette étape pour publier l’application officiellement sur **Google Play** et **App Store**.
- Configurez l'URL de l'API :

```javascript
// /api/api.js ligne 22
export const API_URL = ""; // TODO : changer par votre URL
```

- Guide détaillé pour déployer sur le Play Store : [Submit to the Google Play Store](https://docs.expo.dev/submit/android/)
- Guide détaillé pour déployer sur l'App Store : [Submit to the Apple App Store](https://docs.expo.dev/submit/ios/)

---

⚠️ Remarque : Assurez-vous que votre projet est correctement configuré pour chaque environnement avant d’exécuter un workflow EAS. Les erreurs de configuration sont la cause la plus fréquente de builds échoués.

## 🗂️ Structure et fichiers importants

```
.
├── .eas/
│   └── workflows/
│       └── create-development-builds.yml      # Workflow EAS pour créer les builds de développement
│       └── publish-preview-update.yml         # Workflow EAS pour générer une version preview de l'application
│       └── deploy-to-production.yml           # Workflow EAS pour déployer l'application sur les stores
├── api/
│   └── api.js    # Fichier principal de l'API
├── app/
│   └── (tabs)/
│       └── details/
│           └──[category].tsx
│       └── _layout.tsx
│       └── aliment.tsx
│       └── index.tsx
│       └── logement.tsx
│       └── params.tsx
│       └── transport.tsx
│   └── _layout.tsx
│   └── index.tsx    # Fichier principal de l'application
│   └── welcome.tsx    # Première page de lancement
├── components/
│   └── Ajout/
│       └── CreateAlimentByCode.tsx
│       └── CreateAlimentByText.tsx
│       └── CreateLogement.tsx
│       └── CreateTransport.tsx
│   └── Card/
│       └── ActionCard.tsx
│       └── ActionList.tsx
│       └── ActionPassiveList.tsx
│       └── IterationCard.tsx
│       └── IterationList.tsx
│       └── Objectif.tsx
│       └── Suggestions.tsx
│       └── UsuelleList.tsx
│   └── Fav/
│       └── FavAliment.tsx
│       └── FavTransport.tsx
│   └── Graph/
│       └── EqCO2.tsx
│       └── FilterPicker.tsx
│       └── Graphe.tsx
│       └── GrapheG.tsx
│   └── Modif/
│       └── ModifAliment.tsx
│       └── ModifLogement.tsx
│       └── ModifTransport.tsx
│   └── NavBar/
│       └── AlimentMenu.tsx
│       └── CustomTabBar.tsx
│       └── FavEtRepet.tsx
│       └── GeneralMenu.tsx
│       └── Header.tsx
│       └── SimplePlus.tsx
│   └── Repet/
│       └── RepetAliment.tsx
│       └── RepetLogement.tsx
│       └── RepetTransport.tsx
├── constants/
│   └── Colors.tsx
│   └── IconMap.tsx
├── credentials/
│   └── google-services.json               # Fichier credentials pour l'application Android
│   └── google-services.json.example
│   └── GoogleService-Info.plist           # Fichier credentials pour l'application iOS
│   └── GoogleService-Info.plist.example
├── db/
│   └── connectdb.js          # Fichier pour se connecter à la base de données
│   └── createTables.js       # Fichier pour créer les tables
│   └── exportdb.js           # Fichier pour exporter la base de données
│   └── filldbForTest.js      # Fichier pour peupler la base de données pour les tests
│   └── importdb.js           # Fichier pour importer la base de données
│   └── initdb.js             # Fichier pour initialiser la base de données (connexion + création des tables)
│   └── schema.jpg            # Schéma de la base de données
├── firebase/
│   └── firebaseConfig.js     # Fichier pour configurer Firebase
├── services/
│   └── dataService/
│       └── moyennesFrService.js       # Services pour les moyennes fr
│       └── suggestionsService.js      # Services pour les suggestions
│   └── evenementsService/
│        └── actions.js                # Services pour les actions
│        └── actionsIterations.js      # Services pour les actions itérations
│        └── actionsPassives.js        # Services pour les actions passives
│        └── actionsReferences.js      # Services pour les actions références
│        └── actionsUsuelles.js        # Services pour les actions usuelles
│        └── evenements.js             # Services pour les événements
│   └── notificationsService/
│        └── appLifeCycle.js
│        └── notifications.js          # Services pour les notifications
│   └── referencesService/
│        └── aliment.js                # Services pour les aliments
│        └── logement.js               # Services pour les logements
│        └── transport.js              # Services pour les transports
│   └── utilisateursService/
│        └── absences.js               # Services pour les absences
│        └── logs.js                   # Services pour les logs
│        └── resetUtilisateur.js
│        └── utilisateurs.js           # Services pour les utilisateurs
├── types/
│ └── actionsPassives.d.ts      # types pour les actions passives
├── .gitignore
├── app.config.js     # Fichier pour configurer l'application
├── eas.json          # Fichier pour configurer EAS Build
├── package.json      # Fichier des dépendances
├── README.md

```
