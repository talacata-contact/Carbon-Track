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
import { saveUserActivity, getUsersToNotify } from "../services/notificationsService.js";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////
// ENREGISTREMENT D'ACTIVITES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des utilisateurs à notifier
/**
 * @swagger
 * /notifications/get-users-to-notify:
 *   get:
 *     summary: Récupération des notifications
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Notifications récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   description: Notifications
 *                   example: [
 *                     {
 *                       _id: "ExponentPushToken[1234567890]",
 *                       lastActivityDate: "2024-01-01"
 *                     }
 *                   ]
 *       500:
 *         description: Erreur lors de la récupération des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de la récupération des notifications : error message"
 */
router.get("/get-users-to-notify", async (req, res) => {
    console.log("\n🔔​ Récupération des utilisateurs à notifier...");
    try {
        // récupération des utilisateurs à notifier
        const usersToNotify = await getUsersToNotify();

        // réponse de la requête
        res.status(200).json({ usersToNotify: usersToNotify });
        console.log("200: ✅​ Utilisateurs à notifier récupérés avec succès !");

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de la récupération des utilisateurs à notifier : " + error.message });
        console.error("500: ❌​ Erreur lors de la récupération des utilisateurs à notifier : ", error.message);
    }
});

// POST - Enregistrement de l'activité d'un utilisateur
/**
 * @swagger
 * /notifications/save-user-activity:
 *   post:
 *     summary: Enregistrement de l'activité d'un utilisateur
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expoToken:
 *                 type: string
 *                 description: Token Expo de l'utilisateur
 *                 example: "ExponentPushToken[1234567890]"
 *               lastActivityDate:
 *                 type: string
 *                 description: Date de la dernière activité de l'utilisateur
 *                 example: "2024-01-01"
 *     responses:
 *       200:
 *         description: Activité enregistrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de succès
 *                   example: "✅​ Activité enregistrée avec succès !"
 *       400:
 *         description: Paramètres manquants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Paramètres manquants : expoToken et lastActivityDate sont requis"
 *       500:
 *         description: Erreur lors de l'enregistrement de l'activité
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur
 *                   example: "❌​ Erreur lors de l'enregistrement de l'activité : error message"
 */
router.post("/save-user-activity", async (req, res) => {
    console.log("\n🔔​ Enregistrement de l'activité d'un utilisateur...");

    try {
        // récupération des paramètres de la requête
        const { expoToken, lastActivityDate } = req.body;

        // vérification des paramètres
        if (!expoToken || !lastActivityDate) {
            res.status(400).json({ error: "❌​ Paramètres manquants : expoToken et lastActivityDate sont requis" });
            console.error("400: ❌​ Paramètres manquants : expoToken et lastActivityDate sont requis");
            return;
        }

        // enregistrement de l'activité
        await saveUserActivity(expoToken, lastActivityDate);

        // réponse de la requête
        res.status(200).json({ message: "✅​ Activité enregistrée avec succès !" });

    } catch (error) {
        res.status(500).json({ error: "❌​ Erreur lors de l'enregistrement de l'activité: " + error.message });
        console.error("500: ❌​ Erreur lors de l'enregistrement de l'activité : ", error.message);
    }
});

export default router;