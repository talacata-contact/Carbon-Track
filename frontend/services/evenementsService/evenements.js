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

import { createAliment, getAlimentByCode } from '../referencesService/aliments';
import { createLogement, getLogementNonFavorisByChauffageIdAndSuperficie } from '../referencesService/logements';
import { createTransport, getTransportNonFavorisByCategorieId } from '../referencesService/transports';
import { getAbsenceByActionPassiveId } from '../utilisateurService/absences';
import { createAction, getActionById, getActionByReferenceId, getActionCo2Total, getActionCreationDate, getAllActionsByCategorie } from './actions';
import { createIteration, getAllIterations, getAllIterationsByActionId, printParamsIteration } from './actionsIterations';
import { createPassiveAction, getAllPassiveActions, getAllPassiveActionsByActionId } from './actionsPassives';
import { createReference, getReferenceByActionId, printParamsReference } from './actionsReferences';
import { getActionUsuelleByActionId } from './actionsUsuelles';

////////////////////////////////////////////////////////////////////////////////////
// ÉVÉNEMENTS
////////////////////////////////////////////////////////////////////////////////////

// PRINT - Affichage de tous les événements
export const printAllEvents = async (period) => {
    // console.log("⚡​ Affichage de tous les événements...");
    try {
        // récupération de toutes les itérations
        const iterations = await getAllIterations();

        if (!iterations || iterations.length === 0) {
            return { status: true, message: "Aucun événement trouvé", events: [], total_co2_by_categorie: {} };
        }

        // récupération de tous les événements en parallèle
        const events = await Promise.all(
            iterations.map(async (iteration) => {
                try {
                    // récupération de l'action associée
                    const action = await getActionById(iteration.action_id);

                    // récupération de la référence associée
                    const reference = await getReferenceByActionId(action.id);
                    // console.log(`🔍 Action ${action.id} (${action.type_action}) - Référence ${reference.id || reference.code} récupérée`);

                    // récupération des paramètres de l'événement
                    const params = printEventParams(
                        action.type_action,
                        action.categorie,
                        reference,
                        JSON.parse(iteration.params)
                    );

                    return {
                        action_id: action.id,
                        type_action: action.type_action,
                        action_categorie: action.categorie,
                        action_nom: action.nom,
                        params,
                        co2: iteration.co2,
                        date: iteration.date
                    };
                } catch (err) {
                    // console.warn("⚠️ Erreur sur une itération :", err.message);
                    return null; // On ignore l'événement si problème
                }
            })
        );

        // suppression des événements null
        let filteredEvents = events.filter(Boolean);

        // console.log(`📋 ${filteredEvents.length} événements avant filtrage période`);

        // filtrage des événements par période
        filteredEvents = filterEventsByPeriod(filteredEvents, period);
        // console.log(`⏳ ${filteredEvents.length} événements après filtrage période (${period})`);

        // tri des événements par date
        filteredEvents = sortEventsByDate(filteredEvents);

        // calcul du poids carbone total par catégorie (arrondi à 2 décimales)
        const total_co2_by_categorie = calculateTotalCo2ForCategorie(filteredEvents);

        // logs finaux
        // console.log("👉 Événements :", filteredEvents);
        // console.log("🌍 Totaux CO2 :", total_co2_by_categorie);

        // console.log("✅ Événements affichés avec succès !");
        return {
            status: true,
            message: "Événements affichés avec succès !",
            events: filteredEvents,
            total_co2_by_categorie
        };

    } catch (error) {
        // console.log("❌ Erreur lors de l'affichage de tous les événements :", error.message);
        return { status: false, message: error.message, events: [], total_co2_by_categorie: {} };
    }
};


