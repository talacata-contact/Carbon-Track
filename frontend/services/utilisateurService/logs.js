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

import { getdb } from '@/db/connectdb';

////////////////////////////////////////////////////////////////////////////////////
// LOGS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du dernier log
const getLastLog = async () => {
    console.log("👤​ Récupération du dernier log...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération du dernier log
        const sql = 'SELECT * FROM utilisateur_logs ORDER BY date_log DESC LIMIT 1';
        let last_log = await db.getFirstAsync(sql);

        // si première connexion : on crée le log
        if (!last_log) {
            const newLog = await addLog(new Date());
            last_log = newLog;
            // console.log("👉​ Première connexion enregistrée !");
        }

        // vérification de la récupération
        // console.log("👉​ Dernier log :", last_log);

        console.log("✅​ Dernier log récupéré avec succès !");
        return last_log;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération du dernier log :", error.message);
        throw error;
    }
};

// GET - Récupération d'un log par son id
export const getLogById = async (log_id) => {
    console.log("⚡​ Récupération d'un log par son id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération du log
        const sql = 'SELECT * FROM utilisateur_logs WHERE id = ?';
        const log = await db.getFirstAsync(sql, [log_id]);

        // vérification de la récupération
        // console.log("👉​ Log :", log);

        console.log("✅​ Log récupéré avec succès !");
        return log;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'un log par son id :", error.message);
        throw error;
    }
}

// CREATE - Ajout d'un log
const addLog = async (date_log) => {
    console.log("👤​ Ajout d'un log...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // ajout du log
        const sql = 'INSERT INTO utilisateur_logs (date_log) VALUES (?)';
        await db.runAsync(sql, [date_log.toISOString()]);

        // vérification de l'ajout
        const selectSql = 'SELECT * FROM utilisateur_logs ORDER BY date_log DESC LIMIT 1';
        const log = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouveau log :", log);

        console.log("✅​ Log ajouté avec succès !");
        return log;

    } catch (error) {
        console.log("❌​ Erreur lors de l'ajout du log :", error.message);
        throw error;
    }
};

// DELETE - Suppression d'un log
const deleteLog = async (log_id) => {
    console.log("👤​ Suppression d'un log...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        // await getLogById(log_id);

        // suppression du log
        const sql = 'DELETE FROM utilisateur_logs WHERE id = ?';
        await db.runAsync(sql, [log_id]);

        // vérification après suppression
        // await getLogById(log_id);

        console.log("✅​ Log supprimé avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression du log :", error.message);
        throw error;
    }
};

// SYNC - Synchronisation de la série de connexion
export const syncConnectionSerie = async () => {
    console.log("👤​ Synchronisation de la série de connexion...");
    try {
        // récupération du dernier log
        const lastLog = await getLastLog();
        await deleteLog(lastLog.id); // suppression du dernier log
        // enregistrement du nouveau log
        const newLog = await addLog(new Date());
        // calcul de la différence de jours entre le dernier log et le nouveau log
        const diffDays = getDiffDays(new Date(lastLog.date_log), new Date(newLog.date_log));

        // récupération de la base de données
        const db = await getdb();

        // détermination de la nouvelle série de connexion
        let sql, message, status_serie;
        if (diffDays > 1) {
            // réinitialiser (status_serie = 0)
            sql = 'UPDATE utilisateur SET serie_connexion = 0 WHERE id = 1';
            message = "✅ Série de connexion réinitialisée !";
            status_serie = 0;
        } else if (diffDays === 1) {
            // incrémenter (status = 2)
            sql = 'UPDATE utilisateur SET serie_connexion = serie_connexion + 1 WHERE id = 1';
            message = "✅ Série de connexion incrémentée !";
            status_serie = 2;
        } else {
            // même jour => ne rien changer (status = 1)
            message = "ℹ️  Même jour, série inchangée.";
            status_serie = 1;
        }

        // vérification avant la mise à jour
        const selectSql = 'SELECT serie_connexion FROM utilisateur WHERE id = 1';
        let serie_connexion = await db.getFirstAsync(selectSql);
        // console.log("👉​ Série de connexion avant la mise à jour :", serie_connexion);

        if (sql) { await db.runAsync(sql); } // mise à jour de la série de connexion

        // vérification après la mise à jour
        serie_connexion = await db.getFirstAsync(selectSql);
        // console.log("👉​ Série de connexion après la mise à jour :", serie_connexion);

        // console.log(message);
        return { status: true, message: message, serie_connexion: status_serie };

    } catch (error) {
        console.error("❌ Erreur lors de la synchronisation de la série :", error.message);
        return { status: false, message: error.message };
    }
};

// FONCTION UTILITAIRE - Calcul de la différence de jours entre le dernier log et le log actuel
const getDiffDays = (lastLogDate, actualDate) => {
    console.log("👤​ Calcul de la différence de jours entre le dernier log et le log actuel...");

    const diffTime = Math.abs(actualDate - lastLogDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // vérification de la différence
    // console.log("👉​ Log actuel :", actualDate);
    // console.log("👉​ Dernier log :", lastLogDate);
    // console.log("👉​ Différence de jours :", diffDays);

    console.log("✅​ Différence de jours calculée avec succès !");
    return diffDays;
};