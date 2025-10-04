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

import { api_openFoodFacts_v1, api_openFoodFacts_v2 } from "../api.js";

////////////////////////////////////////////////////////////////////////////////////
// RECHERCHES
////////////////////////////////////////////////////////////////////////////////////

// GET - Recherche d'un aliment à partir d'un texte
export const searchAlimentByText = async (text) => {
    // vérification des paramètres
    console.log("👉 text : ", text);
    console.log("🌐​ Appel à l'API OpenFoodFacts pour rechercher un aliment à partir d'un texte...");
    try {
        // appel à l'API OpenFoodFacts (V1)
        const response = await api_openFoodFacts_v1.get(`?search_terms=${text}&search_simple=1&action=process&json=1&fields=product_name,brands,code,food_groups_tags,quantity,image_url,ecoscore_data.status`);

        // filtration du résultat (pour garder uniquement ceux dont on connait l'ecoscore)
        let aliments = response.data.products.filter(product => product.ecoscore_data.status === "known");

        // si aucun aliment trouvé, on retourne une erreur
        if (aliments.length === 0) {
            throw new Error("404: No data found for this text");
        }

        // filtrage pour garder uniquement les champs nécessaires
        aliments = aliments.map(aliment => ({
            code: aliment.code,
            product_name: aliment.product_name,
            brands: aliment.brands,
            food_groups_tags: aliment.food_groups_tags,
            quantity: aliment.quantity,
            image_url: aliment.image_url,
        }));

        // vérification de la réponse
        console.log("👉 Réponse de l'API OpenFoodFacts : ", aliments);

        console.log("✅​ Appel à l'API OpenFoodFacts réussi !");
        return aliments;

    } catch (error) {
        console.log("❌​ Erreur lors de la requête vers l'API OpenFoodFacts : ", error.message);
        throw error;
    }
};

// GET - Recherche d'un aliment à partir d'un code barre
export const searchAlimentByBarcode = async (barcode) => {
    // vérification des paramètres
    console.log("👉 barcode : ", barcode);
    console.log("🌐​ Appel à l'API OpenFoodFacts pour rechercher un aliment à partir d'un code barre...");
    try {
        // appel à l'API OpenFoodFacts (V2)
        const response = await api_openFoodFacts_v2.get(`/product/${barcode}?fields=product_name,brands,code,food_groups_tags,quantity,image_url,ecoscore_data.status`);

        // filtrage du résultat (pour garder uniquement ceux dont on connait l'ecoscore)
        let aliment;
        if (response.data.product.ecoscore_data.status === "known") {
            // filtrage pour garder uniquement les champs nécessaires
            aliment = {
                code: response.data.product.code,
                product_name: response.data.product.product_name,
                brands: response.data.product.brands,
                food_groups_tags: response.data.product.food_groups_tags,
                quantity: response.data.product.quantity,
                image_url: response.data.product.image_url,
            };
        } else {
            throw new Error("404: No data found for this barcode");
        }

        // vérification de la réponse
        console.log("👉 Réponse de l'API OpenFoodFacts : ", aliment);

        console.log("✅​ Appel à l'API OpenFoodFacts réussi !");
        return aliment;

    } catch (error) {
        console.log("❌​ Erreur lors de la requête vers l'API OpenFoodFacts : ", error.message);
        throw error;
    }
};

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone de création et d'usage d'un aliment avec l'API Open Food Facts
export const getPoidsCarboneAliment = async (barcode, quantity_value, quantity_unit) => {
    // vérification des paramètres
    console.log("👉 barcode : ", barcode);
    console.log("👉 quantity_value : ", quantity_value);
    console.log("👉 quantity_unit : ", quantity_unit);
    console.log("🌐​ Appel à l'API Open Food Facts pour récupérer le poids carbone d'un aliment...");
    try {
        // appel à l'API Open Food Facts (V2)
        const response = await api_openFoodFacts_v2.get(`/product/${barcode}?fields=ecoscore_data`);

        // récupération des détails de l'ecoscore
        const ecoscore_data = response.data.product.ecoscore_data.agribalyse;

        // récupération des poids carbone de l'aliment
        const co2_agriculture = ecoscore_data.co2_agriculture;
        const co2_processing = ecoscore_data.co2_processing;
        const co2_packaging = ecoscore_data.co2_packaging;
        const co2_transportation = ecoscore_data.co2_transportation;
        const co2_distribution = ecoscore_data.co2_distribution;
        const co2_consumption = ecoscore_data.co2_consumption;

        // calcul du poids carbone de création d'un aliment (en kgCO2eq)
        let co2_creation = co2_agriculture + co2_processing + co2_packaging + co2_transportation + co2_distribution;
        co2_creation = co2_creation * convertToGrams(quantity_value, quantity_unit) / 1000; // kgCO2eq/kg -> kgCO2eq pour la quantité indiquée
        co2_creation = Math.round(co2_creation * 100) / 100; // arrondi à 2 décimales

        // calcul du poids carbone d'usage d'un aliment (en gCO2eq)
        let co2_usage = co2_consumption;
        co2_usage = co2_usage * convertToGrams(quantity_value, quantity_unit); // kgCO2eq/kg -> gCO2eq pour la quantité indiquée
        co2_usage = Math.round(co2_usage * 100) / 100; // arrondi à 2 décimales

        // vérification de la réponse
        console.log("👉 Réponse de l'API Open Food Facts :");
        console.log("👉 co2_creation : " + co2_creation + " kgCO2eq");
        console.log("👉 co2_usage : " + co2_usage + " gCO2eq");

        console.log("✅​ Appel à l'API Open Food Facts réussi !");
        return { co2_creation, co2_usage };

    } catch (error) {
        console.log("❌​ Erreur lors de la requête vers l'API Open Food Facts : ", error.message);
        throw error;
    }
};

// FONCTION UTILITAIRE - Conversion de la quantité d'un aliment en g
export const convertToGrams = (quantity_value, quantity_unit) => {
    // g -> g
    if (quantity_unit === "g") {
        return quantity_value;

        // kg -> g
    } else if (quantity_unit === "kg") {
        return quantity_value * 1000;

        // L -> g
    } else if (quantity_unit === "L") {
        return quantity_value * 1000;

        // mL -> g
    } else if (quantity_unit === "mL") {
        return quantity_value;
    }
};