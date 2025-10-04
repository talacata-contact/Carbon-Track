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

import { getdb } from '@/db/connectdb';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetApp = async () => {
  try {
    console.log("🔄 Réinitialisation de l'application...");

    // 1. Suppression du flag de premier lancement
    await AsyncStorage.removeItem('hasLaunched');
    console.log("✅ Flag 'hasLaunched' supprimé");

    // 2. Suppression de l'utilisateur de la base
    const db = await getdb();
    await db.runAsync('DELETE FROM utilisateur');
    console.log("✅ Table 'utilisateur' vidée");

    console.log("🎯 Réinitialisation terminée. Vous pouvez relancer l'app.");
    return { status: true, message: "Réinitialisation terminée" };
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation :", error.message);
    return { status: false, message: error.message };
  }
};
