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

import { onSchedule } from "firebase-functions/v2/scheduler";
import { Expo } from "expo-server-sdk";
import { getUsersToNotify, deleteUser } from "../api/services/notificationsService.mjs";
import { connectdb } from "../db/db.mjs";

// initialisation de l'objet Expo
const expo = new Expo();

// fonction planifiée tous les jours à 19h (heure de Paris) pour notifier les utilisateurs
export const dailyUserNotifications = onSchedule(
    {
        schedule: "0 19 * * *", // tous les jours à 19h (minute, heure, jour, mois, jour de la semaine)
        timeZone: "Europe/Paris",
        region: "europe-west1"
    },
    async (event) => {
        console.log("⏰ Lancement de la vérification quotidienne des utilisateurs à notifier...");
        try {
            // connexion à la base de données
            await connectdb();

            // récupération des expo tokens des utilisateurs à notifier
            const tokens = await getUsersToNotify();

            if (tokens.length === 0) {
                console.log("✅ Aucun utilisateur à notifier aujourd’hui");
                return null;
            }

            // construction des messages
            let messages = [];
            for (const token of tokens) {
                // suppression des tokens non valides (pas au format ExpoPushToken[...])
                if (!Expo.isExpoPushToken(token)) {
                    console.log("❌ Token invalide :", token);
                    try {
                        await deleteUser(token);
                    } catch (err) {
                        console.error("❌ Erreur lors de la suppression d'un utilisateur :", err.message);
                    }
                    continue;
                }

                messages.push({
                    to: token,
                    sound: "default",
                    title: "Ton bilan carbone t’attend !",
                    body: "Découvre combien de CO2 tu as émis aujourd’hui 👀",
                    data: { type: "reminder" },
                });
            }

            // divise en chunk pour éviter les limites Expo
            const chunks = expo.chunkPushNotifications(messages);

            // envoi des notifications
            for (let chunk of chunks) {
                try {
                    const tickets = await expo.sendPushNotificationsAsync(chunk);
                    // console.log("👉 Tickets reçus :", tickets);

                    // suppression des tokens périmés (utilisateurs qui ont supprimé l'app)
                    for (let i = 0; i < tickets.length; i++) {
                        const ticket = tickets[i];
                        const token = chunk[i].to;
                        if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
                            console.log("🔄 Token non valide, suppression de l'utilisateur de la base de données");
                            try {
                                await deleteUser(token);
                            } catch (err) {
                                console.error("❌ Erreur lors de la suppression d'un utilisateur :", err.message);
                            }
                        }
                    }
                } catch (err) {
                    console.error("❌ Erreur lors de l'envoi d'une notification :", err.message);
                }
            }

            console.log("✅ Notifications envoyées avec succès !");

        } catch (error) {
            console.error("❌ Erreur lors de la vérification quotidienne des utilisateurs à notifier :", error.message);
        }

        return null;
    });