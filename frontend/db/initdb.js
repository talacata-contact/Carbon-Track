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

import { getdb } from './connectdb';
import { createTables } from './createTables';

////////////////////////////////////////////////////////////////////////////////////
// INITIALISATION DE LA BASE DE DONNÉES
////////////////////////////////////////////////////////////////////////////////////

// INIT - Initialisation de la base de données
export const initdb = async () => {
    console.log("📦​ Initialisation de la base de données...");
    try {
        // création de la base de données
        const db = await getdb();

        // création des tables
        await createTables(db);

        // vérification des tables
        const tables = await db.getAllAsync('SELECT name FROM sqlite_master WHERE type="table";');
        for (const table of tables) {
            // console.log("📋 Table :", table.name);
            const content = await db.getAllAsync(`SELECT * FROM ${table.name};`);
            // console.log("👉​ Contenu de la table :", content);
        }

        console.log("✅ Initialisation de la base de données réussie !");
        return { status: true, message: "Initialisation de la base de données réussie !" };

    } catch (error) {
        console.log("❌​ Erreur lors de l'initialisation de la base de données :", error.message);
        return { status: false, message: error.message };
    }
}