// PRINT - Affichage de tous les événements d'une catégorie
export const printAllEventsByCategorie = async (categorie, period, seuil_co2, objectif) => {
    // console.log("⚡​ Affichage de tous les événements d'une catégorie...");
    try {
        // récupération de toutes les actions d'une catégorie
        const actions = await getAllActionsByCategorie(categorie);

        // récupération des informations de tous les événements
        let events = [];
        for (const action of actions) {
            try {
                const reference = await getReferenceByActionId(action.id); // récupération de la référence associée
                const iterations = await getAllIterationsByActionId(action.id);

                for (const iteration of iterations) {
                    try {
                        const params = printEventParams(action.type_action, action.categorie, reference, JSON.parse(iteration.params)); // récupération des paramètres de l'événement
                        events.push({ iterId: iteration.id, action_id: action.id, type_action: action.type_action, action_categorie: action.categorie, action_nom: action.nom, params: params, co2: iteration.co2, date: iteration.date });
                    } catch (err) {
                        // console.warn("⚠️ Erreur sur une itération :", err.message);
                        // On ignore l'itération si problème
                    }
                }
            } catch (err) {
                // console.warn("⚠️ Erreur sur une action :", err.message);
                // On ignore l'action si problème
            }
        }

        // suppression des événements null
        events = events.filter(Boolean);

        // filtrage des événements par période
        events = filterEventsByPeriod(events, period);

        // filtrage des événements par seuil de poids carbone
        events = filterEventsByCo2(events, seuil_co2, objectif);

        // tri des événements par date
        events = sortEventsByDate(events);

        // vérification des événements
        // console.log("👉​ Événements d'une catégorie :", events);

        // console.log("✅​ Événements d'une catégorie affichés avec succès !");
        return { status: true, message: "Événements d'une catégorie affichés avec succès !", events: events };

    } catch (error) {
        console.log("❌​ Erreur lors de l'affichage de tous les événements d'une catégorie :", error.message);
        return { status: false, message: error.message };
    }
}

// PRINT - Affichage de tous les événements d'une action
export const printAllEventsByActionId = async (action_id) => {
    // console.log("⚡​ Affichage de tous les événements d'une action...");
    try {
        // récupération de l'action
        const action = await getActionById(action_id);
        // console.log('>>>>> action', action)
        // récupération de la référence
        const reference = await getReferenceByActionId(action_id);
        // console.log('>>>>> ref', reference)
        // récupération des itérations
        const iterations = await getAllIterationsByActionId(action_id);
        // console.log('>>>>> iter', iterations)
        // récupération de l'action usuelle
        const action_usuelle = await getActionUsuelleByActionId(action_id);
        // console.log('>>>>> usuelle', action_usuelle)

        // filtrage des itérations par période
        const iterations_filtered = filterEventsByPeriod(iterations, 'Depuis le début');
        // console.log('>>>>> iter filtre', iterations_filtered)

        // récupération des détails de l'action
        const { co2_total, co2_total_unit } = getActionCo2Total(action, iterations_filtered);
        const action_details = {
            action_id: action.id,
            type_action: action.type_action,
            action_categorie: action.categorie,
            action_nom: action.nom,
            reference_id: reference?.id || reference?.code || null,
            reference_nom: reference?.nom || null,
            reference_is_favori: reference?.is_favori || false,
            action_usuelle_id: action_usuelle?.id || null,
            action_usuelle_num_icone: action_usuelle?.num_icone || null,
            actions_passives_ids: (await getAllPassiveActionsByActionId(action.id)).map(a => a.id),
            params: reference ? printParamsReference(action.categorie, reference) : {},
            date_creation: reference ? await getActionCreationDate(action) : null,
            co2_total: co2_total,
            co2_total_unit: co2_total_unit
        };

        // récupération des détails de chaque itération
        let iterations_details = [];
        for (const iteration of iterations_filtered) {
            const params = printParamsIteration(action.type_action, action.categorie, reference, JSON.parse(iteration.params));
            iterations_details.push({
                iteration_id: iteration.id,
                action_passive_id: iteration.action_passive_id,
                date: iteration.date,
                co2: iteration.co2,
                params: params
            });
        }
        // console.log('>>>>> iter detail', iterations_details)

        // tri des itérations par date
        iterations_details = sortEventsByDate(iterations_details);

        // console.log("👉​ Événements de l'action :", action_details);
        // console.log("👉​ Itérations de l'action :", iterations_details);

        console.log("✅​ Événements d'une action affichés avec succès !");
        return { status: true, message: "Événements d'une action affichés avec succès !", action_details: action_details, iterations_details: iterations_details, iterations: iterations_filtered };

    } catch (error) {
        console.log("❌​ Erreur lors de l'affichage de tous les événements d'une action :", error.message);
        return { status: false, message: error.message };
    }
}

