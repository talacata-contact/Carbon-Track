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

import api from '@/api/api';
import { getdb } from '@/db/connectdb';

////////////////////////////////////////////////////////////////////////////////////
// MOYENNES FR
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des moyennes FR
export const getMoyennesFr = async () => {
    // console.log("📊​ Récupération des moyennes FR...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des moyennes FR
        const sql = 'SELECT * FROM moyennes_fr';
        const moyennesFr = await db.getAllAsync(sql);

        // vérification de la récupération
        // console.log("👉​ Moyennes FR :", moyennesFr);

        // console.log("✅​ Moyennes FR récupérées avec succès !");
        return { status: true, message: "Moyennes FR récupérées avec succès !", moyennesFr: moyennesFr };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des moyennes FR :", error.message);
        return { status: false, message: error.message };
    }
}

// GET - Récupération des moyennes FR depuis l'API
export const getMoyennesFrFromApi = async () => {
    // console.log("🌐 Appel à l'API pour récupérer les moyennes FR...");
    try {
        // appel à l'API
        const response = await api.get('/moyennesFr');

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour récupérer les moyennes FR réussi !");
        return response.data.moyennesFr;

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour récupérer les moyennes FR :", error.message);
        throw error;
    }
}

// SYNC - Synchronisation des moyennes FR
export const syncMoyennesFr = async () => {
    console.log("📊​​ Synchronisation des moyennes FR...");
    try {
        // récupération des moyennes FR depuis l'API
        const moyennesFr = await getMoyennesFrFromApi();

        // récupération de la base de données
        const db = await getdb();

        // insertion (ou mise à jour) des moyennes FR
        for (const moyenneFr of moyennesFr) {
            const sqlInsert = 'INSERT OR REPLACE INTO moyennes_fr (id, categorie, type_action, moyenne_value, moyenne_unit) VALUES (?, ?, ?, ?, ?)';
            await db.runAsync(sqlInsert, [moyenneFr.id, moyenneFr.categorie, moyenneFr.type_action, moyenneFr.moyenne_value, moyenneFr.moyenne_unit]);
        }

        // suppression des moyennes FR non présentes dans l'API
        const placeholders = moyennesFr.map(() => '?').join(',');
        const sqlDelete = `DELETE FROM moyennes_fr WHERE id NOT IN (${placeholders})`;
        const ids = moyennesFr.map(m => m.id);
        await db.runAsync(sqlDelete, ids);

        // vérification de la synchronisation
        const sqlSelect = 'SELECT * FROM moyennes_fr';
        const moyennesFr_synced = await db.getAllAsync(sqlSelect);
        // console.log("👉​ Moyennes FR synchronisées :", moyennesFr_synced);

        console.log("✅​ Synchronisation des moyennes FR réussie !");
        return { status: true, message: "Synchronisation des moyennes FR réussie !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation des moyennes FR :", error.message);
        return { status: false, message: error.message };
    }
}