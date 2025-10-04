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
import { getAllCategoriesTransports, getPoidsCarboneCreationTransport, getPoidsCarboneUsageTransport } from "../services/transportsService.js";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////
// CATEGORIES DE TRANSPORTS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des catégories de transports
/**
 * @swagger
 * /transports/categories:
 *   get:
 *     summary: Récupération des catégories de transports
 *     tags:
 *       - Transports
 *     responses:
 *       200:
 *         description: Liste des catégories de transports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Identifiant de la catégorie de transport
 *                       nom:
 *                         type: string
 *                         description: Nom de la catégorie de transport
 *       500:
 *         description: Erreur lors de la récupération des catégories de transports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération des catégories de transports : error message"
 */
router.get("/categories", async (req, res) => {
    console.log("\n🚗​ Récupération des catégories de transports...");
    try {
        // récupération des catégories de transports
        const categories = await getAllCategoriesTransports();

        // réponse de la requête
        res.status(200).json({ categories: categories });
        console.log("200: ✅​ Catégories de transports récupérées avec succès !");

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de la récupération des catégories de transports : " + error.message });
        console.error("500: ❌​ Erreur lors de la récupération des catégories de transports : ", error.message);
    }
});

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone de création d'un transport
/**
 * @swagger
 * /transports/co2/creation:
 *   get:
 *     summary: Récupération du poids carbone de création d'un transport
 *     tags:
 *       - Transports
 *     parameters:
 *       - name: categorie_id
 *         in: query
 *         required: true
 *         description: Identifiant de la catégorie de transport
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Poids carbone de création du transport (en kgCO2eq)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 co2_creation:
 *                   type: number
 *                   description: Poids carbone de création du transport (en kgCO2eq)
 *                   example: 100.5
 *       404:
 *         description: Catégorie de transport non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "404: Catégorie de transport non trouvée"
 *       500:
 *         description: Erreur lors de la récupération du poids carbone de création du transport
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération du poids carbone de création du transport : error message"
 */
router.get("/co2/creation", async (req, res) => {
    console.log("\n🚗​ Récupération du poids carbone de création d'un transport...");
    try {
        // récupération des paramètres de la requête
        const { categorie_id } = req.query;

        // récupération du poids carbone de création du transport
        const co2_creation = await getPoidsCarboneCreationTransport(categorie_id);

        // réponse de la requête
        res.status(200).json({ co2_creation: co2_creation });
        console.log("200: ✅​ Poids carbone de création du transport récupéré avec succès !");

    } catch (error) {
        if (error.message.includes("404")) {
            res.status(404).json({ error: "404: Catégorie de transport non trouvée" });
            console.error("404: ❌​ Catégorie de transport non trouvée");
        } else {
            res.status(500).json({ error: "❌​ Erreur lors de la récupération du poids carbone de création du transport : " + error.message });
            console.error("500: ❌​ Erreur lors de la récupération du poids carbone de création du transport : ", error.message);
        }
    }
});

// GET - Récupération du poids carbone d'usage d'un transport
/**
 * @swagger
 * /transports/co2/usage:
 *   get:
 *     summary: Récupération du poids carbone d'usage d'un transport
 *     tags:
 *       - Transports
 *     parameters:
 *       - name: categorie_id
 *         in: query
 *         required: true
 *         description: Identifiant de la catégorie de transport
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: distance_km
 *         in: query
 *         required: true
 *         description: Distance parcourue en km
 *         schema:
 *           type: number
 *           example: 100.5
 *     responses:
 *       200:
 *         description: Poids carbone d'usage du transport (en kgCO2eq)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 co2_usage:
 *                   type: number
 *                   description: Poids carbone d'usage du transport (en kgCO2eq)
 *                   example: 100.5
 *       500:
 *         description: Erreur lors de la récupération du poids carbone d'usage du transport
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération du poids carbone d'usage du transport : error message"
 */
router.get("/co2/usage", async (req, res) => {
    console.log("\n🚗​ Récupération du poids carbone d'usage d'un transport...");
    try {
        // récupération des paramètres de la requête
        const { categorie_id, distance_km } = req.query;

        // récupération du poids carbone d'usage du transport
        const co2_usage = await getPoidsCarboneUsageTransport(categorie_id, distance_km);

        // réponse de la requête
        res.status(200).json({ co2_usage: co2_usage });
        console.log("200: ✅​ Poids carbone d'usage du transport récupéré avec succès !");

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de la récupération du poids carbone d'usage du transport : " + error.message });
        console.error("500: ❌​ Erreur lors de la récupération du poids carbone d'usage du transport : ", error.message);
    }
});

export default router;