// PRINT - Affichage de tous les événements passifs
export const printAllPassiveEvents = async () => {
    // console.log("⚡​ Affichage de tous les événements passifs...");
    try {
        // récupération de toutes les actions passives
        const actions_passives = await getAllPassiveActions();

        let passive_events = [];
        for (const action_passive of actions_passives) {
            // récupération de l'action associée
            const action = await getActionById(action_passive.action_id);

            let absence = null;
            if (!action_passive.is_active) { // si l'action passive est inactive, on récupère l'absence associée
                absence = await getAbsenceByActionPassiveId(action_passive.id);
            }

            // ajout des informations de l'événement passif
            passive_events.push({
                action_passive_id: action_passive.id,
                action_id: action_passive.action_id,
                action_nom: action.nom,
                status: action_passive.is_active,
                params: action_passive.params,
                action_passive_repeat_every: action_passive.repeat_every,
                action_passive_repeat_unit: action_passive.repeat_unit,
                action_passive_date_debut: action_passive.date_debut,
                action_passive_date_fin: action_passive.date_fin,
                absence_id: absence ? absence.id : null,
                absence_date_debut: absence ? absence.date_debut : null,
                absence_date_fin: absence ? absence.date_fin : null
            });
        }

        // tri des événements passifs par date de fin d'absence
        passive_events = sortPassiveEventsByDateAbsenceAndDateFin(passive_events);

        // vérification des événements passifs
        // console.log("👉​ Événements passifs :", passive_events);

        /// console.log("✅​ Événements passifs affichés avec succès !");
        return { status: true, message: "Événements passifs affichés avec succès !", passive_events: passive_events };

    } catch (error) {
        console.log("❌​ Erreur lors de l'affichage de tous les événements passifs :", error.message);
        return { status: false, message: error.message };
    }
}

