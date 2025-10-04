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
import { getAlimentByCode } from '../referencesService/aliments';
import { getLogementById } from '../referencesService/logements';
import { getTransportById } from '../referencesService/transports';
import { getAllIterationsByActionId } from './actionsIterations';

////////////////////////////////////////////////////////////////////////////////////
// ACTIONS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de toutes les actions d'une catégorie
export const getAllActionsByCategorie = async (categorie) => {
    // console.log("⚡​ Récupération de toutes les actions d'une catégorie...");
    try {
        const db = await getdb();
        const sql = 'SELECT * FROM actions WHERE categorie = ? ORDER BY id DESC';
        const actions = await db.getAllAsync(sql, [categorie]);
        // console.log("👉​ Actions :", actions);
        // console.log("✅​ Actions récupérées avec succès !");
        return actions;
    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de toutes les actions d'une catégorie :", error.message);
        throw error;
    }
}

// GET - Récupération de toutes les actions d'une référence
export const getAllActionsByTypeAndReferenceId = async (type_action, categorie, reference_id) => {
    // console.log("⚡​ Récupération de toutes les actions d'une référence...");
    try {
        const db = await getdb();
        let sql;
        if (categorie === 'logement') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND logement_id = ?';
        } else if (categorie === 'transport') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND transport_id = ?';
        } else if (categorie === 'aliment') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND aliment_code = ?';
        }
        const actions = await db.getAllAsync(sql, [type_action, reference_id]);
        // console.log("👉​ Actions :", actions);
        // console.log("✅​ Actions récupérées avec succès !");
        return actions;
    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de toutes les actions d'une référence :", error.message);
        throw error;
    }
}

// GET - Récupération d'une action par son id
export const getActionById = async (id) => {
    // console.log("⚡​ Récupération d'une action par son id...");
    try {
        const db = await getdb();
        const sql = 'SELECT * FROM actions WHERE id = ?';
        const action = await db.getFirstAsync(sql, [id]);
        // console.log("👉​ Action :", action);
        // console.log("✅​ Action récupérée avec succès !");
        return action;
    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une action par son id :", error.message);
        throw error;
    }
}

// GET - Récupération d'une action par l'id d'une référence
export const getActionByReferenceId = async (type_action, categorie, reference_id) => {
    // console.log("⚡​ Récupération d'une action par l'id d'une référence...");
    try {
        const db = await getdb();
        let sql;
        if (categorie === 'logement') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND logement_id = ?';
        } else if (categorie === 'transport') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND transport_id = ?';
        } else if (categorie === 'aliment') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND aliment_code = ?';
        }
        const action = await db.getFirstAsync(sql, [type_action, reference_id]);
        // console.log("👉​ Action :", action);
        // console.log("✅​ Action récupérée avec succès !");
        return action;
    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une action par l'id d'une référence :", error.message);
        throw error;
    }
}

// CREATE - Création d'une action
export const createAction = async (type_action, categorie, reference_id) => {
    // console.log("⚡​ Création d'une action...");
    try {
        const { logement_id, transport_id, aliment_code } = getReferencesIds(categorie, reference_id);
        const name = await getActionName(type_action, categorie, logement_id, transport_id, aliment_code);
        const db = await getdb();
        const sql = 'INSERT INTO actions (nom, type_action, categorie, logement_id, transport_id, aliment_code) VALUES (?, ?, ?, ?, ?, ?)';
        await db.runAsync(sql, [name, type_action, categorie, logement_id, transport_id, aliment_code]);
        const selectSql = 'SELECT * FROM actions ORDER BY id DESC LIMIT 1';
        const action = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouvelle action :", action);
        // console.log("✅​ Action créée avec succès !");
        return action;
    } catch (error) {
        console.log("❌​ Erreur lors de la création de l'action :", error.message);
        throw error;
    }
};

// UPDATE - Modification d'une action (uniquement le nom)
export const updateAction = async (action_id, type_action, categorie, reference_id) => {
    console.log("⚡ Modification d'une action...");
    try {
        const { logement_id, transport_id, aliment_code } = getReferencesIds(categorie, reference_id);
        const name = await getActionName(type_action, categorie, logement_id, transport_id, aliment_code);
        const db = await getdb();
        const sql = 'UPDATE actions SET nom = ? WHERE id = ?';
        await db.runAsync(sql, [name, action_id]);
        const selectSql = 'SELECT * FROM actions WHERE id = ?';
        const action = await db.getFirstAsync(selectSql, [action_id]);
        // console.log("👉 Action modifiée :", action);
        console.log("✅ Action modifiée avec succès !");
        return { status: true, message: "Action modifiée avec succès !", action };
    } catch (error) {
        console.log("❌ Erreur lors de la modification de l'action :", error.message);
        return { status: false, message: error.message };
    }
};

// DELETE - Suppression d'une action
export const deleteAction = async (action_id, type_action) => {
    console.log("⚡​ Suppression d'une action...");
    try {
        const db = await getdb();
        // const selectSql_before = 'SELECT * FROM actions WHERE id = ?';
        // const action_before = await db.getFirstAsync(selectSql_before, [action_id]);
        // console.log("👉​ Action à supprimer :", action_before);
        const sql = 'DELETE FROM actions WHERE id = ?';
        await db.runAsync(sql, [action_id]);
        // const selectSql_after = 'SELECT * FROM actions WHERE id = ?';
        // const action_after = await db.getFirstAsync(selectSql_after, [action_id]);
        // console.log("👉​ Action supprimée :", action_after);
        // ... le reste du code reste inchangé
        console.log("✅​ Action supprimée avec succès !");
        return { status: true, message: "Action supprimée avec succès !" };
    } catch (error) {
        console.log("❌​ Erreur lors de la suppression de l'action :", error.message);
        return { status: false, message: error.message };
    }
}

