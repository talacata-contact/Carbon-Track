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
import { deletePassiveAction } from '../evenementsService/actionsPassives';

////////////////////////////////////////////////////////////////////////////////////
// LOGEMENTS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des logements favoris
export const getLogementsFavoris = async () => {
    console.log("🏠​ Récupération des logements favoris...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des logements favoris
        const sql = 'SELECT * FROM logements WHERE is_favori=1';
        const logements_favoris = await db.getAllAsync(sql);

        // vérification de la récupération
        // console.log("👉​ Logements favoris :", logements_favoris);

        console.log("✅​ Logements favoris récupérés avec succès !");
        return { status: true, message: "Logements favoris récupérés avec succès !", logements_favoris: logements_favoris };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des logements favoris :", error.message);
        return { status: false, message: error.message };
    }
};

// GET - Récupération d'un logement par son id
export const getLogementById = async (id) => {
    // console.log("🏠​ Récupération d'un logement par son id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération du logement
        const sql = 'SELECT * FROM logements WHERE id = ?';
        const logement = await db.getFirstAsync(sql, [id]);

        // vérification de la récupération
        // console.log("👉​ Logement :", logement);

        // console.log("✅​ Logement récupéré avec succès !");
        return { status: true, message: "Logement récupéré avec succès !", logement: logement };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération du logement :", error.message);
        return { status: false, message: error.message };
    }
};

// GET - Récupération d'un logement non favoris par la catégorie id et la superficie
export const getLogementNonFavorisByChauffageIdAndSuperficie = async (chauffage_id, superficie) => {
    console.log("⚡​ Récupération d'un logement non favoris par la catégorie id et la superficie...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération du logement
        const sql = 'SELECT * FROM logements WHERE chauffage_id = ? AND superficie_m2 = ? AND is_favori = 0';
        const logement = await db.getFirstAsync(sql, [chauffage_id, superficie]);

        // vérification de la récupération
        // console.log("👉​ Logement non favoris :", logement);

        console.log("✅​ Logement récupéré avec succès !");
        return logement;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'un logement non favoris :", error.message);
        throw error;
    }
}

// CREATE - Création d'un logement
export const createLogement = async (nom = "", chauffage_id, superficie_m2, temp_chauffage = 20, is_favori) => {
    console.log("🏠​ Création d'un logement...");
    try {

        // si le logement n'est pas favori, nom du logement = nom du chauffage
        if (!is_favori) {
            const response = await getAllChauffages();
            if (response.status) {
                const chauffages = response.chauffages;
                const chauffage = chauffages.find(c => c.id === chauffage_id);
                nom = chauffage.nom;
            } else {
                throw new Error(response.message);
            }
        }

        // récupération de la base de données
        const db = await getdb();

        // création du logement
        const sql = 'INSERT INTO logements (nom, chauffage_id, superficie_m2, temp_chauffage, is_favori) VALUES (?, ?, ?, ?, ?)';
        await db.runAsync(sql, [nom, chauffage_id, superficie_m2, temp_chauffage, is_favori]);

        // vérification de la création
        const selectSql = 'SELECT * FROM logements ORDER BY id DESC LIMIT 1';
        const logement = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouveau logement :", logement);

        console.log("✅​ Logement créé avec succès !");
        return logement;

    } catch (error) {
        console.log("❌​ Erreur lors de la création du logement :", error.message);
        throw error;
    }
};