// CREATE - Création d'un événement
export const createEvent = async (type_action, categorie, reference_id, params, date) => {
    console.log("⚡ Création d'un événement...");

    try {
        // Création de la référence si nécessaire
        if (!reference_id) {
            console.log("⚡ Référence inexistante, création...");
            if (categorie === 'aliment') {
                let aliment = await getAlimentByCode(params.code);
                if (!aliment) {
                    console.log("⚡ Aliment inconnu, création...", params);
                    aliment = await createAliment(
                        params.code,
                        params.product_name,
                        params.marques,
                        params.tags,
                        false
                    );
                    console.log("✅ Aliment créé :", aliment);
                }
                reference_id = aliment.code;
            } else if (type_action === 'usage' && categorie === 'transport') {
                let transport = await getTransportNonFavorisByCategorieId(params.categorie_id);
                if (!transport) {
                    console.log("⚡ Transport non favori inconnu, création...");
                    transport = await createTransport(params.nom, params.categorie_id, params.conso_km, false);
                    console.log("✅ Transport créé :", transport);
                }
                reference_id = transport.id;
            } else if (type_action === 'usage' && categorie === 'logement') {
                let logement = await getLogementNonFavorisByChauffageIdAndSuperficie(params.chauffage_id);
                if (!logement) {
                    console.log("⚡ Logement non favori inconnu, création...");
                    logement = await createLogement(params.nom, params.chauffage_id, params.superficie_m2, params.temp_chauffage, false);
                    console.log("✅ Logement créé :", logement);
                }
                reference_id = logement.id;
            } else {
                const reference = await createReference(categorie, type_action, params);
                console.log("✅ Référence créée :", reference);
                reference_id = reference.id;
            }
        } else {
            console.log("✅ Référence existante :", reference_id);
        }

        // Récupération ou création des actions
        let action;
        let action_creation_aliment;
        let action_usage_aliment;

        if (categorie === 'aliment') {
            console.log("⚡ Gestion des actions pour un aliment...");
            action_creation_aliment = await getActionByReferenceId('creation', categorie, reference_id);
            action_usage_aliment = await getActionByReferenceId('usage', categorie, reference_id);

            if (!action_creation_aliment) {
                action_creation_aliment = await createAction('creation', categorie, reference_id);
                console.log("✅ Action création aliment :", action_creation_aliment);
            }
            if (!action_usage_aliment) {
                action_usage_aliment = await createAction('usage', categorie, reference_id);
                console.log("✅ Action usage aliment :", action_usage_aliment);
            }
        } else {
            console.log("⚡ Gestion des actions pour un", categorie, "...");
            action = await getActionByReferenceId(type_action, categorie, reference_id);
            if (!action) {
                action = await createAction(type_action, categorie, reference_id);
                console.log("✅ Action créée :", action);
            } else {
                console.log("✅ Action existante :", action);
            }
        }

        // Création des itérations et actions passives
        if (type_action === 'creation' && categorie === 'logement') {
            console.log("⚡ Début création d'un logement...");

            // Récupérer ou créer l'action de création
            let action = await getActionByReferenceId('creation', 'logement', reference_id);
            if (!action) {
                action = await createAction('creation', categorie, reference_id);
                console.log("✅ Action création logement créée :", action);
            } else {
                console.log("✅ Action création logement existante :", action);
            }

            // Création de l'itération de création
            const action_passive_id = null; // pas d'action passive pour cette itération
            await createIteration(action.id, action_passive_id, reference_id, params, date);
            console.log("✅ Itération création logement créée");

            // Récupérer ou créer l'action d'usage
            let usage = await getActionByReferenceId('usage', categorie, reference_id);
            if (!usage) {
                usage = await createAction('usage', categorie, reference_id);
                console.log("✅ Action usage logement créée :", usage);
            } else {
                console.log("✅ Action usage logement existante :", usage);
            }

            // Création de l'action passive
            const repeat_every = 1;
            const repeat_unit = 'jours';
            const dateObj = new Date(date);
            dateObj.setFullYear(dateObj.getFullYear() + 3);
            const date_fin = dateObj.toISOString();

            const response = await createPassiveAction(
                usage.id,
                params,
                repeat_every,
                repeat_unit,
                date,
                date_fin
            );

            if (!response.status) throw new Error(response.message);
            console.log("✅ Action passive créée pour le logement :", response);

            console.log("✅ Fin création d'un logement avec toutes les étapes !");
        }
        else if (type_action === 'usage' && categorie === 'logement') {
            if (params.date_debut) {
                // Cas répétition ou usage avec date_debut défini
                console.log("⚡ Usage d'un logement : création action passive avec date_debut...");
                const response = await createPassiveAction(
                    action.id,
                    params,
                    params.repeat_every,
                    params.repeat_unit,
                    params.date_debut,
                    params.date_fin
                );
                if (!response.status) throw new Error(response.message);
                console.log("✅ Action passive créée pour l'usage du logement :", response);
            } else {
                // Cas simple : usage pour un jour unique (date_debut = date_fin = date)
                console.log("⚡ Usage d'un logement : création action passive pour un jour simple...");
                const repeat_every = 1;
                const repeat_unit = 'jours';
                const response = await createPassiveAction(
                    action.id,
                    params,
                    repeat_every,
                    repeat_unit,
                    date,
                    date
                );

                if (!response.status) throw new Error(response.message);
                console.log("✅ Action passive créée pour l'usage du logement :", response);
            }
        }
        else if (categorie === 'aliment') {
            console.log("⚡ Création des itérations pour l'aliment...");
            const action_passive_id = null;
            await createIteration(action_creation_aliment.id, action_passive_id, reference_id, params, date);
            console.log("✅ Itération création aliment créée");
            await createIteration(action_usage_aliment.id, action_passive_id, reference_id, params, date);
            console.log("✅ Itération usage aliment créée");
        }
        else {
            console.log("⚡ Création d'une itération pour", categorie);
            const action_passive_id = null;
            await createIteration(action.id, action_passive_id, reference_id, params, date);
            console.log("✅ Itération créée pour", categorie);
        }

        console.log("✅ Événement créé avec succès !");
        return { status: true, message: "Événement créé avec succès !" };

    } catch (error) {
        console.log("❌ Erreur lors de la création de l'événement :", error.message);
        return { status: false, message: error.message };
    }
};

