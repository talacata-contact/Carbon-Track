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

import { getApp } from "@react-native-firebase/app";
import { getAuth, signInAnonymously } from "@react-native-firebase/auth";

// 🔑 Firebase Auth anonyme (pour identifier l'utilisateur)
export async function loginAnonymously() {
    const app = getApp();
    const auth = getAuth(app);

    if (!auth.currentUser) {
        await signInAnonymously(auth);
    }
    return auth.currentUser;
}