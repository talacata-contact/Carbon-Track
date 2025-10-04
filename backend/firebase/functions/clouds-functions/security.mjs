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

import { rateLimit } from "express-rate-limit";
import { getFirebaseAdmin } from "./firebase-admin.mjs";

// middleware de sécurisation des appels aux routes (Firebase App Check, Firebase Auth et rate limiting)
export async function securityMiddleware(req, res, next) {
    try {
        // on vérifie d'abord Auth
        await checkAuth(req);
        // auth réussie → user Limiter (rate limit par UID)
        return userLimiter(req, res, () => {
            next();
        });
    } catch (err) {
        // auth échouée → failed Limiter
        return failedAuthLimiter(req, res, () => {
            res.status(401).json({ error: err.message || "Unauthorized" });
        });
    }
}

// vérification de l'utilisateur appelant (avec Firebase Auth)
async function checkAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("🔑 No auth token provided");
        throw new Error("No auth token provided");
    }
    const idToken = authHeader.split(" ")[1];
    try {
        const admin = await getFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        console.log("🔑 Firebase Auth ok");
    } catch (err) {
        console.error("🔑 Firebase Auth error:", err);
        throw new Error("Invalid auth token");
    }
}

// rate limiter pour les requêtes authentifiées : 100 requêtes / 15 minutes (par UID)
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    keyGenerator: (req, res) => {
        console.log("🔒 Rate limit key: UID");
        return req.user.uid;
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`🚨 Too many requests for UID=${req.user.uid}`);
        return res.status(429).json({ error: "Too many requests, please try again later." });
    },
});

// rate limiter pour les requêtes non authentifiées : 2 requêtes / 15 minutes
const failedAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 2,
    keyGenerator: (req, res) => {
        console.log("🔒 Rate limit key: user_unauthenticated");
        return "user_unauthenticated";
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`🚨 Too many failed authentication requests`);
        return res.status(429).json({ error: "Too many failed authentication attempts, please try again later." });
    },
});

// rate limiter spécifique pour les notifications : 5 requêtes / minute (par UID)
export const notifLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 5,
    keyGenerator: (req, res) => req.user.uid,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`🚨 Too many notification requests for UID=${req.user.uid}`);
        return res.status(429).json({ error: "Too many notification requests, please try again later." });
    },
});