// FONCTION UTILITAIRE - Affichage des paramètres d'un événement
const printEventParams = (type_action, categorie, reference, params) => {
    // console.log("⚡​ Affichage des paramètres d'un événement...");

    // conversion en objet avant récupération des paramètres (si besoin)
    if (typeof params === 'string') {
        params = JSON.parse(params);
    }

    let params_event;
    if (categorie === 'logement') {
        params_event = {
            chauffage_id: reference.chauffage_id,
            superficie_m2: reference.superficie_m2,
            temp_chauffage: params.temp_chauffage || reference.temp_chauffage,
            co2_unit: 'kgCO2eq'
        };
    } else if (categorie === 'transport') {
        params_event = {
            categorie_id: reference.categorie_id,
            conso_km: params.conso_km || reference.conso_km,
            distance_km: params.distance_km,
            co2_unit: 'kgCO2eq'
        };
    } else if (categorie === 'aliment') {
        params_event = {
            tags: reference.tags,
            quantity_value: params.quantity_value,
            quantity_unit: params.quantity_unit,
            co2_unit: type_action === 'creation' ? 'kgCO2eq' : 'gCO2eq'
        };
    }

    // vérification des paramètres
    // console.log("👉​ Paramètres :", params_event);

    // console.log("✅​ Paramètres affichés avec succès !");
    return params_event;
}

// FONCTION UTILITAIRE - Filtrage des événements par période
export const filterEventsByPeriod = (events, period, is_previous = false) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // à minuit

    return events.filter(event => {
        if (!event.date) return false;

        const eventDate = new Date(event.date);

        // exclure uniquement les événements réellement dans le futur
        if (eventDate > now) return false;

        switch (period) {
            case "Aujourd'hui": {
                if (is_previous) {
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    return eventDate >= yesterday && eventDate < today;
                } else {
                    return eventDate >= today && eventDate <= now;
                }
            }

            case "Cette semaine": {
                const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ...
                const mondayThisWeek = new Date(today);
                mondayThisWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // lundi

                const sundayThisWeek = new Date(mondayThisWeek);
                sundayThisWeek.setDate(mondayThisWeek.getDate() + 6);

                if (is_previous) {
                    const mondayLastWeek = new Date(mondayThisWeek);
                    mondayLastWeek.setDate(mondayThisWeek.getDate() - 7);

                    const sundayLastWeek = new Date(mondayThisWeek);
                    sundayLastWeek.setDate(mondayThisWeek.getDate() - 1);

                    return eventDate >= mondayLastWeek && eventDate <= sundayLastWeek;
                } else {
                    return eventDate >= mondayThisWeek && eventDate <= now;
                }
            }

            case "Ce mois": {
                if (is_previous) {
                    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                    return eventDate >= firstDayLastMonth && eventDate <= lastDayLastMonth;
                } else {
                    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    return eventDate >= firstDayThisMonth && eventDate <= now;
                }
            }

            case "Ces 6 derniers mois": {
                if (is_previous) {
                    const startLast6 = new Date(today);
                    startLast6.setMonth(today.getMonth() - 12);
                    const endLast6 = new Date(today);
                    endLast6.setMonth(today.getMonth() - 6);
                    return eventDate >= startLast6 && eventDate < endLast6;
                } else {
                    const start6MonthsAgo = new Date(today);
                    start6MonthsAgo.setMonth(today.getMonth() - 6);
                    return eventDate >= start6MonthsAgo && eventDate <= now;
                }
            }

            case "Cette année": {
                if (is_previous) {
                    const firstDayLastYear = new Date(today.getFullYear() - 1, 0, 1);
                    const lastDayLastYear = new Date(today.getFullYear() - 1, 11, 31);
                    return eventDate >= firstDayLastYear && eventDate <= lastDayLastYear;
                } else {
                    const firstDayThisYear = new Date(today.getFullYear(), 0, 1);
                    return eventDate >= firstDayThisYear && eventDate <= now;
                }
            }

            case "Depuis le début":
                return eventDate <= now;

            default:
                return false;
        }
    });
};

