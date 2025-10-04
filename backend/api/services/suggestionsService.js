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

import { getdb } from "../../db/db.js";

////////////////////////////////////////////////////////////////////////////////////
// SUGGESTIONS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de toutes les suggestions
export const getAllSuggestions = async () => {
    console.log("🎯​​ Récupération des suggestions...");
    try {
        // récupération de la db et des suggestions
        const db = await getdb();
        const suggestions = await db.getAllSuggestions();

        // vérification de la récupération
        console.log("👉​ Suggestions :", suggestions);

        console.log("✅​ Suggestions récupérées avec succès !");
        return suggestions.map(suggestion => ({
            id: suggestion.id,
            categorie: suggestion.categorie,
            contexte: suggestion.contexte,
            suggestion: suggestion.suggestion,
            explication: suggestion.explication,
            sources: suggestion.sources
        }));

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des suggestions :", error.message);
        throw error;
    }
};