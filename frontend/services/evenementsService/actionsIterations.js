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
import { getPoidsCarboneAliment } from '../referencesService/aliments';
import { getLogementById, getPoidsCarboneLogement } from '../referencesService/logements';
import { getPoidsCarboneCreationTransport, getPoidsCarboneUsageTransport, getTransportById } from '../referencesService/transports';
import { getActionById, getActionByReferenceId } from './actions';
import { getReferenceByActionId } from './actionsReferences';
import { getActionUsuelleById } from './actionsUsuelles';

////////////////////////////////////////////////////////////////////////////////////
// ACTIONS ITERATIONS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de toutes les itérations
export const getAllIterations = async () => {
    console.log("⚡​ Récupération de toutes les itérations...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des itérations
        const sql = 'SELECT * FROM actions_iterations ORDER BY id DESC';
        const iterations = await db.getAllAsync(sql);

        // vérification des itérations
        // console.log("👉​ Itérations :", iterations);

        // console.log("✅​ Itérations récupérées avec succès !");
        return iterations;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de toutes les itérations :", error.message);
        throw error;
    }
}

// GET - Récupération d'une itération par son id
export const getIterationById = async (id) => {
    console.log("🔄 Récupération d'une itération par son id...");
    try {
        const db = await getdb();

        const sql = `
            SELECT ai.*, a.categorie, a.type_action, a.logement_id, a.transport_id, a.aliment_code
            FROM actions_iterations ai
            JOIN actions a ON ai.action_id = a.id
            WHERE ai.id = ?
        `;
        const iteration = await db.getFirstAsync(sql, [id]);

        if (!iteration) {
            throw new Error(`Aucune itération trouvée avec l'id ${id}`);
        }

        // Parser params JSON
        try {
            iteration.params = JSON.parse(iteration.params);
        } catch {
            console.warn("⚠ Impossible de parser params, valeur brute conservée.");
        }

        // Définir "reference_id" en fonction de la catégorie
        switch (iteration.categorie) {
            case 'logement':
                iteration.reference_id = iteration.logement_id;
                break;
            case 'transport':
                iteration.reference_id = iteration.transport_id;
                break;
            case 'aliment':
                iteration.reference_id = iteration.aliment_code;
                break;
        }

        // console.log("👉 Itération complète :", iteration);
        return { status: true, message: "Itération récupérée avec succès !", iteration };
    } catch (error) {
        console.log("❌ Erreur lors de la récupération de l'itération :", error.message);
        return { status: false, message: error.message };
    }
};

// GET - Récupération de toutes les itérations d'une action
export const getAllIterationsByActionId = async (action_id) => {
    // console.log("⚡​ Récupération de toutes les itérations d'une action...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des itérations
        const sql = 'SELECT * FROM actions_iterations WHERE action_id = ? ORDER BY id DESC';
        const iterations = await db.getAllAsync(sql, [action_id]);

        // vérification des itérations
        // console.log("👉​ Itérations :", iterations);

        // console.log("✅​ Itérations récupérées avec succès !");
        return iterations;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de toutes les itérations d'une action :", error.message);
        throw error;
    }
}

// GET - Récupération de toutes les itérations d'une action passive
export const getAllIterationsByActionPassiveId = async (action_passive_id) => {
    console.log("⚡​ Récupération de toutes les itérations d'une action passive...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des itérations
        const sql = 'SELECT * FROM actions_iterations WHERE action_passive_id = ?';
        const iterations = await db.getAllAsync(sql, [action_passive_id]);

        // vérification des itérations
        //console.log("👉​ Itérations :", iterations);

        // console.log("✅​ Itérations récupérées avec succès !");
        return iterations;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de toutes les itérations d'une action passive :", error.message);
        throw error;
    }
}

// GET - Récupération des itérations passives par l'id d'une action et d'une action passive
export const getIterationsPassivesByActionIdAndActionPassiveId = async (action_id, action_passive_id) => {
    console.log("⚡​ Récupération des itérations passives par l'id d'une action et d'une action passive...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des itérations
        const sql = 'SELECT * FROM actions_iterations WHERE action_id = ? AND action_passive_id = ?';
        const iterations_passives = await db.getAllAsync(sql, [action_id, action_passive_id]);

        // vérification des itérations
        // console.log("👉​ Itérations passives :", iterations_passives);

        console.log("✅​ Itérations passives récupérées avec succès !");
        return iterations_passives;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des itérations passives par l'id d'une action et d'une action passive :", error.message);
        throw error;
    }
}