// FONCTION UTILITAIRE - Filtrage des événements par seuil de poids carbone
const filterEventsByCo2 = (events, seuil_co2, objectif) => {
    if (seuil_co2 === 'Tout') {
        return events;
    } else if (seuil_co2 === 'sup') {
        return events.filter(event => event.co2 > objectif);
    } else if (seuil_co2 === 'inf') {
        return events.filter(event => event.co2 <= objectif);
    }
};

// FONCTION UTILITAIRE - Tri des événements par date
const sortEventsByDate = (events) => {
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// FONCTION UTILITAIRE - Calcul du poids carbone total par catégorie (arrondi à 2 décimales)
const calculateTotalCo2ForCategorie = (events) => {
    const total_co2_logement = Math.round(events.filter(event => event.action_categorie === 'logement').reduce((acc, event) => acc + event.co2, 0) * 100) / 100;
    const total_co2_transport = Math.round(events.filter(event => event.action_categorie === 'transport').reduce((acc, event) => acc + event.co2, 0) * 100) / 100;
    const total_co2_aliment = Math.round(
        events
            .filter(event => event.action_categorie === 'aliment')
            .reduce((acc, event) => {
                const co2_kg = event.type_action === 'usage' ? event.co2 / 1000 : event.co2; // conversion des gCO2eq en kgCO2eq (si l'action est de type usage)
                return acc + co2_kg;
            }, 0) * 100
    ) / 100;

    return { total_co2_logement: total_co2_logement, total_co2_transport: total_co2_transport, total_co2_aliment: total_co2_aliment };
}

// GET - Récupération du co2 moyen d'une liste d'événements
export const getMoyenneCo2OfEvents = async (events) => {
    // console.log("⚡​ Récupération du co2 moyen des événements...");
    try {
        // récupération du co2 moyen par type d'action
        const moyenne_co2 = calculateMoyenneCo2ByTypeAction(events);

        // vérification de la récupération
        // console.log("👉​ Moyenne co2 création :", moyenne_co2.creation);
        // console.log("👉​ Moyenne co2 usage :", moyenne_co2.usage);

        // console.log("✅​ Co2 moyen des événements récupéré avec succès !");
        return { status: true, message: "Co2 moyen des événements récupéré avec succès !", moyenne_co2: moyenne_co2 };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération du co2 moyen des événements :", error.message);
        return { status: false, message: error.message };
    }
}

// GET - Récupération du co2 moyen d'une liste d'événements précédents
export const getMoyenneCo2OfPreviousEvents = async (events, period) => {
    // console.log("⚡​ Récupération du co2 moyen des événements précédents...");
    try {
        // récupération de tous les événements précédents
        const previous_events = await filterEventsByPeriod(events, period, true);

        // récupération du co2 moyen par type d'action
        const moyenne_co2 = calculateMoyenneCo2ByTypeAction(previous_events);

        // vérification de la récupération
        // console.log("👉​ Moyenne co2 création :", moyenne_co2.creation);
        // console.log("👉​ Moyenne co2 usage :", moyenne_co2.usage);

        // console.log("✅​ Co2 moyen des événements précédents récupéré avec succès !");
        return { status: true, message: "Co2 moyen des événements précédents récupéré avec succès !", moyenne_co2: moyenne_co2 };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération du co2 moyen des événements précédents :", error.message);
        return { status: false, message: error.message };
    }
}

// FONCTION UTILITAIRE - Calcul du co2 moyen par type d'action (arrondi à 2 décimales)
const calculateMoyenneCo2ByTypeAction = (events) => {
    let total_co2_usage = 0;
    let cpt_usage = 0;
    let total_co2_creation = 0;
    let cpt_creation = 0;

    for (const event of events) {
        if (event.action_categorie === 'logement' && event.type_action === 'creation') {
            total_co2_creation += event.co2;
            cpt_creation++;
        } else if (event.action_categorie === 'logement' && event.type_action === 'usage') {
            total_co2_usage += event.co2;
            cpt_usage++;
        } else if (event.action_categorie === 'transport' && event.type_action === 'creation') {
            total_co2_creation += event.co2;
            cpt_creation++;
        } else if (event.action_categorie === 'transport' && event.type_action === 'usage') {
            total_co2_usage += event.co2;
            cpt_usage++;
        } else if (event.action_categorie === 'aliment' && event.type_action === 'creation') {
            total_co2_creation += event.co2;
            cpt_creation++;
        } else if (event.action_categorie === 'aliment' && event.type_action === 'usage') {
            total_co2_usage += event.co2;
            cpt_usage++;
        }
    }

    const moyenne_co2_usage = Math.round(total_co2_usage / cpt_usage * 100) / 100; // arrondi à 2 décimales
    const moyenne_co2_creation = Math.round(total_co2_creation / cpt_creation * 100) / 100; // arrondi à 2 décimales

    return { usage: moyenne_co2_usage, creation: moyenne_co2_creation };
}

// FONCTION UTILITAIRE - Tri des événements passifs par date de fin d'absence et de fin d'action passive
const sortPassiveEventsByDateAbsenceAndDateFin = (passive_events) => {
    return passive_events.sort((a, b) => {
        // récupération des dates
        const dateAbsenceA = a.absence_date_fin ? new Date(a.absence_date_fin) : null;
        const dateAbsenceB = b.absence_date_fin ? new Date(b.absence_date_fin) : null;

        const dateActionFinA = a.action_passive_date_fin ? new Date(a.action_passive_date_fin) : null;
        const dateActionFinB = b.action_passive_date_fin ? new Date(b.action_passive_date_fin) : null;

        // 1. cas où les deux ont une date de fin d'absence
        if (dateAbsenceA && dateAbsenceB) {
            if (dateAbsenceA.getTime() !== dateAbsenceB.getTime()) {
                return dateAbsenceA - dateAbsenceB;
            }
        }

        // 2. cas où un seul a une date de fin d'absence
        if (dateAbsenceA && !dateAbsenceB) return -1;
        if (!dateAbsenceA && dateAbsenceB) return 1;

        // 3. cas où les deux ont ou n'ont pas une date de fin d'action passive
        if (dateActionFinA && dateActionFinB) {
            return dateActionFinA - dateActionFinB;
        }

        // 4. cas où un seul a une date de fin d'action passive
        if (dateActionFinA && !dateActionFinB) return -1;
        if (!dateActionFinA && dateActionFinB) return 1;

        // 5. par défaut, ne pas changer l'ordre
        return 0;
    });
};