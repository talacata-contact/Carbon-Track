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

import { getdbType } from './config.js';

// création de la base de données
let db = null;

// fonction pour créer la base de données
const createdb = async () => {
    const db_type = getdbType();
    switch (db_type) {
        case 'mongodb':
            const { default: MongoDB } = await import('./mongodb.js');
            return new MongoDB();
        case 'firestore':
            const { default: Firestore } = await import('../firebase/functions/db/firestore.mjs');
            return new Firestore();
        default:
            throw new Error(`Type de base de données non supporté : ${db_type}`);
    }
};

// fonction pour récupérer la base de données
export const getdb = async () => {
    if (!db) {
        db = await createdb();
    }
    return db;
};

// fonction pour se connecter à la base de données
export const connectdb = async () => {
    const db = await getdb();
    await db.connect();
};

// fonction pour se déconnecter de la base de données
export const disconnectdb = async () => {
    if (db) {
        await db.disconnect();
        db = null;
    }
};