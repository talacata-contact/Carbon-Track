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

import { getIdToken } from "@react-native-firebase/auth";
import axios from "axios";
import { loginAnonymously } from "../firebase/firebaseConfig";

// URL de l'API
export const API_URL = ""; // TODO : changer par votre URL

// API
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json'
    },
    timeout: 10000,
});

// Interceptor pour ajouter Firebase auth
api.interceptors.request.use(async (config) => {
    try {
        // 🔑 Firebase Auth
        const user = await loginAnonymously();
        const idToken = await getIdToken(user);
        // console.log("🔑 Firebase Auth :", idToken);
        config.headers["Authorization"] = `Bearer ${idToken}`;

        return config;
    } catch (err) {
        console.error("❌ Erreur interceptor API :", err);
        return Promise.reject(err);
    }
});

export default api;