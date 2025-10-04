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
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { connectdb, disconnectdb } from "../db/db.js";
import logementsRoutes from "../api/routes/logements.js";
import transportsRoutes from "../api/routes/transports.js";
import alimentsRoutes from "../api/routes/aliments.js"
import moyennesFrRoutes from "../api/routes/moyennesFr.js"
import suggestionsRoutes from "../api/routes/suggestions.js"
import notificationsRoutes from "../api/routes/notifications.js"
import swaggerSpec from "../api/swagger.js";

dotenv.config();
const PORT = process.env.PORT;

////////////////////////////////////////////////////////////////////////////////////
// BACKEND EXPRESS
////////////////////////////////////////////////////////////////////////////////////

// connexion à la base de données
await connectdb();

// création du serveur express
const app = express();

// middlewares
app.use(express.json()); // pour pouvoir lire le body des requêtes (POST)

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        showExtensions: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        requestInterceptor: (req) => {
            req.headers['Content-Type'] = 'application/json';
            return req;
        }
    }
}));

// routes
app.get("/", (req, res) => {
    res.send("✅​ API Carbon Track is running !");
});
app.use("/logements", logementsRoutes);
app.use("/transports", transportsRoutes);
app.use("/aliments", alimentsRoutes);
app.use("/moyennesFr", moyennesFrRoutes);
app.use("/suggestions", suggestionsRoutes);
app.use("/notifications", notificationsRoutes);

// démarrage du serveur (0.0.0.0 pour que le serveur soit accessible depuis l'extérieur)
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🔄​​ Serveur en cours d'exécution sur le port http://localhost:${PORT} ...`);
    console.log(`📖​​​ API Docs: http://localhost:${PORT}/api-docs`);
});

// arrêt du serveur
const stopServer = async () => {
    console.log("\n🛑​ Arrêt du serveur...");
    server.close();
    await disconnectdb();
    console.log("✅​ Serveur arrêté");
    process.exit(0);
};

// écoute des signaux d'arrêt (ctrl+c)
process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);