// GET - Récupération des itérations passives d'une période donnée
export const getPassiveIterationsForPeriod = async (action_passive_id, date_debut, date_fin) => {
    console.log("⚡​ Récupération des itérations passives d'une période donnée...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des itérations passives
        const sql = 'SELECT * FROM actions_iterations WHERE action_passive_id = ? AND date >= ? AND date <= ?';
        const iterations_passives = await db.getAllAsync(sql, [action_passive_id, date_debut, date_fin]);

        // vérification des itérations
        // console.log("👉​ Itérations passives :", iterations_passives);

        console.log("✅​ Itérations passives récupérées avec succès !");
        return iterations_passives;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des itérations passives d'une période donnée :", error.message);
        throw error;
    }
}

// CREATE - Création d'une itération
export const createIteration = async (action_id, action_passive_id, reference_id, params, date) => {
    console.log("⚡​ Création d'une itération...");
    try {
        // récupération de l'action associée
        const action = await getActionById(action_id);

        // récupération de la base de données
        const db = await getdb();

        // 👉 Vérification si une itération existe déjà (uniquement pour logement)
        if (action.categorie === 'logement') {
            const checkSql = `SELECT * 
                              FROM actions_iterations 
                              WHERE action_id = ? AND date = ? 
                              LIMIT 1`;
            const existing = await db.getFirstAsync(checkSql, [action_id, date]);
            if (existing) {
                console.log("Une itération existe déjà pour ce logement et cette date :", existing);
                return existing;
            }
        }

        // récupération des paramètres pour l'itération
        const params_iteration = await getParamsIteration(action.categorie, reference_id, params);

        // calcul du poids carbone
        const co2 = await getPoidsCarboneIteration(action.type_action, action.categorie, reference_id, params_iteration);

        // création de l'itération
        const sql = 'INSERT INTO actions_iterations (action_id, action_passive_id, params, co2, date) VALUES (?, ?, ?, ?, ?)';
        await db.runAsync(sql, [action_id, action_passive_id, JSON.stringify(params_iteration), co2, date]);

        // vérification de la création
        // const selectSql = 'SELECT * FROM actions_iterations ORDER BY id DESC LIMIT 1';
        // const iteration = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouvelle itération :", iteration);

        console.log("✅​ Itération créée avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la création d'une itération :", error.message);
        throw error;
    }
};

// CREATE - Création d'une itération pour une action usuelle
export const createIterationForActionUsuelle = async (action_usuelle_id, date) => {
    console.log("⚡​ Création d'une itération pour une action usuelle...");
    try {
        // récupération de l'action usuelle
        const action_usuelle = await getActionUsuelleById(action_usuelle_id);
        // récupération de l'action associée
        const action = await getActionById(action_usuelle.action_id);
        // récupération de l'id de la référence
        const reference = await getReferenceByActionId(action.id);

        // création de l'itération
        // (si aliment, double itération création et usage)
        if (action.categorie === 'aliment') {
            const action_creation_aliment = await getActionByReferenceId('creation', action.categorie, reference.code);
            const action_usage_aliment = await getActionByReferenceId('usage', action.categorie, reference.code);
            await createIteration(action_creation_aliment.id, null, reference.code, action_usuelle.params, date);
            await createIteration(action_usage_aliment.id, null, reference.code, action_usuelle.params, date);
        } else {
            const action_passive_id = null; // pas d'action passive pour une action usuelle
            await createIteration(action.id, action_passive_id, reference.id, action_usuelle.params, date);
        }

        console.log("✅​ Itération de l'action usuelle créée avec succès !");
        return { status: true, message: "Itération de l'action usuelle créée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la création d'une itération pour une action usuelle :", error.message);
        return { status: false, message: error.message };
    }
}

