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

import { api_impact_co2 } from "../api/api.js";

const vehicleTypes = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30
];

const DISTANCE_TEST = 1_000_000; // 1 million km

async function getEmission(categorie_id, includeConstruction) {
    try {
        const params = {
            km: DISTANCE_TEST,
            transports: categorie_id,
            includeConstruction: includeConstruction ? 1 : 0,
        };
        const response = await api_impact_co2.get('/transport', { params });
        return response.data.data[0].value; // kgCO2e
    } catch (error) {
        console.error(`Erreur API pour catégorie ${categorie_id} (includeConstruction=${includeConstruction}):`, error.response?.status || error.message);
        return null;
    }
}

async function calculerFacteursConstruction() {
    const resultats = {};

    for (const cat of vehicleTypes) {
        console.log(`Traitement catégorie ${cat}...`);
        const avecConstruction = await getEmission(cat, true);
        const sansConstruction = await getEmission(cat, false);

        if (avecConstruction === null || sansConstruction === null) {
            resultats[cat] = null;
            continue;
        }

        const facteurConstruction = (avecConstruction - sansConstruction) / DISTANCE_TEST;

        resultats[cat] = facteurConstruction;
        console.log(`Catégorie ${cat} => facteur construction : ${facteurConstruction.toFixed(5)} kgCO2e/km`);
    }

    return resultats;
}

(async () => {
    console.log("🚀 Démarrage du calcul des facteurs de construction...");
    const facteurs = await calculerFacteursConstruction();
    console.log("✅ Résultats complets :");
    console.table(facteurs);
})();