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

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { resetdb } from './connectdb';

const DB_NAME = 'carbon-track-db.db';
const DB_PATH = FileSystem.documentDirectory + 'SQLite/' + DB_NAME;

export const importdb = async () => {
    try {
        // sélection du fichier à importer
        const res = await DocumentPicker.getDocumentAsync({
            type: 'application/octet-stream',
            copyToCacheDirectory: true,
        });

        if (res.canceled) {
            console.log('❌​ L\'importation de la base de données a échoué');
            throw new Error("L'importation de la base de données a échoué");
        }

        // récupération du fichier sélectionné
        const file = res.assets[0];
        const fileUri = file.uri;

        // suppression de l'ancienne base de données (si elle existe)
        const info = await FileSystem.getInfoAsync(DB_PATH);
        if (info.exists) {
            await FileSystem.deleteAsync(DB_PATH);
        }

        // copie du fichier choisi vers le chemin SQLite attendu
        await FileSystem.copyAsync({
            from: fileUri,
            to: DB_PATH,
        });

        resetdb(); // réinitialisation de la base de données (pour éviter les conflits)

        console.log('✅​ Importation de la base de données réussie !');
        return { status: true, message: "Vos données ont bien été importées !" };

    } catch (error) {
        console.log('❌​ Erreur lors de l\'importation de la base de données :', error.message);
        return { status: false, message: error.message };
    }
}