// FONCTION UTILITAIRE - Récupération du nom d'une action
const getActionName = async (type_action, categorie, logement_id, transport_id, aliment_code) => {
    // console.log("⚡​ Récupération du nom d'une action...");
    try {
        let name = '';
        if (categorie === 'logement') {
            if (type_action === 'creation') { name = 'Ajout d\'un logement'; }
            else if (type_action === 'usage') { name = 'Utilisation du chauffage'; }
            const response = await getLogementById(logement_id);
            if (response.status) {
                const logement = response.logement;
                if (logement.nom) { name += ' - ' + logement.nom; }
            } else { throw new Error(response.message); }
        }
        else if (categorie === 'transport') {
            if (type_action === 'creation') { name = 'Fabrication d\'un transport'; }
            else if (type_action === 'usage') { name = 'Déplacement en transport'; }
            const response = await getTransportById(transport_id);
            if (response.status) {
                const transport = response.transport;
                if (transport.nom) { name += ' - ' + transport.nom; }
            } else { throw new Error(response.message); }
        }
        else if (categorie === 'aliment') {
            if (type_action === 'creation') { name = 'Production d\'un aliment'; }
            else if (type_action === 'usage') { name = 'Consommation d\'un aliment'; }
            const aliment = await getAlimentByCode(aliment_code);
            if (aliment.nom) { name += ' - ' + aliment.nom; }
        }
        // console.log("👉​ Nom :", name);
        // console.log("✅​ Nom récupéré avec succès !");
        return name;
    } catch (error) {
        console.log("❌​ Erreur lors de la récupération du nom d'une action :", error.message);
        throw error;
    }
}

// FONCTION UTILITAIRE - Récupération des références pour une action
const getReferencesIds = (categorie, reference_id) => {
    // console.log("⚡​ Récupération des références pour une action...");
    let logement_id = null, transport_id = null, aliment_code = null;
    if (categorie === 'logement') { logement_id = reference_id; }
    else if (categorie === 'transport') { transport_id = reference_id; }
    else if (categorie === 'aliment') { aliment_code = reference_id; }
    // console.log("👉​ Références :", { logement_id, transport_id, aliment_code });
    // console.log("✅​ Références récupérées avec succès !");
    return { logement_id, transport_id, aliment_code };
}

// FONCTION UTILITAIRE - Récupération de la date de création d'une action
export const getActionCreationDate = async (action) => {
    // console.log("⚡​ Récupération de la date de création d'une action...", action);
    try {
        const db = await getdb();
        let sql, action_creation;
        if (action.categorie === 'aliment') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND categorie = ? AND logement_id IS NULL AND transport_id IS NULL AND aliment_code = ?';
            action_creation = await db.getFirstAsync(sql, ['creation', action.categorie, action.aliment_code]);
        } else if (action.categorie === 'logement') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND categorie = ? AND logement_id = ? AND transport_id IS NULL AND aliment_code IS NULL';
            action_creation = await db.getFirstAsync(sql, ['creation', action.categorie, action.logement_id]);
        } else if (action.categorie === 'transport') {
            sql = 'SELECT * FROM actions WHERE type_action = ? AND categorie = ? AND logement_id IS NULL AND transport_id = ? AND aliment_code IS NULL';
            action_creation = await db.getFirstAsync(sql, ['creation', action.categorie, action.transport_id]);
        }
        // console.log("👉​ Action de création :", action_creation);
        if (action_creation == null) {
            if (action.categorie === 'aliment') {
                sql = 'SELECT * FROM actions WHERE type_action = ? AND categorie = ? AND logement_id IS NULL AND transport_id IS NULL AND aliment_code = ?';
                action_creation = await db.getFirstAsync(sql, ['usage', action.categorie, action.aliment_code]);
            } else if (action.categorie === 'logement') {
                sql = 'SELECT * FROM actions WHERE type_action = ? AND categorie = ? AND logement_id = ? AND transport_id IS NULL AND aliment_code IS NULL';
                action_creation = await db.getFirstAsync(sql, ['usage', action.categorie, action.logement_id]);
            } else if (action.categorie === 'transport') {
                sql = 'SELECT * FROM actions WHERE type_action = ? AND categorie = ? AND logement_id IS NULL AND transport_id = ? AND aliment_code IS NULL';
                action_creation = await db.getFirstAsync(sql, ['usage', action.categorie, action.transport_id]);
            }
        }
        const iterations_creation = await getAllIterationsByActionId(action_creation.id);
        const oldest_iteration = iterations_creation.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        const date_creation = oldest_iteration.date;
        // console.log("👉​ Date de création :", date_creation);
        // console.log("✅​ Date de création récupérée avec succès !");
        return date_creation;
    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de la date de création d'une action :", error.message);
        throw error;
    }
}

// FONCTION UTILITAIRE - Récupération du co2 total d'une action
export const getActionCo2Total = (action, iterations) => {
    // console.log("⚡​ Récupération du co2 total d'une action...");
    let co2_total = 0;
    let co2_total_unit = 'kgCO2eq';
    for (const iteration of iterations) {
        co2_total += iteration.co2;
    }
    if (action.categorie === 'aliment' && action.type_action === 'usage') {
        if (co2_total > 1000) { // si co2_total > 1kgCO2eq
            co2_total = co2_total / 1000; // conversion des gCO2eq en kgCO2eq
        } else {
            co2_total_unit = 'gCO2eq';
        }
    }
    co2_total = Math.round(co2_total * 100) / 100;
    // console.log("👉​ Co2 total :", co2_total);
    // console.log("👉​ Co2 total unit :", co2_total_unit);
    // console.log("✅​ Co2 total récupéré avec succès !");
    return { co2_total, co2_total_unit };
}
