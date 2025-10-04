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
import { getAllSuggestions } from "../services/suggestionsService.mjs";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////
// SUGGESTIONS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de toutes les suggestions
/**
 * @swagger
 * /suggestions:
 *   get:
 *     summary: Récupération de toutes les suggestions
 *     tags:
 *       - Suggestions
 *     responses:
 *       200:
 *         description: Liste des suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Identifiant de la suggestion
 *                       categorie:
 *                         type: string
 *                         description: Catégorie de la suggestion ("logement", "aliment", "transport")
 *                       contexte:
 *                         type: object
 *                         description: Contexte de la suggestion
 *                       suggestion:
 *                         type: string
 *                         description: Suggestion
 *                       explications:
 *                         type: string
 *                         description: Explications de la suggestion
 *                       sources:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Source de la suggestion
 *       500:
 *         description: Erreur lors de la récupération des suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération des suggestions : error message"
 */
router.get("/", async (req, res) => {
    console.log("\n🎯​​ Récupération des suggestions...");
    try {
        // récupération des suggestions
        const suggestions = await getAllSuggestions();

        // réponse de la requête
        res.status(200).json({ suggestions: suggestions });
        console.log("200: ✅​ Suggestions récupérées avec succès !");

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de la récupération des suggestions : " + error.message });
        console.error("500: ❌​ Erreur lors de la récupération des suggestions : ", error.message);
    }
});

export default router;