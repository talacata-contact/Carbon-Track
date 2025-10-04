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

import { api_impact_co2 } from "../api.js";
import { getdb } from "../../db/db.js";

////////////////////////////////////////////////////////////////////////////////////
// CHAUFFAGES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de tous les chauffages
export const getAllChauffages = async () => {
    console.log("🏠​​ Récupération des chauffages...");
    try {
        // récupération de la db et des chauffages
        const db = await getdb();
        const chauffages = await db.getAllChauffages();

        // vérification de la récupération
        console.log("👉​ Chauffages :", chauffages);

        console.log("✅​ Chauffages récupérées avec succès !");
        return chauffages.map(chauffage => ({
            id: chauffage.id,
            nom: chauffage.nom
        }));

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des chauffages :", error.message);
        throw error;
    }
};

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone d'un logement avec l'API Impact CO2
export const getPoidsCarboneLogement = async (chauffage_id, superficie_m2) => {
    // vérification des paramètres
    console.log("👉 chauffage_id : ", chauffage_id);
    console.log("👉 superficie_m2 : ", superficie_m2);
    console.log("🌐​ Appel à l'API Impact CO2 pour récupérer le poids carbone d'un logement...");
    try {
        // appel à l'API Impact CO2
        const response = await api_impact_co2.get(`/chauffage?m2=${superficie_m2}&chauffages=${chauffage_id}`);

        // vérification de la réponse
        const co2_par_an = response.data.data[0].ecv;
        console.log("👉 Réponse de l'API Impact CO2 : ", co2_par_an, "kgCO2eq/an");

        // calcul du poids carbone par jour (divise par 365 jours)
        const co2_par_jour = Math.round((co2_par_an / 365) * 100) / 100; // arrondi à 2 décimales

        // vérification du poids carbone par jour
        console.log("👉 co2_par_jour : ", co2_par_jour, "kgCO2eq/jour");

        console.log("✅​ Appel à l'API Impact CO2 réussi !");
        return co2_par_jour;

    } catch (error) {
        console.log("❌​ Erreur lors de la requête vers l'API Impact CO2 : ", error.message);
        throw error;
    }
};