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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

////////////////////////////////////////////////////////////////////////////////////
// NOTIFICATIONS
////////////////////////////////////////////////////////////////////////////////////

// POST - Enregistrement de l'activité de l'utilisateur dans la backend
const postUserActivity = async (expoToken, lastActivityDate) => {
    console.log("🌐​​ Appel à l'API pour enregistrer l'activité de l'utilisateur dans la backend...");
    try {
        // appel à l'API
        const response = await api.post('/notifications/save-user-activity', {
            expoToken,
            lastActivityDate
        });

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour enregistrer l'activité de l'utilisateur dans la backend réussi !");

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour enregistrer l'activité de l'utilisateur dans la backend :", error.message);
        throw error;
    }
};

// SYNC - Synchronisation de l'activité de l'utilisateur dans la backend
export const syncUserActivity = async () => {
    console.log("👤​ Synchronisation de l'activité de l'utilisateur...");
    try {
        // vérifcation que l'appareil est physique (pas un émulateur)
        if (!Device.isDevice) {
            console.log("❌​ Les notifications ne sont pas disponibles sur les émulateurs.");
            throw new Error("Les notifications ne sont pas disponibles sur les émulateurs.");
        }

        // vérification si on a déjà demandé la permission
        const hasAskedPermission = await AsyncStorage.getItem('notification_permission_asked');

        if (hasAskedPermission) {
            // on a déjà demandé, on vérifie juste le statut actuel
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            if (existingStatus !== 'granted') {
                console.log("❌​ Permission refusée pour les notifications (déjà demandée précédemment).");
                throw new Error("Permission refusée pour les notifications.");
            }
        } else {
            // première fois, on demande la permission
            console.log("🔔​ Première demande de permission pour les notifications...");
            const { status } = await Notifications.requestPermissionsAsync();

            // on mémorise qu'on a demandé la permission
            await AsyncStorage.setItem('notification_permission_asked', 'true');

            if (status !== 'granted') {
                console.log("❌​ Permission refusée pour les notifications.");
                throw new Error("Permission refusée pour les notifications.");
            }
        }

        // récupération du token Expo
        const token = await Notifications.getExpoPushTokenAsync();
        const expoToken = token.data;

        // récupération de la date du jour
        const lastActivityDate = new Date().toISOString().split('T')[0];

        // vérification des paramètres
        // console.log("🔑​ Token Expo :", expoToken);
        // console.log("🗓️​  Date de la dernière activité :", lastActivityDate);

        // enregistrement de l'activité de l'utilisateur dans la backend
        await postUserActivity(expoToken, lastActivityDate);

        console.log("✅​ Activité de l'utilisateur synchronisée avec succès !");
        return { status: true, message: "Activité de l'utilisateur synchronisée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation de l'activité de l'utilisateur :", error.message);
        return { status: false, message: error.message };
    }
};

export const sendLocalNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: { seconds: 1 },
    });
};