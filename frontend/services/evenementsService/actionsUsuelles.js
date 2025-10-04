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
// ACTIONS USUELLES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des actions usuelles
export const getAllActionsUsuelles = async () => {
    console.log("⚡​ Récupération des actions usuelles...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des actions usuelles
        const sql = 'SELECT * FROM actions_usuelles';
        const actions_usuelles = await db.getAllAsync(sql);

        // vérification des actions usuelles
        // console.log("👉​ Actions usuelles :", actions_usuelles);

        console.log("✅​ Actions usuelles récupérées avec succès !");
        return { status: true, message: "Actions usuelles récupérées avec succès !", actions_usuelles: actions_usuelles };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des actions usuelles :", error.message);
        return { status: false, message: error.message };
    }
}

// GET - Récupération d'une action usuelle par son id
export const getActionUsuelleById = async (action_usuelle_id) => {
    console.log("⚡​ Récupération d'une action usuelle par son id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de l'action
        const sql = 'SELECT * FROM actions_usuelles WHERE id = ?';
        const action_usuelle = await db.getFirstAsync(sql, [action_usuelle_id]);

        // vérification de la récupération
        // console.log("👉​ Action usuelle :", action_usuelle);

        console.log("✅​ Action usuelle récupérée avec succès !");
        return action_usuelle;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une action usuelle par son id :", error.message);
        throw error;
    }
}

// GET - Récupération d'une action usuelle par l'id d'une action
export const getActionUsuelleByActionId = async (action_id) => {
    console.log("⚡​ Récupération d'une action usuelle par l'id d'une action...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de l'action usuelle
        const sql = 'SELECT * FROM actions_usuelles WHERE action_id = ?';
        const action_usuelle = await db.getFirstAsync(sql, [action_id]);

        // vérification de la récupération
        // console.log("👉​ Action usuelle :", action_usuelle);

        console.log("✅​ Action usuelle récupérée avec succès !");
        return action_usuelle;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une action usuelle par l'id d'une action :", error.message);
        throw error;
    }
}

// CREATE - Création d'une action usuelle
export const createActionUsuelle = async (action_id, num_icone, nom, params) => {
    console.log("⚡​ Création d'une action usuelle...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // création de l'action
        const sql = 'INSERT INTO actions_usuelles (action_id, num_icone, nom, params) VALUES (?, ?, ?, ?)';
        await db.runAsync(sql, [action_id, num_icone, nom, JSON.stringify(params)]);

        // vérification de la création
        // const selectSql = 'SELECT * FROM actions_usuelles ORDER BY id DESC LIMIT 1';
        // const action_usuelle = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouvelle action usuelle :", action_usuelle);

        console.log("✅​ Action usuelle créée avec succès !");
        return { status: true, message: "Action usuelle créée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la création d'une action usuelle :", error.message);
        return { status: false, message: error.message };
    }
}

// UPDATE - Modification d'une action usuelle
export const updateActionUsuelle = async (action_usuelle_id, updates) => {
    console.log("⚡​ Modification d'une action usuelle...");
    try {
        if (Object.keys(updates).length === 0) {
            throw new Error("❌​ Aucune modification apportée à l'action usuelle");
        }

        // récupération de la base de données
        const db = await getdb();

        // modification de l'action usuelle
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = ?`).join(", ");

        // requête sql
        const sql = `UPDATE actions_usuelles SET ${setClause} WHERE id = ?`;
        await db.runAsync(sql, [...values, action_usuelle_id]);

        // vérification de la modification
        // const selectSql = 'SELECT * FROM actions_usuelles WHERE id = ?';
        // const action_usuelle = await db.getFirstAsync(selectSql, [action_usuelle_id]);
        // console.log("👉​ Action usuelle modifiée :", action_usuelle);

        console.log("✅​ Action usuelle modifiée avec succès !");
        return { status: true, message: "Action usuelle modifiée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la modification de l'action usuelle :", error.message);
        return { status: false, message: error.message };
    }
};

// DELETE - Suppression d'une action usuelle
export const deleteActionUsuelle = async (action_usuelle_id) => {
    console.log("⚡​ Suppression d'une action usuelle...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        // const selectSql_before = 'SELECT * FROM actions_usuelles WHERE id = ?';
        // const action_usuelle_before = await db.getFirstAsync(selectSql_before, [action_usuelle_id]);
        // console.log("👉​ Action usuelle à supprimer :", action_usuelle_before);

        // suppression de l'action
        const sql = 'DELETE FROM actions_usuelles WHERE id = ?';
        await db.runAsync(sql, [action_usuelle_id]);

        // vérification après suppression
        // const selectSql_after = 'SELECT * FROM actions_usuelles WHERE id = ?';
        // const action_usuelle_after = await db.getFirstAsync(selectSql_after, [action_usuelle_id]);
        // console.log("👉​ Action usuelle supprimée :", action_usuelle_after);

        console.log("✅​ Action usuelle supprimée avec succès !");
        return { status: true, message: "Action usuelle supprimée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression d'une action usuelle :", error.message);
        return { status: false, message: error.message };
    }
}

// FONCTION UTILITAIRE - Vérification de la possibilité de créer une action usuelle
export const isPossibleToCreateActionUsuelle = async () => {
    console.log("⚡​ Vérification de la possibilité de créer une action usuelle...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération du nombre d'actions usuelles
        const sql = 'SELECT COUNT(*) FROM actions_usuelles';
        const nb_actions_usuelles = await db.getFirstAsync(sql);

        // vérification du nombre d'actions usuelles
        // console.log("👉​ Nombre d'actions usuelles :", nb_actions_usuelles['COUNT(*)']);

        if (nb_actions_usuelles['COUNT(*)'] >= 4) {
            console.log("❌​ Le nombre d'actions usuelles est limité à 4 !");
            return { status: true, message: "Le nombre d'actions usuelles est limité à 4 !", is_possible: false };
        }
        else {
            console.log("✅​ Il est possible de créer une action usuelle !");
            return { status: true, message: "Il est possible de créer une action usuelle !", is_possible: true };
        }

    } catch (error) {
        console.log("❌​ Erreur lors de la vérification de la possibilité de créer une action usuelle :", error.message);
        return { status: false, message: error.message };
    }
}