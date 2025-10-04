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

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import express from "express";
import { connectdb } from "../db/db.mjs";
import { securityMiddleware, notifLimiter } from "./security.mjs";
import logementsRoutes from "../api/routes/logements.mjs";
import transportsRoutes from "../api/routes/transports.mjs";
import alimentsRoutes from "../api/routes/aliments.mjs"
import moyennesFrRoutes from "../api/routes/moyennesFr.mjs"
import suggestionsRoutes from "../api/routes/suggestions.mjs"
import notificationsRoutes from "../api/routes/notifications.mjs"

// configuration de la région
setGlobalOptions({ region: "europe-west9" });

// création du serveur express
const app = express();

// middlewares
app.use(express.json()); // pour pouvoir lire le body des requêtes (POST)
app.use(securityMiddleware); // sécurisation des appels aux routes (Firebase Auth et rate limiting)

// routes
app.use("/logements", logementsRoutes); // routes pour les logements
app.use("/transports", transportsRoutes); // routes pour les transports
app.use("/aliments", alimentsRoutes); // routes pour les aliments
app.use("/moyennesFr", moyennesFrRoutes); // routes pour les moyennes fr
app.use("/suggestions", suggestionsRoutes); // routes pour les suggestions
app.use("/notifications", notifLimiter, notificationsRoutes); // routes pour les notifications

// déploiement sur Firebase
export const api = onRequest(async (req, res) => {
    try {
        await connectdb(); // connexion à la base de données
        return app(req, res);
    } catch (err) {
        console.error("❌ Erreur lors de la connexion à la base de données :", err.message);
        res.status(500).json({ error: "Une erreur est survenue lors de la connexion à la base de données" });
    }
});