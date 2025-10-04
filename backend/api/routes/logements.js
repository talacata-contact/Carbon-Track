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
import { getAllChauffages, getPoidsCarboneLogement } from "../services/logementsService.js";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////
// CHAUFFAGES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de tous les chauffages
/**
 * @swagger
 * /logements/chauffages:
 *   get:
 *     summary: Récupération de tous les chauffages
 *     tags:
 *       - Logements
 *     responses:
 *       200:
 *         description: Liste des chauffages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chauffages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Identifiant du chauffage
 *                       nom:
 *                         type: string
 *                         description: Nom du chauffage
 *       500:
 *         description: Erreur lors de la récupération des chauffages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération des chauffages : error message"
 */
router.get("/chauffages", async (req, res) => {
    console.log("\n🏠​ Récupération des chauffages...");
    try {
        // récupération des chauffages
        const chauffages = await getAllChauffages();

        // réponse de la requête
        res.status(200).json({ chauffages: chauffages });
        console.log("200: ✅​ Chauffages récupérées avec succès !");

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de la récupération des chauffages : " + error.message });
        console.error("500: ❌​ Erreur lors de la récupération des chauffages : ", error.message);
    }
});

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone d'un logement
/**
 * @swagger
 * /logements/co2:
 *   get:
 *     summary: Récupération du poids carbone d'un logement
 *     tags:
 *       - Logements
 *     parameters:
 *       - name: chauffage_id
 *         in: query
 *         required: true
 *         description: Identifiant du chauffage
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: superficie_m2
 *         in: query
 *         required: true
 *         description: Superficie du logement en m2
 *         schema:
 *           type: number
 *           example: 100
 *     responses:
 *       200:
 *         description: Poids carbone du logement (en kgCO2eq/jour)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 co2:
 *                   type: number
 *                   description: Poids carbone du logement (en kgCO2eq/jour)
 *                   example: 100.5
 *       500:
 *         description: Erreur lors de la récupération du poids carbone du logement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération du poids carbone du logement : error message"
 */
router.get("/co2", async (req, res) => {
    console.log("\n🏠​ Récupération du poids carbone d'un logement...");
    try {
        // récupération des paramètres de la requête
        const { chauffage_id, superficie_m2 } = req.query;

        // récupération du poids carbone du logement
        const co2 = await getPoidsCarboneLogement(chauffage_id, superficie_m2);

        // réponse de la requête
        res.status(200).json({ co2: co2 });
        console.log("200: ✅​ Poids carbone du logement récupéré avec succès !");

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de la récupération du poids carbone du logement : " + error.message });
        console.error("500: ❌​ Erreur lors de la récupération du poids carbone du logement : ", error.message);
    }
});

export default router;