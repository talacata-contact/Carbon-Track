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

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const DB_NAME = 'carbon-track-db.db';

export const exportdb = async () => {
    console.log("🔄​ Exportation de la base de données...");
    try {
        // Récupération du chemin de la base de données
        const dbPath = FileSystem.documentDirectory + 'SQLite/' + DB_NAME;

        // Vérification de l'existence de la base de données
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        if (!fileInfo.exists) {
            console.log("❌​ La base de données n'a pas été trouvée !");
            throw new Error("La base de données n'a pas été trouvée !");
        }

        // Partage du fichier (AirDrop, Email, Messages, Google Drive, Dropbox, OneDrive, WhatsApp, Telegram,dossier local / cloud)
        await Sharing.shareAsync(dbPath);

        console.log("✅​ Exportation de la base de données réussie !");
        return { status: true, message: "Vos données ont bien été exportées !" };

    } catch (error) {
        console.log("❌​ Erreur lors de l'exportation de la base de données :", error.message);
        return { status: false, message: error.message };
    }
}