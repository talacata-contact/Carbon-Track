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
// SUGGESTIONS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des suggestions d'une catégorie
export const getSuggestionsByCategorie = async (categorie, events_done) => {
    // console.log("🎯​ Récupération des suggestions d'une catégorie");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des suggestions de la catégorie
        const sql = 'SELECT * FROM suggestions WHERE categorie = ?';
        const suggestions = await db.getAllAsync(sql, [categorie]);

        // vérification de la récupération
        // console.log("👉​ Suggestions pour la catégorie ", categorie, ' : ', suggestions);

        // filtrage des suggestions en fonction des paramètres des actions
        let suggestions_filtered = await filterSuggestionsByEventsDone(categorie, suggestions, events_done);

        // mise en forme des JSON
        suggestions_filtered = suggestions_filtered.map(s => ({
            ...s,
            contexte: typeof s.contexte === 'string' ? JSON.parse(s.contexte) : s.contexte,
            sources: typeof s.sources === 'string' ? JSON.parse(s.sources) : s.sources,
        }));

        // console.log("✅​ Récupération des suggestions de la catégorie réussie !");
        return { status: true, message: "Récupération des suggestions de la catégorie réussie !", suggestions: suggestions_filtered };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des suggestions de la catégorie :", error.message);
        return { status: false, message: error.message };
    }
}

// GET - Récupération des suggestions depuis l'API
export const getSuggestionsFromApi = async () => {
    console.log("🌐 Appel à l'API pour récupérer les suggestions...");
    try {
        // appel à l'API
        const response = await api.get('/suggestions');

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour récupérer les suggestions réussi !");
        return response.data.suggestions;

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour récupérer les suggestions :", error.message);
        throw error;
    }
}

// DELETE - Suppression d'une suggestion
export const deleteSuggestion = async (id) => {
    console.log("🎯​​ Suppression d'une suggestion");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        // const sqlSelect = 'SELECT * FROM suggestions WHERE id = ?';
        // const suggestion = await db.getFirstAsync(sqlSelect, [id]);
        // console.log("👉​ Suggestion à supprimer :", suggestion);

        // suppression de la suggestion
        const sqlDelete = 'DELETE FROM suggestions WHERE id = ?';
        await db.runAsync(sqlDelete, [id]);

        // vérification après suppression
        // const sqlSelectAfter = 'SELECT * FROM suggestions WHERE id = ?';
        // const suggestionAfter = await db.getFirstAsync(sqlSelectAfter, [id]);
        // console.log("👉​ Suggestion après suppression :", suggestionAfter);

        console.log("✅​​ Suppression de la suggestion réussie !");
        return { status: true, message: "Suppression de la suggestion réussie !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression de la suggestion :", error.message);
        return { status: false, message: error.message };
    }
}

// SYNC - Synchronisation des suggestions
export const syncSuggestions = async () => {
    console.log("🎯​​ Synchronisation des suggestions...");
    try {
        // récupération des suggestions depuis l'API
        const suggestions = await getSuggestionsFromApi();

        // récupération de la base de données
        const db = await getdb();

        // insertion (ou mise à jour) des suggestions
        for (const suggestion of suggestions) {
            const sqlInsert = 'INSERT OR REPLACE INTO suggestions (id, categorie, contexte, suggestion, explication, sources) VALUES (?, ?, ?, ?, ?, ?)';
            await db.runAsync(sqlInsert, [suggestion.id, suggestion.categorie, JSON.stringify(suggestion.contexte), suggestion.suggestion, suggestion.explication, JSON.stringify(suggestion.sources)]);
        }

        // suppression des suggestions non présentes dans l'API
        const placeholders = suggestions.map(() => '?').join(',');
        const sqlDelete = `DELETE FROM suggestions WHERE id NOT IN (${placeholders})`;
        const ids = suggestions.map(s => s.id);
        await db.runAsync(sqlDelete, ids);

        // vérification de la synchronisation
        // const sqlSelect = 'SELECT * FROM suggestions';
        // const suggestions_synced = await db.getAllAsync(sqlSelect);
        // console.log("👉​ Suggestions synchronisées :", suggestions_synced);

        console.log("✅​ Synchronisation des suggestions réussie !");
        return { status: true, message: "Synchronisation des suggestions réussie !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation des suggestions :", error.message);
        return { status: false, message: error.message };
    }
}

