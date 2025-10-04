/*
Copyright © 2025 TALACATA.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import dotenv from "dotenv";

// environnement actuel (dev, preprod, prod)
dotenv.config();
const current_env = process.env.NODE_ENV;

// configurations de la db
const db_configs = {
    dev: {
        // mongodb pour le dev
        type: 'mongodb',
        connectionString: process.env.MONGODB_URL,
        database: process.env.MONGODB_CONNECTION_NAME
    },
    preprod: {
        // firestore pour la pré-prod
        type: 'firestore',
        database: process.env.FIRESTORE_PREPROD_DATABASE_NAME
    },
    prod: {
        // firestore pour la prod
        type: 'firestore',
        database: process.env.FIRESTORE_PROD_DATABASE_NAME
    }
};

// fonction pour récupérer la configuration de la db (dev, preprod, prod)
export const getdbConfig = () => {
    return db_configs[current_env];
};

// fonction pour récupérer le type de la db (mongodb, firestore)
export const getdbType = () => {
    return db_configs[current_env].type;
};