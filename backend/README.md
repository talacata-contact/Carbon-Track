# 📦 Backend - Guide de démarrage

> ⚠️ **IMPORTANT** : Pour toutes les commandes suivantes, assurez-vous d'être dans le dossier `backend` :
> ```bash
> cd backend
> ```

## ⚙️ Prérequis

- Node.js ≥ 16
- MongoDB ≥ 6.19.0

## 🚀 Démarrage en mode développement

1. Installez les dépendances :

```bash
npm install
```

2. Créez une base MongoDB via MongoDB Compass.

3. Créez un fichier .env à la racine (basé sur .env.example) :

```
# port du serveur local express
PORT=3000

# cle api pour Impact CO2
API_IMPACT_CO2_KEY=your_api_key # non-obligatoire

# DEV - configurations MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_CONNECTION_NAME=your_connection_name
```

4. Initialisez la base :

```bash
npm run initdb:dev
```

5. Démarrez le serveur local :

```bash
npm start
# ou
npm run dev
```

6. Documentation Swagger :

👉 [Swagger](http://localhost:3000/api-docs)

## ☁️ Mode Pré-production / Production (Firebase)

### 🔥​ Initialisation de Firebase

1. Installez Firebase CLI :

```bash
npm install -g firebase-tools
```

2. Connectez-vous à votre compte Firebase :

```bash
firebase login
```

3. Créez un fichier .env à l'intérieur du dossier `/firebase/functions/` (basé sur .env.example) :

```
# cle api pour Impact CO2
API_IMPACT_CO2_KEY=your_api_key

# environnement d'exécution
NODE_ENV=preprod # ou prod

# PREPROD, PROD - configurations Firestore
FIRESTORE_PREPROD_DATABASE_NAME=your_preprod_firestore_database_name
FIRESTORE_PROD_DATABASE_NAME=your_prod_firestore_database_name
```

4. Installez les dépendances :

```bash
cd firebase/functions
npm install
```

5. Ajoutez la clé Firebase Admin :

- Firebase Console → **Paramètres du projet** → **Comptes de service** → **SDK Admin Firebase** → **Générer une nouvelle clé privée**
- Placez le fichier généré dans `/firebase` à la place du fichier `serviceAccountKey.json.example` en le renommant `serviceAccountKey.json`

### 🗄️ Initialisation des bases de données Firestore

- Pré-prod :

```
.env
# PREPROD, PROD - configurations Firestore
FIRESTORE_PREPROD_DATABASE_NAME=your_firestore_preprod_name
```

```bash
npm run initdb:preprod # à lancer à la racine du projet
```

- Prod :

```
.env
# PREPROD, PROD - configurations Firestore
FIRESTORE_PROD_DATABASE_NAME=your_firestore_prod_name
```

```bash
npm run initdb:prod # à lancer à la racine du projet
```

Pour tester le déploiement des bases de données Firestore, vous pouvez les lancer avec le serveur express local et tester les appels depuis le swagger :

```bash
npm run dev:firestore:preprod # à lancer à la racine du projet
```

```bash
npm run dev:firestore:prod # à lancer à la racine du projet
```

👉 [Swagger](http://localhost:3000/api-docs)

### 🚀 Lancement & Déploiement Firebase

- Tests avec l'emulateur :

```bash
cd firebase/functions
npm run emulate:preprod
```

- Déploiement des clouds functions en mode pré-prod :

```
/firebase/functions/.env
# environnement d'exécution
NODE_ENV=preprod
```

```bash
cd firebase/functions
npm run deploy:preprod
```

- Déploiement des clouds functions en mode prod :

```
/firebase/functions/.env
# environnement d'exécution
NODE_ENV=prod
```

```bash
cd firebase/functions
npm run deploy:prod
```

- Voir les fonctions déployées :

```bash
cd firebase/functions
firebase functions:list
```

- Afficher les logs :

```bash
cd firebase/functions
npm run logs
```

## 📊 Tableau récapitulatif des commandes

| Commande                      | Mode    | Serveur                   | Base de données | Notes                                      |
| ----------------------------- | ------- | ------------------------- | --------------- | ------------------------------------------ |
| npm run initdb:dev            | DEV     |                           | MongoDB         | Initialisation de la db locale             |
| npm start / npm run dev       | DEV     | Express local             | MongoDB         | Dev classique                              |
| npm run initdb:preprod        | PREPROD |                           | Firestore       | Initialisation de la db Firestore pré-prod |
| npm run dev:firestore:preprod | PREPROD | Express local             | Firestore       | Test des appels à la db Firestore pré-prod |
| npm run emulate:preprod       | PREPROD | Cloud Functions emulator  | Firestore       | Test Firebase                              |
| npm run deploy:preprod        | PREPROD | Cloud Functions déployées | Firestore       | Déploiement complet pour la pré-prod       |
| npm run initdb:prod           | PROD    |                           | Firestore       | Initialisation de la db Firestore prod     |
| npm run dev:firestore:prod    | PROD    | Express local             | Firestore       | Test des appels à la db Firestore prod     |
| npm run deploy:prod           | PROD    | Cloud Functions déployées | Firestore       | Déploiement complet pour la prod           |

## 🗂️ Structure et fichiers importants

```
.
├── api/
│ └── routes/
│   └── aliments.js           # Routes pour les aliments
│   └── logements.js          # Routes pour les logements
│   └── moyennesFr.js         # Routes pour les moyennes fr
│   └── notifications.js      # Routes pour les notifications
│   └── suggestions.js        # Routes pour les suggestions
│   └── transports.js         # Routes pour les transports
│ └── services/
│   └── alimentsService.js           # Services pour les aliments
│   └── logementsService.js          # Services pour les logements
│   └── moyennesFrService.js         # Services pour les moyennes fr
│   └── notificationsService.js      # Services pour les notifications
│   └── suggestionsService.js        # Services pour les suggestions
│   └── transportsService.js         # Services pour les transports
│ └── api.js          # Fichier principal de l'API
│ └── swagger.js      # Configuration Swagger
├── db/
│ └── config.js         # Configuration de la base de données selon l'environnement choisi
│ └── db.js             # Gestion des connexions à la base de données
│ └── mongodb.js        # Gestion de la base de données MongoDB
│ └── schema.jpg        # Schéma de la base de données
│ └── tables.js         # Tables pré-remplies de la base de données
├── firebase/        # Dossier pour le déploiement sur Firebase
│ └── functions/     # Dossier pour le déploiement des Cloud Functions Firebase
│   └── api/         # Copie du dossier api/ du projet
│   └── clouds-functions/
│       └── api.mjs                   # Cloud Function pour l'API
│       └── cron.mjs                  # Cloud Function pour les notifications quotidiennes
│       └── firebase-admin.mjs        # Initialisation de Firebase admin
│       └── security.mjs              # Middleware de sécurisation Firebase
│   └── db/          # Copie du dossier db/ du projet
│       └── firestore.mjs             # Gestion de la base de données Firestore
│   └── .env                                  # Configuration d'environnement Firebase
│   └── .env.example                          # Exemple de configuration d'environnement Firebase
│   └── index.mjs                             # Fichier principal Firebase
│   └── package.json                          # Configuration des dépendances Firebase
│   └── serviceAccountKey.json                # Credentials Firebase admin
│   └── serviceAccountKey.json.example        # Exemple de Credentials Firebase admin
├── scripts/
│ └── calculCO2ConstructionFactors.js         # Script pour calculer les facteurs de construction des transports
│ └── initdb.js                               # Script d'initialisation des bases de données
├── src/
│ └── server.js                               # Fichier principal du serveur Express local
├── .env                 # Configuration d'environnement
├── .env.example         # Exemple de configuration d'environnement
├── package.json         # Configuration des dépendances
├── README.md

```
