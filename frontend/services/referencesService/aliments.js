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
// ALIMENTS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération d'un aliment par son code
export const getAlimentByCode = async (code) => {
    // console.log("🥕​ Récupération d'un aliment par son code...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de l'aliment
        const sql = 'SELECT * FROM aliments WHERE code = ?';
        const aliment = await db.getFirstAsync(sql, [code]);

        // vérification de la récupération
        // console.log("👉​ Aliment :", aliment);

        // console.log("✅​ Aliment récupéré avec succès !");
        return aliment;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de l'aliment :", error.message);
        throw error;
    }
};

// CREATE - Création d'un aliment
export const createAliment = async (code, nom, marques, tags, is_favori) => {
    console.log("🥕​ Création d'un aliment...", marques);
    try {
        // formatage du nom
        const nom_format = formatAlimentName(nom, marques);
        // récupération de la base de données
        const db = await getdb();

        // création de l'aliment
        const sql = 'INSERT INTO aliments (code, nom, marques, tags, is_favori) VALUES (?, ?, ?, ?, ?)';
        await db.runAsync(sql, [code, nom_format, marques, JSON.stringify(tags), is_favori]);

        // vérification de la création
        const selectSql = 'SELECT * FROM aliments WHERE code = ?';
        const aliment = await db.getFirstAsync(selectSql, [code]);
        // console.log("👉​ Nouveau aliment :", aliment);

        console.log("✅​ Aliment créé avec succès !");
        return aliment;

    } catch (error) {
        console.log("❌​ Erreur lors de la création de l'aliment :", error.message);
        throw error;
    }
};

// DELETE - Suppression d'un aliment
export const deleteAliment = async (code) => {
    console.log("🥕​ Suppression d'un aliment...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        // const selectSql_before = 'SELECT * FROM aliments WHERE code = ?';
        // const aliment_before = await db.getFirstAsync(selectSql_before, [code]);
        // console.log("👉​ Aliment à supprimer :", aliment_before);

        // suppression de l'aliment
        const sql = 'DELETE FROM aliments WHERE code = ?';
        await db.runAsync(sql, [code]);

        // vérification après suppression
        // const selectSql_after = 'SELECT * FROM aliments WHERE code = ?';
        // const aliment_after = await db.getFirstAsync(selectSql_after, [code]);
        // console.log("👉​ Aliment supprimé :", aliment_after);

        console.log("✅​ Aliment supprimé avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression d'un aliment :", error.message);
        throw error;
    }
}

// FONCTION UTILITAIRE - Formatage du nom d'un aliment
const formatAlimentName = (nom, marques) => {
    nom = nom.trim();
    // console.log('oooooo', marques)

    // Split, nettoyer les marques, enlever doublons (insensibles à la casse/ponctuation)
    let marquesArr = marques
        .split(',')
        .map(m => m.trim().toUpperCase().replace(/-/g, ' '))
        .filter((val, idx, self) => self.indexOf(val) === idx); // uniques

    // Reprend la première marque pour l'affichage
    const marqueAffichee = marquesArr[0] || '';

    // Supprimer cette marque du nom s’il y a redondance
    const regexMarque = new RegExp(marqueAffichee, 'i');
    nom = nom.replace(regexMarque, '').trim();

    // Nettoyage final
    nom = nom.replace(/\s+/g, ' ').replace(/[,\.]$/, '');

    // Format final : nom, MARQUE
    return marqueAffichee ? `${nom}, ${marqueAffichee}` : nom;
};


////////////////////////////////////////////////////////////////////////////////////
// RECHERCHES
////////////////////////////////////////////////////////////////////////////////////

// SEARCH - Recherche d'un aliment à partir d'un texte
export const searchAlimentByText = async (text) => {
    console.log("🥕​ Recherche d'un aliment à partir d'un texte...");
    try {
        // appel à l'API
        console.log("🌐​ Appel à l'API pour rechercher un aliment à partir d'un texte...");
        // console.log("👉​ Texte :", text);
        const response = await api.get(`/aliments/search/text?text=${text}`);

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour rechercher un aliment à partir d'un texte réussi !");
        return { status: true, message: "Appel à l'API pour rechercher un aliment à partir d'un texte réussi !", aliments: response.data.aliments };

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour rechercher un aliment à partir d'un texte :", error.message);
        return { status: false, message: error.message };
    }
};

// SEARCH - Recherche d'un aliment à partir d'un code barre
export const searchAlimentByBarcode = async (barcode) => {
    console.log("🥕​ Recherche d'un aliment à partir d'un code barre...");
    try {
        // appel à l'API
        console.log("🌐​ Appel à l'API pour rechercher un aliment à partir d'un code barre...");
        // console.log("👉​ Code barre :", barcode);
        const response = await api.get(`/aliments/search/barcode?barcode=${barcode}`);

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour rechercher un aliment à partir d'un code barre réussi !");
        return { status: true, message: "Appel à l'API pour rechercher un aliment à partir d'un code barre réussi !", aliment: response.data.aliment };

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour rechercher un aliment à partir d'un code barre :", error.message);
        return { status: false, message: error.message };
    }
};

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone de création et d'usage d'un aliment
export const getPoidsCarboneAliment = async (type_action, code, quantity_value, quantity_unit) => {
    console.log("🥕​ Récupération du poids carbone d'un aliment...");
    try {
        // appel à l'API
        console.log("🌐​ Appel à l'API pour récupérer le poids carbone d'un aliment...");
        // console.log("👉​ Code :", code);
        // console.log("👉​ Quantity_value :", quantity_value);
        // console.log("👉​ Quantity_unit :", quantity_unit);
        const response = await api.get(`/aliments/co2?barcode=${code}&quantity_value=${quantity_value}&quantity_unit=${quantity_unit}`);

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        // récupération du poids carbone de création
        let co2
        if (type_action === 'creation') {
            co2 = response.data.co2_creation;
        } else if (type_action === 'usage') {
            co2 = response.data.co2_usage;
        }

        console.log("✅​ Appel à l'API pour récupérer le poids carbone d'un aliment réussi !");
        return co2;

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour récupérer le poids carbone d'un aliment :", error.message);
        throw error;
    }
};