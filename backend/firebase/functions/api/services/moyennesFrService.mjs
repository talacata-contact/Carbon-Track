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

import { getdb } from "../../db/db.mjs";

////////////////////////////////////////////////////////////////////////////////////
// MOYENNES FR
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de toutes les moyennes fr
export const getAllMoyennesFr = async () => {
    console.log("📊​​ Récupération des moyennes fr...");
    try {
        // récupération de la db et des moyennes fr
        const db = await getdb();
        const moyennes = await db.getAllMoyennesFr();

        // vérification de la récupération
        // console.log("👉​ Moyennes fr :", moyennes);

        console.log("✅​ Moyennes fr récupérées avec succès !");
        return moyennes.map(moyenne => ({
            id: moyenne.id,
            categorie: moyenne.categorie,
            type_action: moyenne.type_action,
            moyenne_value: moyenne.moyenne_value,
            moyenne_unit: moyenne.moyenne_unit
        }));

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des moyennes fr :", error.message);
        throw error;
    }
};