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

import express from "express";
import { getPoidsCarboneAliment, searchAlimentByText, searchAlimentByBarcode } from "../services/alimentsService.mjs";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////
// RECHERCHES
////////////////////////////////////////////////////////////////////////////////////

// GET - Recherche d'un aliment à partir d'un texte
/**
 * @swagger
 * /aliments/search/text:
 *   get:
 *     summary: Recherche d'un aliment à partir d'un texte
 *     tags:
 *       - Aliments
 *     parameters:
 *       - name: text
 *         in: query
 *         required: true
 *         description: Texte de recherche
 *         schema:
 *           type: string
 *           example: "Nutella"
 *     responses:
 *       200:
 *         description: Liste des aliments trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 aliments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       product_name:
 *                         type: string
 *                       brands:
 *                         type: string
 *                       food_groups_tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       quantity:
 *                         type: string
 *                       image_url:
 *                         type: string
 *                   example:
 *                     - code: "1234567890"
 *                       product_name: "Pâte à tartiner"
 *                       brands: "Nutella"
 *                       food_groups_tags: ["Chocolat", "Pâte à tartiner"]
 *                       quantity: "100g"
 *                       image_url: "https://example.com/image.jpg"
 *       404:
 *         description: Aucun aliment trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "❌ Erreur lors de la recherche de l'aliment : 404: No data found for this text"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "❌ Erreur lors de la recherche de l'aliment : 500: Internal server error"
 */
router.get("/search/text", async (req, res) => {
    console.log("\n🥕​ Recherche d'un aliment à partir d'un texte...");
    try {
        // récupération des paramètres de la requête
        const { text } = req.query;

        // récupération de la liste des aliments correspondants
        const aliments = await searchAlimentByText(text);

        // réponse de la requête
        res.status(200).json({ aliments: aliments });
        console.log("200: ✅​ Aliments trouvés avec succès !");

    } catch (error) {
        if (error.message.includes("404")) {
            res.status(404).json({ error: "❌​ Erreur lors de la recherche de l'aliment : " + error.message });
            console.log("404: ❌​ Erreur lors de la recherche de l'aliment : " + error.message);
        } else {
            res.status(500).json({ error: "❌​ Erreur lors de la recherche de l'aliment : " + error.message });
            console.log("500: ❌​ Erreur lors de la recherche de l'aliment : " + error.message);
        }
    }
});

// GET - Recherche d'un aliment à partir d'un code barre
/**
 * @swagger
 * /aliments/search/barcode:
 *   get:
 *     summary: Recherche d'un aliment à partir d'un code barre
 *     tags:
 *       - Aliments
 *     parameters:
 *       - name: barcode
 *         in: query
 *         required: true
 *         description: Code barre de l'aliment
 *         schema:
 *           type: string
 *           example: "3017620425035"
 *     responses:
 *       200:
 *         description: Aliment trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 aliment:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       description: Code barre de l'aliment
 *                       example: "1234567890"
 *                     product_name:
 *                       type: string
 *                       description: Nom de l'aliment
 *                       example: "Pâte à tartiner"
 *                     brands:
 *                       type: string
 *                       description: Marque de l'aliment
 *                       example: "Nutella"
 *                     food_groups_tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Groupes alimentaires de l'aliment
 *                       example: ["Chocolat", "Pâte à tartiner"]
 *                     quantity:
 *                       type: string
 *                       description: Quantité de l'aliment
 *                       example: "100g"
 *                     image_url:
 *                       type: string
 *                       description: URL de l'image de l'aliment
 *                       example: "https://example.com/image.jpg"
 *       404:
 *         description: Aucun aliment trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌ Erreur lors de la recherche de l'aliment : Request failed with status code 404"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌ Erreur lors de la recherche de l'aliment : error message"
 */
router.get("/search/barcode", async (req, res) => {
    console.log("\n🥕​ Recherche d'un aliment à partir d'un code barre...");
    try {
        // récupération des paramètres de la requête
        const { barcode } = req.query;

        // récupération de l'aliment correspondant
        const aliment = await searchAlimentByBarcode(barcode);

        // réponse de la requête
        res.status(200).json({ aliment: aliment });
        console.log("200: ✅​ Aliment trouvé avec succès !");

    } catch (error) {
        if (error.message.includes("404")) {
            res.status(404).json({ error: "❌​ Erreur lors de la recherche de l'aliment : " + error.message });
            console.log("404: ❌​ Erreur lors de la recherche de l'aliment : " + error.message);
        } else {
            res.status(500).json({ error: "❌​ Erreur lors de la recherche de l'aliment : " + error.message });
            console.log("500: ❌​ Erreur lors de la recherche de l'aliment : " + error.message);
        }
    }
});

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone de création et d'usage d'un aliment
/**
 * @swagger
 * /aliments/co2:
 *   get:
 *     summary: Récupération du poids carbone de création et d'usage d'un aliment
 *     tags:
 *       - Aliments
 *     parameters:
 *       - in: query
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *           example: "3017620425035"
 *         description: Code barre de l'aliment
 *       - in: query
 *         name: quantity_value
 *         required: true
 *         schema:
 *           type: number
 *           example: 100
 *         description: Quantité de l'aliment
 *       - in: query
 *         name: quantity_unit
 *         required: true
 *         schema:
 *           type: string
 *           example: "g"
 *         description: Unité de la quantité
 *     responses:
 *       200:
 *         description: Poids carbone de création (en kgCO2eq) et d'usage (en gCO2eq) de l'aliment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 co2_creation:
 *                   type: number
 *                   description: Poids carbone de création de l'aliment (en kgCO2eq)
 *                   example: 100.5
 *                 co2_usage:
 *                   type: number
 *                   description: Poids carbone d'usage de l'aliment (en gCO2eq)
 *                   example: 200.5
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération du poids carbone de création et d'usage de l'aliment : error message"
 */
router.get("/co2", async (req, res) => {
    console.log("\n🥕​ Récupération du poids carbone de création et d'usage d'un aliment...");
    try {
        // récupération des paramètres de la requête
        const { barcode, quantity_value, quantity_unit } = req.query;

        // récupération du poids carbone de création et d'usage de l'aliment
        const { co2_creation, co2_usage } = await getPoidsCarboneAliment(barcode, quantity_value, quantity_unit);

        // réponse de la requête
        res.status(200).json({ co2_creation: co2_creation, co2_usage: co2_usage });
        console.log("200: ✅​ Poids carbone de création et d'usage de l'aliment récupéré avec succès !");

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de la récupération du poids carbone de création et d'usage de l'aliment : " + error.message });
        console.log("500: ❌​ Erreur lors de la récupération du poids carbone de création et d'usage de l'aliment : ", error.message);
    }
});

export default router;  