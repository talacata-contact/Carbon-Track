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
import { getActionById, getActionByReferenceId } from './actions';
import { createIteration, getIterationsPassivesByActionIdAndActionPassiveId } from './actionsIterations';
import { getReferenceByActionId } from './actionsReferences';

////////////////////////////////////////////////////////////////////////////////////
// ACTIONS PASSIVES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des actions passives
export const getAllPassiveActions = async () => {
    console.log("⚡​ Récupération des actions passives...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des actions passives
        const sql = 'SELECT * FROM actions_passives ORDER BY id DESC';
        const actions_passives = await db.getAllAsync(sql);

        // vérification des actions passives
        // console.log("👉​ Actions passives :", actions_passives.id, actions_passives);

        console.log("✅​ Actions passives récupérées avec succès !");
        return actions_passives;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des actions passives :", error.message);
        throw error;
    }
}

// GET - Récupération de toutes les actions passives d'une action
export const getAllPassiveActionsByActionId = async (action_id) => {
    console.log("⚡​ Récupération de toutes les actions passives d'une action...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des actions passives
        const sql = 'SELECT * FROM actions_passives WHERE action_id = ?';
        const actions_passives = await db.getAllAsync(sql, [action_id]);

        // vérification des actions passives
        // console.log("👉​ Actions passives :", actions_passives);

        console.log("✅​ Actions passives récupérées avec succès !");
        return actions_passives;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de toutes les actions passives d'une action :", error.message);
        throw error;
    }
}

// GET - Récupération d'une action passive par son id
export const getPassiveActionById = async (action_passive_id) => {
    console.log("⚡​ Récupération d'une action passive par son id", action_passive_id, "...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de l'action passive
        const sql = 'SELECT * FROM actions_passives WHERE id = ?';
        const action_passive = await db.getFirstAsync(sql, [action_passive_id]);

        // vérification de l'action passive
        // console.log("👉​ Action passive :", action_passive);

        // console.log("✅​ Action passive récupérée avec succès !");
        return action_passive;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une action passive par son id :", error.message);
        throw error;
    }
}

