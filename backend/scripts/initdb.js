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

import dotenv from 'dotenv';
import { getdb, disconnectdb } from "../db/db.js";
import { getdbType } from '../db/config.js';

// environnement actuel (dev, preprod, prod)
dotenv.config();
const currentEnv = process.env.NODE_ENV;

// fonction pour initialiser la base de données
const initdb = async () => {
    console.log("\n📦 Initialisation de la base de données...");
    console.log(`🔧 Environnement: ${currentEnv}`);
    console.log(`🔧 Type de db: ${getdbType()}`);

    try {
        // connexion à la base de données
        const db = await getdb();
        await db.connect();

        // création et remplissage des collections
        await db.createAndFillCollections();

        console.log("\n✅ Base de données initialisée avec succès !");
    } catch (error) {
        console.log("❌​ Erreur lors de l'initialisation de la base de données :", error.message);
    } finally {
        // fermeture de la connexion
        await disconnectdb();
    }
};

// exécution du script
initdb();