// UPDATE - Modification d'une itération
export const updateIteration = async (iteration_id, type_action, action_categorie, reference_id, params, date) => {
    console.log("⚡​ Modification d'une itération...");
    try {
        // récupération des paramètres pour l'itération
        const params_iteration = await getParamsIteration(action_categorie, reference_id, params);
        // calcul du nouveau poids carbone
        const co2 = await getPoidsCarboneIteration(type_action, action_categorie, reference_id, params_iteration);

        // récupération de la base de données
        const db = await getdb();

        // modification de l'itération
        const sql = 'UPDATE actions_iterations SET params = ?, co2 = ?, date = ? WHERE id = ?';
        await db.runAsync(sql, [JSON.stringify(params_iteration), co2, date, iteration_id]);

        // vérification de la modification
        // const selectSql = 'SELECT * FROM actions_iterations WHERE id = ?';
        // const iteration = await db.getFirstAsync(selectSql, [iteration_id]);
        // console.log("👉​ Itération modifiée :", iteration);

        console.log("✅​ Itération modifiée avec succès !");
        return { status: true, message: "Itération modifiée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la modification d'une itération :", error.message);
        return { status: false, message: error.message };
    }
}

// DELETE - Suppression d'une itération
export const deleteIteration = async (iteration_id) => {
    console.log("⚡​ Suppression d'une itération...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        // const selectSql_before = 'SELECT * FROM actions_iterations WHERE id = ?';
        // const iteration_before = await db.getFirstAsync(selectSql_before, [iteration_id]);
        // console.log("👉​ Itération à supprimer :", iteration_before);

        // suppression de l'itération
        const sql = 'DELETE FROM actions_iterations WHERE id = ?';
        await db.runAsync(sql, [iteration_id]);

        // vérification après suppression
        // const selectSql_after = 'SELECT * FROM actions_iterations WHERE id = ?';
        // const iteration_after = await db.getFirstAsync(selectSql_after, [iteration_id]);
        // console.log("👉​ Itération supprimée :", iteration_after);

        console.log("✅​ Itération supprimée avec succès !");
        return { status: true, message: "Itération supprimée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression d'une itération :", error.message);
        return { status: false, message: error.message };
    }
}

// DELETE - Suppression des itérations passives d'une période donnée
export const deletePassiveIterationsForPeriod = async (action_passive_id, date_debut, date_fin) => {
    console.log("⚡​ Suppression des itérations passives d'une période donnée...");
    try {
        // récupération des itérations passives de la période donnée
        const iterations_passives = await getPassiveIterationsForPeriod(action_passive_id, date_debut, date_fin);

        // suppression des itérations passives
        for (const iteration_passive of iterations_passives) {
            const response = await deleteIteration(iteration_passive.id);
            if (!response.status) {
                throw new Error(response.message);
            }
        }

        // vérification de la suppression
        // await getPassiveIterationsForPeriod(action_passive_id, date_debut, date_fin);

        console.log("✅​ Itérations passives supprimées avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression des itérations passives d'une période donnée :", error.message);
        throw error;
    }
}

// DELETE - Suppression des itérations d'une action passive
export const deleteIterationsByActionPassiveId = async (action_passive_id) => {
    console.log("⚡​ Suppression des itérations d'une action passive...");
    try {
        // récupération des itérations d'une action passive
        const iterations = await getAllIterationsByActionPassiveId(action_passive_id);

        // suppression des itérations
        for (const iteration of iterations) {
            const response = await deleteIteration(iteration.id);
            if (!response.status) {
                throw new Error(response.message);
            }
        }

        console.log("✅​ Itérations supprimées avec succès !");
        return { status: true, message: "Itérations supprimées avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression des itérations d'une action passive :", error.message);
        return { status: false, message: error.message };
    }
}

// FONCTION UTILITAIRE - Récupération des paramètres pour créer ou modifier une itération
export const getParamsIteration = async (categorie, reference_id, params) => {
    console.log("⚡​ Récupération des paramètres pour une itération...");
    try {
        // conversion en objet avant récupération des paramètres (si besoin)
        if (typeof params === 'string') {
            params = JSON.parse(params);
        }

        let params_iteration;
        if (categorie === 'logement') {
            // si le paramètre temp_chauffage n'a pas été changé, on récupère la température de base du logement
            if (!params.temp_chauffage) {
                const response = await getLogementById(reference_id);
                if (response.status) {
                    params.temp_chauffage = response.logement.temp_chauffage || 20;
                } else {
                    throw new Error(response.message);
                }
            }
            // création des paramètres pour l'itération
            params_iteration = {
                temp_chauffage: params.temp_chauffage
            };

        } else if (categorie === 'transport') {
            // si le paramètre conso_km n'a pas été changé, on récupère la consommation de base du transport
            if (!params.conso_km) {
                const response = await getTransportById(reference_id);
                if (response.status) {
                    params.conso_km = response.transport.conso_km || 0;
                } else {
                    throw new Error(response.message);
                }
            }
            // création des paramètres pour l'itération
            params_iteration = {
                conso_km: params.conso_km,
                distance_km: params.distance_km
            };
        }

        else if (categorie === 'aliment') {
            // création des paramètres pour l'itération
            params_iteration = {
                quantity_value: params.quantity_value,
                quantity_unit: params.quantity_unit,
                code: params.code,
                product_name: params.product_name,
                marques: params.marques,
                tags: params.tags || []
            };
        }

        // vérification des paramètres
        // console.log("👉​ Paramètres pour l'itération :", params_iteration);

        console.log("✅​ Paramètres pour une itération récupérés avec succès !");
        return params_iteration;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des paramètres pour une itération :", error.message);
        throw error;
    }
}

