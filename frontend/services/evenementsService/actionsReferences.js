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
import { updateAction } from '@/services/evenementsService/actions';
import { createAliment, deleteAliment, getAlimentByCode } from '../referencesService/aliments';
import { createLogement, deleteLogement, getLogementById, updateLogement } from '../referencesService/logements';
import { createTransport, deleteTransport, getTransportById, updateTransport } from '../referencesService/transports';
import { getActionById, getActionByReferenceId } from './actions';
import { getAllIterationsByActionId, updateIteration } from './actionsIterations';

////////////////////////////////////////////////////////////////////////////////////
// ACTIONS RÉFÉRENCES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération d'une référence par l'id d'une action
export const getReferenceByActionId = async (action_id) => {
    // console.log("⚡​ Récupération d'une référence par l'id d'une action...");
    try {
        // récupération de l'action
        const action = await getActionById(action_id);

        // récupération de la référence
        let reference;
        if (action.categorie === 'logement') {
            const response = await getLogementById(action.logement_id);
            if (response.status) {
                reference = response.logement;
            } else {
                throw new Error(response.message);
            }
        } else if (action.categorie === 'transport') {
            const response = await getTransportById(action.transport_id);
            if (response.status) {
                reference = response.transport;
            } else {
                throw new Error(response.message);
            }
        } else if (action.categorie === 'aliment') {
            reference = await getAlimentByCode(action.aliment_code);
        }

        // vérification de la récupération
        // console.log("👉​ Référence :", reference);

        // console.log("✅​ Référence récupérée avec succès !");
        return reference;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une référence par l'id d'une action :", error.message);
        throw error;
    }
}

// GET - Récupération d'une référence à partir d'une action
export const getReferenceByAction = async (action) => {
    console.log("⚡​ Récupération d'une référence à partir d'une action...");
    try {
        if (!action) {
            throw new Error("Action non fournie en paramètre !");
        }
        // console.log("👉​ Action :", action, '  action ID :', action.id);

        // récupération de la référence selon la catégorie
        let reference;
        if (action.categorie === 'logement') {
            const response = await getLogementById(action.logement_id);
            if (response.status) {
                reference = response.logement;
            } else {
                throw new Error(response.message);
            }
        } else if (action.categorie === 'transport') {
            const response = await getTransportById(action.transport_id);
            if (response.status) {
                reference = response.transport;
            } else {
                throw new Error(response.message);
            }
        } else if (action.categorie === 'aliment') {
            reference = await getAlimentByCode(action.aliment_code);
        }

        // vérification de la récupération
        // console.log("👉​ Référence :", reference);

        // console.log("✅​ Référence récupérée avec succès !");
        return reference;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une référence à partir d'une action :", error.message);
        throw error;
    }
};

// GET - Récupération d'une référence par l'id
export const getReferenceById = async (categorie, reference_id) => {
    // console.log("⚡​ Récupération d'une référence par l'id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de la référence
        let sql;
        if (categorie === 'logement') {
            sql = 'SELECT * FROM logements WHERE id = ?';
        } else if (categorie === 'transport') {
            sql = 'SELECT * FROM transports WHERE id = ?';
        } else if (categorie === 'aliment') {
            sql = 'SELECT * FROM aliments WHERE code = ?';
        }
        const reference = await db.getFirstAsync(sql, [reference_id]);

        // vérification de la récupération
        // console.log("👉​ Référence :", reference);

        // console.log("✅​ Référence récupérée avec succès !");
        return reference;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une référence par l'id :", error.message);
        throw error;
    }
}

// CREATE - Création d'une référence
export const createReference = async (categorie, type_action, params) => {
    console.log("⚡​ Création d'une référence...");
    try {
        let reference;

        // récupération du is_favori
        const is_favori = getIsFavori(type_action);

        if (categorie === 'logement') {
            reference = await createLogement(params.nom, params.chauffage_id, params.superficie_m2, params.temp_chauffage, is_favori);

        } else if (categorie === 'transport') {
            reference = await createTransport(params.nom, params.categorie_id, params.conso_km, is_favori);

        } else if (categorie === 'aliment') {
            reference = await createAliment(params.code, params.product_name, params.marques, params.tags, false);
        }

        // vérification de la création
        // console.log("👉​ Référence créée :", reference);

        console.log("✅​ Référence créée avec succès !");
        return reference;

    } catch (error) {
        console.log("❌​ Erreur lors de la création de la référence :", error.message);
        throw error;
    }
}

