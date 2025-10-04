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

import { getdb } from "../../db/db.js";

////////////////////////////////////////////////////////////////////////////////////
// TRACKING D'ACTIVITES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des utilisateurs à notifier
export const getUsersToNotify = async () => {
    console.log("🔔​ Récupération des utilisateurs à notifier...");
    try {
        // récupération de la date du jour
        const today = new Date().toISOString().split('T')[0];
        console.log("👉​ Date du jour :", today);

        // récupération de la db et des utilisateurs
        const db = await getdb();
        const users = await db.getUsersActivities();
        console.log("👉​ Utilisateurs :", users);

        // filtrage des utilisateurs inactifs (dernière activité avant aujourd'hui)
        const usersToNotify = users.filter(user => {
            const lastActivityDate = new Date(user.last_activity_date).toISOString().split('T')[0];
            return lastActivityDate < today;
        });

        // vérification de la réponse
        console.log("👉​ Utilisateurs à notifier :", usersToNotify);

        console.log("✅​ Utilisateurs à notifier récupérés avec succès !");

        // retour uniquement des expo tokens
        return usersToNotify.map(user => user._id);

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des utilisateurs à notifier :", error.message);
        throw error;
    }
};

// POST - Enregistrement de l'activité d'un utilisateur
export const saveUserActivity = async (expoToken, lastActivityDate) => {
    console.log("🔔​ Enregistrement de l'activité d'un utilisateur...");
    try {
        // récupération de la db et enregistrement de l'activité
        const db = await getdb();
        const user = await db.getUserActivity(expoToken); // récupération de l'utilisateur
        console.log("👉​ Utilisateur :", user);
        let activity;
        if (!user) {
            activity = await db.createUserActivity(expoToken, lastActivityDate); // si l'utilisateur n'existe pas, on crée une nouvelle activité
        } else {
            activity = await db.updateUserActivity(expoToken, lastActivityDate); // si l'utilisateur existe, on met à jour l'activité
        }

        // vérification de l'enregistrement
        console.log("👉​ Activité enregistrée :", activity);

        console.log("✅​ Activité enregistrée avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de l'enregistrement de l'activité d'un utilisateur :", error.message);
        throw error;
    }
};

// DELETE - Suppression d'un utilisateur
export const deleteUser = async (expoToken) => {
    console.log("🔔​ Suppression d'un utilisateur...");
    try {
        // récupération de la db et suppression de l'utilisateur
        const db = await getdb();
        const deletedUser = await db.deleteUser(expoToken);

        // vérification de la suppression
        console.log("👉​ Utilisateur supprimé :", deletedUser);

        console.log("✅​ Utilisateur supprimé avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression d'un utilisateur :", error.message);
        throw error;
    }
};