// UPDATE - Modification d'un logement
export const updateLogement = async (id, updates) => {
    console.log("🏠​ Modification d'un logement...");
    try {
        // vérification des modifications
        if (Object.keys(updates).length === 0) {
            throw new Error("❌​ Aucune modification apportée au logement");
        }

        // récupération de la base de données
        const db = await getdb();

        // modification du logement
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = ?`).join(", ");

        // requête sql
        const sql = `UPDATE logements SET ${setClause} WHERE id = ?`;
        await db.runAsync(sql, [...values, id]);

        // vérification de la modification
        // const selectSql = 'SELECT * FROM logements WHERE id = ?';
        // const logement = await db.getFirstAsync(selectSql, [id]);
        // console.log("👉​ Logement modifié :", logement);

        console.log("✅​ Logement modifié avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la modification du logement :", error.message);
        throw error;
    }
};

// DELETE - Suppression d'un logement
export const deleteLogement = async (id) => {
    console.log("🏠​ Suppression d'un logement...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        // const selectSql_before = 'SELECT * FROM logements WHERE id = ?';
        // const logement_before = await db.getFirstAsync(selectSql_before, [id]);
        // console.log("👉​ Logement à supprimer :", logement_before);

        // suppression du logement
        const sql = 'DELETE FROM logements WHERE id = ?';
        await db.runAsync(sql, [id]);

        // vérification après suppression
        // const selectSql_after = 'SELECT * FROM logements WHERE id = ?';
        // const logement_after = await db.getFirstAsync(selectSql_after, [id]);
        // console.log("👉​ Logement supprimé :", logement_after);

        console.log("✅​ Logement supprimé avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression d'un logement :", error.message);
        throw error;
    }
}

// DELETE - Suppression d'un logement pour déménagement
export const deleteLogementForDemenagement = async (id, actions_passives_ids) => {
    console.log("🏠​ Suppression d'un logement pour déménagement...");
    try {
        // mise à jour du status is_favori
        await updateLogement(id, { is_favori: false });

        // suppresion des actions passives associées
        for (const action_passive_id of actions_passives_ids) {
            const response = await deletePassiveAction(action_passive_id);
            if (!response.status) {
                throw new Error(response.message);
            }
        }

        console.log("✅​ Logement déménagé avec succès !");
        return { status: true, message: "Déménagement pris en compte avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors du déménagement d'un logement :", error.message);
        return { status: false, message: error.message };
    }
}

////////////////////////////////////////////////////////////////////////////////////
// CHAUFFAGES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des chauffages
export const getAllChauffages = async () => {
    // console.log("🏠​ Récupération des chauffages...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des chauffages
        const sql = 'SELECT * FROM chauffages';
        const chauffages = await db.getAllAsync(sql);

        // vérification de la récupération
        // console.log("👉​ Chauffages :", chauffages);

        // console.log("✅​ Chauffages récupérées avec succès !");
        return { status: true, message: "Chauffages récupérées avec succès !", chauffages: chauffages };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des chauffages :", error.message);
        return { status: false, message: error.message };
    }
}

// GET - Récupération des chauffages depuis l'API
export const getAllChauffagesFromApi = async () => {
    console.log("🌐​​ Appel à l'API pour récupérer les chauffages...");
    try {
        // appel à l'API
        const response = await api.get('/logements/chauffages');

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour récupérer les chauffages réussi !");
        return response.data.chauffages;

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour récupérer les chauffages :", error.message);
        throw error;
    }
};

// GET - Récupération d'un chauffage par son id
export const getChauffageById = async (id) => {
    // console.log("🏠​ Récupération d'un chauffage par son id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération du chauffage
        const sql = 'SELECT * FROM chauffages WHERE id = ?';
        const chauffage = await db.getFirstAsync(sql, [id]);

        // vérification de la récupération
        // console.log("👉​ Chauffage :", chauffage);

        // console.log("✅​ Chauffage récupéré avec succès !");
        return { status: true, message: "Chauffage récupéré avec succès !", chauffage: chauffage };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'un chauffage par son id :", error.message);
        return { status: false, message: error.message };
    }
}

// SYNC - Synchronisation des chauffages
export const syncChauffages = async () => {
    // console.log("🏠​​ Synchronisation des chauffages...");
    try {
        // récupération des chauffages
        const chauffages = await getAllChauffagesFromApi();

        // récupération de la base de données
        const db = await getdb();

        // insertion (ou mise à jour) des chauffages
        for (const chauffage of chauffages) {
            const sqlInsert = 'INSERT OR REPLACE INTO chauffages (id, nom) VALUES (?, ?)';
            await db.runAsync(sqlInsert, [chauffage.id, chauffage.nom]);
        }

        // suppression des chauffages non présents dans l'API
        const placeholders = chauffages.map(() => '?').join(',');
        const sqlDelete = `DELETE FROM chauffages WHERE id NOT IN (${placeholders})`;
        const ids = chauffages.map(c => c.id);
        await db.runAsync(sqlDelete, ids);

        // vérification de la synchronisation
        const sqlSelect = 'SELECT * FROM chauffages';
        const chauffages_synced = await db.getAllAsync(sqlSelect);
        // console.log("👉​ Chauffages synchronisés :", chauffages_synced);

        console.log("✅​ Synchronisation des chauffages réussie !");
        return { status: true, message: "Synchronisation des chauffages réussie !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation des chauffages :", error.message);
        return { status: false, message: error.message };
    }
}

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone d'un logement
export const getPoidsCarboneLogement = async (logement_id) => {
    console.log("🏠​ Récupération du poids carbone d'un logement...");
    try {
        // récupération des paramètres du logement
        const response_logement = await getLogementById(logement_id);
        let chauffage_id, superficie_m2;
        if (response_logement.status) {
            const logement = response_logement.logement;
            chauffage_id = logement.chauffage_id;
            superficie_m2 = logement.superficie_m2;
        } else {
            throw new Error(response_logement.message);
        }

        // appel à l'API
        console.log("🌐​ Appel à l'API pour récupérer le poids carbone d'un logement...");
        // console.log("👉​ Chauffage_id :", chauffage_id);
        // console.log("👉​ Superficie_m2 :", superficie_m2);
        const response = await api.get(`/logements/co2?chauffage_id=${chauffage_id}&superficie_m2=${superficie_m2}`);

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour récupérer le poids carbone d'un logement réussi !");
        return response.data.co2;

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour récupérer le poids carbone d'un logement :", error.message);
        throw error;
    }
};