// UPDATE - Modification d'une référence (logement ou transport)
export const updateReference = async (categorie, reference_id, params, date_creation, is_favori) => {
    console.log("⚡ Modification d'une référence...");
    try {
        // 1️⃣ Modification de la référence
        if (categorie === 'logement') {
            await updateLogement(reference_id, params);
        } else if (categorie === 'transport') {
            await updateTransport(reference_id, params);
        }
        console.log(`✅ Référence ${categorie} mise à jour`);

        // 2️⃣ Mise à jour du nom des actions creation si la référence est dans les favoris
        if (is_favori) {
            const action_creation = await getActionByReferenceId('creation', categorie, reference_id);
            if (action_creation) {
                // Mettre à jour l'action creation elle-même
                await updateAction(action_creation.id, 'creation', categorie, reference_id);

                // ⚡ Mettre à jour la date de l'itération creation associée
                const iterations_creation = await getAllIterationsByActionId(action_creation.id);
                for (const iteration of iterations_creation) {
                    await updateIteration(
                        iteration.id,
                        action_creation.type_action,
                        action_creation.categorie,
                        reference_id,
                        iteration.params,
                        date_creation       // nouvelle date
                    );
                }

                console.log("✅ Action creation et sa date mises à jour");
            }
        }
        const action_usage = await getActionByReferenceId('usage', categorie, reference_id);
        if (action_usage) {
            // Mettre à jour l'action usage elle-même
            await updateAction(action_usage.id, 'usage', categorie, reference_id);

            // ⚡ Mettre à jour la date des itérations usage associées
            const iterations_usage = await getAllIterationsByActionId(action_usage.id);
            for (const iteration of iterations_usage) {
                await updateIteration(
                    iteration.id,
                    action_usage.type_action,
                    action_usage.categorie,
                    reference_id,
                    iteration.params,
                    date_creation       // nouvelle date
                );
            }

        }

        return { status: true, message: "Référence modifiée avec succès !" };

    } catch (error) {
        console.log("❌ Erreur lors de la modification de la référence :", error.message);
        return { status: false, message: error.message };
    }
};

// UPDATE - Mise du référence en non favori
export const putReferenceToNotFavori = async (categorie, reference_id) => {
    console.log("⚡​ Mise du référence en non favori...");
    try {
        // modification de la référence
        if (categorie === 'logement') {
            await updateLogement(reference_id, { is_favori: false });
        } else if (categorie === 'transport') {
            await updateTransport(reference_id, { is_favori: false });
        }

        console.log("✅​ Référence mise en non favori avec succès !");
        return { status: true, message: "Référence mise en non favori avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la mise en non favori de la référence :", error.message);
        return { status: false, message: error.message };
    }
}

// DELETE - Suppression d'une référence
export const deleteReference = async (reference_id, categorie) => {
    console.log("⚡​ Suppression d'une référence...");
    try {
        // vérification avant suppression
        // const reference_before = await getReferenceById(categorie, reference_id);
        // console.log("👉​ Référence à supprimer :", reference_before);

        // suppression de la référence
        if (categorie === 'logement') {
            await deleteLogement(reference_id);
        } else if (categorie === 'transport') {
            await deleteTransport(reference_id);
        } else if (categorie === 'aliment') {
            await deleteAliment(reference_id);
        }

        // vérification après suppression
        // const reference_after = await getReferenceById(categorie, reference_id);
        // console.log("👉​ Référence supprimée :", reference_after);

        console.log("✅​ Référence supprimée avec succès !");
        return { status: true, message: "Référence supprimée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression d'une référence :", error.message);
        return { status: false, message: error.message };
    }
}

// FONCTION UTILITAIRE - Récupération du is_favori pour une référence
const getIsFavori = (type_action) => {
    let is_favori = false;
    if (type_action === 'creation') { is_favori = true; }
    return is_favori;
}

// FONCTION UTILITAIRE - Affichage des paramètres d'une référence
export const printParamsReference = (categorie, reference) => {
    console.log("⚡​ Affichage des paramètres d'une référence...");

    // récupération des paramètres d'une référence
    let params_reference;
    if (categorie === 'logement') {
        params_reference = {
            chauffage_id: reference.chauffage_id,
            superficie_m2: reference.superficie_m2,
            temp_chauffage: reference.temp_chauffage
        };
    } else if (categorie === 'transport') {
        params_reference = {
            categorie_id: reference.categorie_id,
            conso_km: reference.conso_km
        };
    } else if (categorie === 'aliment') {
        params_reference = {
            code: reference.code,
            product_name: reference.nom || reference.product_name || "N/A",
            marques: reference.marques || "N/A",
            tags: reference.tags || [],
        };
    }

    // vérification des paramètres
    // console.log("👉​ Paramètres :", params_reference);

    // console.log("✅​ Paramètres affichés avec succès !");
    return params_reference;
}