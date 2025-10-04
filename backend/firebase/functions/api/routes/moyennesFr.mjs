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
import { getAllMoyennesFr } from "../services/moyennesFrService.mjs";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////
// MOYENNES FR
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de toutes les moyennes fr
/**
 * @swagger
 * /moyennesFr:
 *   get:
 *     summary: Récupération de toutes les moyennes fr
 *     tags:
 *       - Moyennes fr
 *     responses:
 *       200:
 *         description: Liste des moyennes fr
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 moyennesFr:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Identifiant de la moyenne fr
 *                       categorie:
 *                         type: string
 *                         description: Catégorie de la moyenne fr ("logement", "aliment", "transport")
 *                       type_action:
 *                         type: string
 *                         description: Type d'action ("création", "usage")
 *                       moyenne_value:
 *                         type: number
 *                         description: Valeur de la moyenne fr
 *                       moyenne_unit:
 *                         type: string
 *                         description: Unité de la moyenne fr
 *       500:
 *         description: Erreur lors de la récupération des moyennes fr
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération des moyennes fr : error message"
 */
router.get("/", async (req, res) => {
    console.log("\n📊​​ Récupération des moyennes fr...");
    try {
        // récupération des moyennes fr
        const moyennesFr = await getAllMoyennesFr();

        // réponse de la requête
        res.status(200).json({ moyennesFr: moyennesFr });
        console.log("200: ✅​ Moyennes fr récupérées avec succès !");

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de la récupération des moyennes fr : " + error.message });
        console.error("500: ❌​ Erreur lors de la récupération des moyennes fr : ", error.message);
    }
});

export default router;