// CREATE - Création d'une action passive
export const createPassiveAction = async (action_id, params, repeat_every, repeat_unit, date_debut, date_fin = null) => {
    console.log("⚡​ Création d'une action passive...");
    try {
        // récupération de l'action
        const action = await getActionById(action_id);

        // récupération des paramètres pour l'action passive
        const params_action_passive = await getParamsActionPassive(action.categorie, params);

        // récupération de la base de données
        const db = await getdb();

        // ⚠️ Vérification des dates
        // console.log("📅 Données dates envoyées :", { date_debut, date_fin });

        if (!date_debut) {
            throw new Error("date_debut est vide ou null !");
        }

        // création de l'action passive
        const is_active = true; // par défaut, l'action passive est activée
        const sql = `
        INSERT INTO actions_passives 
            (action_id, params, is_active, repeat_every, repeat_unit, date_debut, date_fin) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const repeatEveryValue = repeat_every ?? 1; // 1 par défaut si undefined ou null
        const repeatUnitValue = repeat_unit ?? 'jours'; // 'jours' par défaut si undefined ou null

        if (date_fin == null) {
            const dateObj = new Date(date_debut);
            dateObj.setFullYear(dateObj.getFullYear() + 3);
            date_fin = dateObj.toISOString();
        }



        await db.runAsync(sql, [
            action_id,
            JSON.stringify(params_action_passive),
            is_active,
            repeatEveryValue,
            repeatUnitValue,
            date_debut,
            date_fin
        ]);

        // vérification de la création
        // const selectSql = 'SELECT * FROM actions_passives ORDER BY id DESC LIMIT 1';
        // const action_passive = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouvelle action passive :", action_passive);

        console.log("✅​ Action passive créée avec succès !");
        const response = await syncPassiveActions(); // synchronisation des actions passives
        if (!response.status) {
            throw new Error(response.message);
        }

        return { status: true, message: "Action passive créée avec succès !" };
    } catch (error) {
        console.log("❌​ Erreur lors de la création d'une action passive :", error.message);
        return { status: false, message: error.message };
    }
}

// UPDATE - Modification d'une action passive
export const updatePassiveAction = async (action_passive_id, updates) => {
    console.log("⚡​ Modification d'une action passive...");
    try {
        // vérification des modifications
        if (Object.keys(updates).length === 0) {
            throw new Error("❌​ Aucune modification apportée à l'action passive");
        }

        // récupération de la base de données
        const db = await getdb();

        // modification de l'action passive
        const fields = Object.keys(updates);
        const values = Object.values(updates).map((val, i) => {
            // si le champ est 'params', on le stringifie en JSON
            return fields[i] === "params" ? JSON.stringify(val) : val;
        });
        const setClause = fields.map((field, index) => `${field} = ?`).join(", ");

        // requête sql
        const sql = `UPDATE actions_passives SET ${setClause} WHERE id = ?`;
        await db.runAsync(sql, [...values, action_passive_id]);

        // vérification de la modification
        // const selectSql = 'SELECT * FROM actions_passives WHERE id = ?';
        // const action_passive = await db.getFirstAsync(selectSql, [action_passive_id]);
        // console.log("👉​ Action passive modifiée :", action_passive);

        console.log("✅​ Action passive modifiée avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la modification d'une action passive :", error.message);
        throw error;
    }
}

// DELETE - Suppression d'une action passive
export const deletePassiveAction = async (action_passive_id) => {
    console.log("⚡​ Suppression d'une action passive...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        // const selectSql_before = 'SELECT * FROM actions_passives WHERE id = ?';
        // const action_passive_before = await db.getFirstAsync(selectSql_before, [action_passive_id]);
        // console.log("👉​ Action passive à supprimer :", action_passive_before);

        // suppression de l'action passive
        const sql = 'DELETE FROM actions_passives WHERE id = ?';
        await db.runAsync(sql, [action_passive_id]);

        // vérification après suppression
        // const selectSql_after = 'SELECT * FROM actions_passives WHERE id = ?';
        // const action_passive_after = await db.getFirstAsync(selectSql_after, [action_passive_id]);
        // console.log("👉​ Action passive supprimée :", action_passive_after);

        console.log("✅​ Action passive supprimée avec succès !");
        return { status: true, message: "Action passive supprimée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression d'une action passive :", error.message);
        return { status: false, message: error.message };
    }
}

// SYNC - Synchronisation d'une action passive
export const syncPassiveAction = async (action_passive, absence_just_finished) => {
    console.log("⚡​ Synchronisation d'une action passive...");
    try {
        // si l'action passive est active
        if (action_passive.is_active) {
            // récupération des dates
            const now = new Date().toISOString().split('T')[0];
            const date_debut = new Date(action_passive.date_debut).toISOString().split('T')[0];
            let date_fin = null;
            if (action_passive.date_fin) {
                date_fin = new Date(action_passive.date_fin).toISOString().split('T')[0];
            }

            // récupération des éléments associés à l'action passive
            const action = await getActionById(action_passive.action_id);
            const reference = await getReferenceByActionId(action.id);
            const iterations_passives = await getIterationsPassivesByActionIdAndActionPassiveId(action.id, action_passive.id);

            // récupération de l'itération passive la plus récente
            let nextIterationDate;

            // cas d'une première itération passive : on utilise la date de début de l'action passive
            if (iterations_passives.length === 0) {
                nextIterationDate = date_debut;
                // console.log("👉 Aucune itération passive. Date de départ utilisée :", nextIterationDate);
            }

            // cas d'une itération passive existante : on récupère la date de la prochaine itération passive
            else {
                // récupération de l'itération passive la plus récente
                const most_recent_passive_iteration = getMostRecentPassiveIteration(iterations_passives);

                // récupération de la date de la prochaine itération passive
                nextIterationDate = getNextPassiveIterationDate(most_recent_passive_iteration.date, action_passive.repeat_every, action_passive.repeat_unit);

                // si l'absence vient de finir, on récupère la 1ère itération qui devait commencer après la date de fin de l'absence (= nouvelle date de début de l'action passive)
                if (absence_just_finished) {
                    while (nextIterationDate < date_debut) {
                        nextIterationDate = getNextPassiveIterationDate(nextIterationDate, action_passive.repeat_every, action_passive.repeat_unit);
                    }
                }
            }

            // création des itérations (tant que la date de la prochaine itération passive est inférieure ou égale à aujourd'hui et à la date de fin)
            while (nextIterationDate <= now && nextIterationDate <= date_fin) {
                // (si aliment, création d'une double itération : création et usage)
                if (action.categorie === 'aliment') {
                    // récupération des actions 'creation' et 'usage' associées
                    const action_creation_aliment = await getActionByReferenceId('creation', action.categorie, reference.code);
                    const action_usage_aliment = await getActionByReferenceId('usage', action.categorie, reference.code);

                    // création des itérations 'creation' et 'usage'
                    await createIteration(action_creation_aliment.id, action_passive.id, reference.code, action_passive.params, nextIterationDate);
                    await createIteration(action_usage_aliment.id, action_passive.id, reference.code, action_passive.params, nextIterationDate);
                }
                // création d'une itération
                else {
                    await createIteration(action.id, action_passive.id, reference.id, action_passive.params, nextIterationDate);
                }
                // (si la synchro ne se faite pas depuis plusieurs jours, on peut avoir plusieurs itérations passives à créer)
                nextIterationDate = getNextPassiveIterationDate(nextIterationDate, action_passive.repeat_every, action_passive.repeat_unit);
            }

            // si l'action passive est terminée : on la supprime
            if (now > date_fin && date_fin !== null) {
                const response = await deletePassiveAction(action_passive.id);
                if (!response.status) {
                    throw new Error(response.message);
                }
            }
        }

        console.log("✅​ Action passive synchronisée avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation d'une action passive :", error.message);
        throw error;
    }
}

// SYNC - Synchronisation des actions passives
export const syncPassiveActions = async () => {
    console.log("⚡​ Synchronisation des actions passives...");
    try {
        // récupération des actions passives
        const actions_passives = await getAllPassiveActions();

        // synchronisation des actions passives
        for (const action_passive of actions_passives) {
            // console.log("👉​ Action passive :", action_passive);
            await syncPassiveAction(action_passive, false);
        }

        console.log("✅​ Actions passives synchronisées avec succès !");
        return { status: true, message: "Actions passives synchronisées avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation des actions passives :", error.message);
        return { status: false, message: error.message };
    }
}

// FONCTION UTILITAIRE - Récupération des paramètres pour l'action passive
const getParamsActionPassive = async (categorie, params) => {
    console.log("⚡​ Récupération des paramètres pour l'action passive...");
    try {
        let params_action_passive;
        if (categorie === 'logement') {
            params_action_passive = {
                temp_chauffage: params.temp_chauffage
            };
        }
        else if (categorie === 'transport') {
            params_action_passive = {
                distance_km: params.distance_km
            };
        }
        else if (categorie === 'aliment') {
            params_action_passive = {
                quantity_value: params.quantity_value,
                quantity_unit: params.quantity_unit
            };
        }

        // vérification du résultat
        // console.log("👉​ Paramètres pour l'action passive :", params_action_passive);

        console.log("✅​ Paramètres pour l'action passive récupérés avec succès !");
        return params_action_passive;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des paramètres pour l'action passive :", error.message);
        throw error;
    }
}

// FONCTION UTILITAIRE - Récupération de l'itération la plus récente
const getMostRecentPassiveIteration = (iterations_passives) => {
    console.log("⚡​ Récupération de l'itération la plus récente...");
    const now = new Date();
    const most_recent_iteration = iterations_passives
        .filter(iteration => new Date(iteration.date) <= now) // exclut les itérations futures
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]; // tri pour récupérer la plus récente

    // vérification du résultat
    // console.log("👉​ Itération la plus récente :", most_recent_iteration);

    console.log("✅​ Itération la plus récente récupérée avec succès !");
    return most_recent_iteration;
}

// FONCTION UTILITAIRE - Calcul de la date de la prochaine itération passive
const getNextPassiveIterationDate = (most_recent_passive_iteration_date, repeat_every, repeat_unit) => {
    console.log("⚡​ Calcul de la date de la prochaine itération passive...");

    const nextIterationDate = new Date(most_recent_passive_iteration_date);

    // calcul de la date de la prochaine itération passive
    if (repeat_unit === 'jours') {
        nextIterationDate.setDate(nextIterationDate.getDate() + repeat_every);
    } else if (repeat_unit === 'semaines') {
        nextIterationDate.setDate(nextIterationDate.getDate() + repeat_every * 7);
    } else if (repeat_unit === 'mois') {
        nextIterationDate.setMonth(nextIterationDate.getMonth() + repeat_every);
    } else if (repeat_unit === 'années') {
        nextIterationDate.setFullYear(nextIterationDate.getFullYear() + repeat_every);
    }

    // vérification du résultat
    // console.log("👉​ Date de la prochaine itération passive :", nextIterationDate);

    console.log("✅​ Date de la prochaine itération passive calculée avec succès !");
    return nextIterationDate.toISOString().split('T')[0];
}