// FONCTION UTILITAIRE - Filtrage des suggestions en fonction des paramètres d'une liste d'évenements
const filterSuggestionsByEventsDone = async (categorie, suggestions_of_categorie, events_done) => {
    // console.log("🎯​ Filtrage des suggestions en fonction des paramètres...");
    try {
        let suggestions_filtered = [];

        if (categorie === 'transport') {
            suggestions_filtered = suggestions_of_categorie.filter(suggestion => {
                const contexte = JSON.parse(suggestion.contexte);

                return events_done.some(event => {
                    // vérification de la catégorie de l'action
                    if (event.action_categorie !== 'transport') return false;

                    // récupération des paramètres de l'action
                    const params = event.params;
                    if (!params) return false;

                    // vérification des categorie_ids
                    if (contexte.categorie_ids && contexte.categorie_ids.length > 0 &&
                        !contexte.categorie_ids.includes(params.categorie_id)) {
                        return false;
                    }

                    // vérification de la distance supérieure
                    if (contexte.distance_km !== undefined && contexte.critere === 'supérieur' &&
                        !(params.distance_km > contexte.distance_km)) {
                        return false;
                    }

                    // vérification de la distance inférieure
                    if (contexte.distance_km !== undefined && contexte.critere === 'inférieur' &&
                        !(params.distance_km < contexte.distance_km)) {
                        return false;
                    }

                    // vérification de la consommation supérieure
                    if (contexte.conso_km !== undefined && contexte.critere === 'supérieur' &&
                        !(params.conso_km > contexte.conso_km)) {
                        return false;
                    }

                    // vérification de la consommation inférieure
                    if (contexte.conso_km !== undefined && contexte.critere === 'inférieur' &&
                        !(params.conso_km < contexte.conso_km)) {
                        return false;
                    }

                    return true;
                });
            });
        }

        else if (categorie === 'logement') {
            suggestions_filtered = suggestions_of_categorie.filter(suggestion => {
                const contexte = JSON.parse(suggestion.contexte);

                return events_done.some(event => {
                    // vérification de la catégorie de l'action
                    if (event.action_categorie !== 'logement') return false;

                    // récupération des paramètres de l'action
                    const params = event.params;
                    if (!params) return false;

                    // vérification du chauffage_id
                    if (contexte.chauffage_id !== undefined &&
                        contexte.chauffage_id !== params.chauffage_id) {
                        return false;
                    }

                    // vérification de la superficie
                    if (contexte.superficie_m2 !== undefined) {
                        if (contexte.critere === 'supérieur' &&
                            !(params.superficie_m2 > contexte.superficie_m2)) {
                            return false;
                        }
                        if (contexte.critere === 'inférieur' &&
                            !(params.superficie_m2 < contexte.superficie_m2)) {
                            return false;
                        }
                    }

                    // vérification de la température de chauffage
                    if (contexte.temp_chauffage !== undefined) {
                        if (contexte.critere === 'supérieur' &&
                            !(params.temp_chauffage > contexte.temp_chauffage)) {
                            return false;
                        }
                        if (contexte.critere === 'inférieur' &&
                            !(params.temp_chauffage < contexte.temp_chauffage)) {
                            return false;
                        }
                    }

                    return true;
                });
            });
        }

        else if (categorie === 'aliment') {
            suggestions_filtered = suggestions_of_categorie.filter(suggestion => {
                const contexte = JSON.parse(suggestion.contexte);
                const contexte_tags = contexte.tags;

                return events_done.some(event => {
                    // vérification de la catégorie de l'action
                    if (event.action_categorie !== 'aliment') return false;

                    // récupération des paramètres de l'action
                    const params = event.params;
                    if (!params) return false;
                    const aliment_tags = JSON.parse(params.tags);
                    if (!Array.isArray(aliment_tags)) return false;

                    // vérification des tags
                    return contexte_tags.some(tag => aliment_tags.includes(tag));
                });
            });
        }

        // console.log("👉​ Suggestions filtrées :", suggestions_filtered);
        // console.log("✅​ Filtrage des suggestions en fonction des paramètres réussie !");
        return suggestions_filtered;

    } catch (error) {
        console.log("❌​ Erreur lors du filtrage des suggestions en fonction des paramètres :", error.message);
        throw error;
    }
};