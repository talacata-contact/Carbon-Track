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
// CATEGORIES DE TRANSPORTS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des catégories de transports
export const getAllCategoriesTransports = async () => {
    console.log("🚗​​ Récupération des catégories de transports...");
    try {
        // récupération de la db et des catégories de transports
        const db = await getdb();
        const categories = await db.getAllCategoriesTransports();

        // vérification de la récupération
        console.log("👉​ Catégories de transports :", categories);

        console.log("✅​ Catégories de transports récupérées avec succès !");
        return categories.map(categorie => ({
            id: categorie.id,
            nom: categorie.nom
        }));

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des catégories de transports :", error.message);
        throw error;
    }
};

// GET - Récupération d'une catégorie de transport par son id
const getTransportCategorieById = async (id) => {
    console.log("🚗​ Récupération d'une catégorie de transport par son id...");
    try {
        // récupération de la db et de la catégorie de transport
        const db = await getdb();
        const categorie = await db.getTransportCategorieById(id);

        // vérification de la récupération
        if (!categorie) {
            throw new Error("404: Catégorie de transport non trouvée");
        }

        // vérification de la récupération
        console.log("👉​ Catégorie de transport :", categorie);

        console.log("✅​ Catégorie de transport récupérée avec succès !");
        return categorie;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de la catégorie de transport :", error.message);
        throw error;
    }
};

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone de création d'un transport
export const getPoidsCarboneCreationTransport = async (categorie_id) => {
    console.log("🚗​ Récupération du poids carbone de création d'un transport...");
    try {
        // vérification des paramètres
        console.log("👉 categorie_id : ", categorie_id);

        // récupération de la catégorie du transport
        const categorie_transport = await getTransportCategorieById(categorie_id);

        // récupération des paramètres de la catégorie
        const duree_vie_km = categorie_transport.duree_vie_km;
        const co2_construction_factor = categorie_transport.co2_construction_factor;

        // calcul du poids carbone
        const co2_creation = Math.round(duree_vie_km * co2_construction_factor); // arrondi à l'entier le plus proche

        // vérification de la réponse
        console.log("👉​ Poids carbone de création :", co2_creation, "kgCO2eq");

        console.log("✅​ Poids carbone de création d'un transport récupéré avec succès !");
        return co2_creation;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération du poids carbone de création d'un transport :", error.message);
        throw error;
    }
};

// GET - Récupération du poids carbone d'usage d'un transport avec l'API Impact CO2
export const getPoidsCarboneUsageTransport = async (categorie_id, distance_km) => {
    // vérification des paramètres
    console.log("👉 categorie_id : ", categorie_id);
    console.log("👉 distance_km : ", distance_km);
    console.log("🌐​ Appel à l'API Impact CO2 pour récupérer le poids carbone d'usage d'un transport...");
    try {
        // appel à l'API Impact CO2
        const response = await api_impact_co2.get(`/transport?km=${distance_km}&transports=${categorie_id}`);

        // arrondi à 2 décimales
        const co2_usage = Math.round((response.data.data[0].value) * 100) / 100;

        // vérification de la réponse
        console.log("👉 Réponse de l'API Impact CO2 : ", co2_usage, "kgCO2eq");

        console.log("✅​ Appel à l'API Impact CO2 réussi !");
        return co2_usage;

    } catch (error) {
        console.log("❌​ Erreur lors de la requête vers l'API Impact CO2 : ", error.message);
        throw error;
    }
};