// FONCTION UTILITAIRE - Récupération des paramètres d'une itération par son id
export const getParamsIterationById = async (iteration_id) => {
    console.log(`⚡ Récupération des paramètres pour l'itération ${iteration_id}...`);
    try {
        const { status, message, iteration } = await getIterationById(iteration_id);
        // console.log("hhhhhhh👉​ Itération récupérée :", iteration);
        if (!status) throw new Error(message);

        // Appel direct à ta fonction existante pour générer les params finaux
        return await getParamsIteration(
            iteration.categorie,
            iteration.reference_id,
            iteration.params
        );

    } catch (error) {
        console.log(`❌ Erreur lors de la récupération des paramètres de l'itération ${iteration_id} :`, error.message);
        throw error;
    }
};

// FONCTION UTILITAIRE - Affichage des paramètres pour une itération
export const printParamsIteration = (type_action, categorie, reference, params) => {
    // console.log("⚡​ Affichage des paramètres pour une itération...");

    // conversion en objet avant récupération des paramètres (si besoin)
    if (typeof params === 'string') {
        params = JSON.parse(params);
    }

    // récupération des paramètres pour une itération
    let params_iteration;
    if (categorie === 'logement') {
        params_iteration = {
            temp_chauffage: params.temp_chauffage || reference.temp_chauffage,
            co2_unit: 'kgCO2eq'
        };

    } else if (categorie === 'transport') {
        params_iteration = {
            conso_km: params.conso_km || reference.conso_km,
            distance_km: params.distance_km,
            co2_unit: 'kgCO2eq'
        };

    } else if (categorie === 'aliment') {
        params_iteration = {
            quantity_value: params.quantity_value,
            quantity_unit: params.quantity_unit,
            co2_unit: type_action === 'creation' ? 'kgCO2eq' : 'gCO2eq'
        };
    }

    // vérification des paramètres
    // console.log("👉​ Paramètres :", params_iteration);

    // console.log("✅​ Paramètres affichés avec succès !");
    return params_iteration;
}

// FONCTION UTILITAIRE - Calcul du poids carbone d'une itération
const getPoidsCarboneIteration = async (type_action, categorie, reference_id, params) => {
    console.log("⚡​ Calcul du poids carbone d'une itération...");
    try {
        let co2;
        if (type_action === 'creation') {
            // récupération du poids carbone de la création
            if (categorie === 'transport') {
                co2 = await getPoidsCarboneCreationTransport(reference_id);
            } else if (categorie === 'logement') {
                co2 = null;
            } else if (categorie === 'aliment') {
                co2 = await getPoidsCarboneAliment(type_action, reference_id, params.quantity_value, params.quantity_unit);
            }

        } else if (type_action === 'usage') {
            // récupération du poids carbone de l'usage
            if (categorie === 'transport') {
                co2 = await getPoidsCarboneUsageTransport(reference_id, params.distance_km);
            } else if (categorie === 'logement') {
                co2 = await getPoidsCarboneLogement(reference_id);
            } else if (categorie === 'aliment') {
                co2 = await getPoidsCarboneAliment(type_action, reference_id, params.quantity_value, params.quantity_unit);
            }
        }

        // vérification du résultat
        // console.log("👉​ Poids carbone de l'itération :", co2);

        console.log("✅​ Poids carbone de l'itération calculé avec succès !");
        return co2;

    } catch (error) {
        console.log("❌​ Erreur lors du calcul du poids carbone d'une itération :", error.message);
        throw error;
    }
}