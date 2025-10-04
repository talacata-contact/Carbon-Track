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

import { getFirestore } from 'firebase-admin/firestore';
import { getdbConfig } from './config.mjs';
import { getFirebaseAdmin } from '../clouds-functions/firebase-admin.mjs';
import { logementsChauffages, transportsCategories, moyennesFr, suggestions } from './tables.mjs';

class Firestore {
    // constructeur
    constructor() {
        this.admin = null;
        this.db = null;
        this.config = getdbConfig();
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // DB
    /////////////////////////////////////////////////////////////////////////////////////

    // fonction pour se connecter à la base de données
    async connect() {
        if (!this.db) {
            console.log(`\n📦​ Connexion à Firestore (${this.config.database})...`);
            try {
                this.admin = await getFirebaseAdmin(); // récupération de l'instance firebase admin
                this.db = getFirestore(this.admin.app(), this.config.database); // connexion à la base de données
                console.log("✅​ Serveur connecté à Firestore !");
            } catch (err) {
                console.log("❌​ Erreur lors de la connexion à Firestore : ", err.message);
                throw err;
            }
        }
    }

    // fonction pour se déconnecter de la base de données
    async disconnect() {
        // firestore n'a pas besoin de fermeture explicite
        console.log("✅​ Connexion Firestore fermée !");
    }

    // fonction pour créer et remplir les collections
    async createAndFillCollections() {
        console.log("\n📦​ Création et remplissage des collections Firestore...");
        try {
            // suppression des collections existantes
            await this.deleteAllCollections();

            // remplissage de la collection logements_chauffages
            console.log("📦​ Remplissage de la collection 'logements_chauffages'...");
            for (const chauffage of logementsChauffages) {
                await this.getCollection('logements_chauffages').doc(chauffage.id.toString()).set({
                    nom: chauffage.nom
                });
            }

            // remplissage de la collection transports_categories
            console.log("📦​ Remplissage de la collection 'transports_categories'...");
            for (const transport of transportsCategories) {
                await this.getCollection('transports_categories').doc(transport.id.toString()).set({
                    nom: transport.nom,
                    duree_vie_km: transport.duree_vie_km,
                    co2_construction_factor: transport.co2_construction_factor
                });
            }

            // remplissage de la collection moyennes_fr
            console.log("📦​ Remplissage de la collection 'moyennes_fr'...");
            for (const moyenne of moyennesFr) {
                await this.getCollection('moyennes_fr').doc(moyenne.id.toString()).set({
                    categorie: moyenne.categorie,
                    type_action: moyenne.type_action,
                    moyenne_value: moyenne.moyenne_value,
                    moyenne_unit: moyenne.moyenne_unit
                });
            }

            // remplissage de la collection suggestions
            console.log("📦​ Remplissage de la collection 'suggestions'...");
            for (const suggestion of suggestions) {
                await this.getCollection('suggestions').doc(suggestion.id.toString()).set({
                    categorie: suggestion.categorie,
                    contexte: suggestion.contexte,
                    suggestion: suggestion.suggestion,
                    explication: suggestion.explication,
                    sources: suggestion.sources
                });
            }

            console.log("✅​ Collections Firestore créées et remplies avec succès !");
        } catch (error) {
            console.log("❌​ Erreur lors de la création et du remplissage des collections : ", error.message);
            throw error;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // COLLECTIONS
    /////////////////////////////////////////////////////////////////////////////////////

    // fonction pour récupérer une collection
    getCollection(collectionName) {
        if (!this.db) {
            throw new Error("Base de données non connectée");
        }
        return this.db.collection(collectionName);
    }

    // fonction pour supprimer toutes les collections
    async deleteAllCollections() {
        console.log("🗑️​  Suppression des collections...");
        try {
            const collections = ['logements_chauffages', 'transports_categories', 'moyennes_fr', 'suggestions', 'users_activities'];
            for (const collectionName of collections) {
                try {
                    const collection = this.getCollection(collectionName);
                    const snapshot = await collection.get();

                    // suppression de tous les documents de la collection (seulement s'il y en a)
                    if (!snapshot.empty) {
                        const batch = this.db.batch();
                        snapshot.docs.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        await batch.commit();
                    }
                } catch (error) {
                    // ignore l'erreur si la collection n'existe pas
                    if (error.code !== 5) { // 5 = NOT_FOUND
                        throw error;
                    }
                }
            }
            console.log("✅​ Collections supprimées avec succès !");
        } catch (error) {
            console.log("❌​ Erreur lors de la suppression des collections : ", error.message);
            throw error;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // SERVICES
    /////////////////////////////////////////////////////////////////////////////////////

    // Services pour les logements chauffages
    // GET - Récupération de tous les chauffages
    async getAllChauffages() {
        try {
            const snapshot = await this.getCollection('logements_chauffages').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des chauffages :", error.message);
            throw error;
        }
    }

    // Services pour les moyennes fr
    // GET - Récupération de toutes les moyennes fr
    async getAllMoyennesFr() {
        try {
            const snapshot = await this.getCollection('moyennes_fr').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des moyennes fr :", error.message);
            throw error;
        }
    }

    // Services pour les notifications
    // GET - Récupération des activités des utilisateurs
    async getUsersActivities() {
        try {
            const snapshot = await this.getCollection('users_activities').get();
            return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des activités des utilisateurs :", error.message);
            throw error;
        }
    }
    // GET - Récupération de l'activité d'un utilisateur
    async getUserActivity(userExpoToken) {
        try {
            const docRef = this.getCollection('users_activities').doc(userExpoToken);
            const doc = await docRef.get();
            return doc.exists ? { _id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération de l'activité d'un utilisateur :", error.message);
            throw error;
        }
    }
    // POST - Création de l'activité d'un utilisateur
    async createUserActivity(userExpoToken, lastActivityDate) {
        try {
            const docRef = this.getCollection('users_activities').doc(userExpoToken);
            return await docRef.set({ last_activity_date: lastActivityDate });
        } catch (error) {
            console.log("❌​ Erreur lors de la création de l'activité d'un utilisateur :", error.message);
            throw error;
        }
    }
    // PUT - Mise à jour de l'activité d'un utilisateur
    async updateUserActivity(userExpoToken, lastActivityDate) {
        try {
            const docRef = this.getCollection('users_activities').doc(userExpoToken);
            return await docRef.update({ last_activity_date: lastActivityDate });
        } catch (error) {
            console.log("❌​ Erreur lors de la mise à jour de l'activité d'un utilisateur :", error.message);
            throw error;
        }
    }
    // DELETE - Suppression d'un utilisateur
    async deleteUser(userExpoToken) {
        try {
            const docRef = this.getCollection('users_activities').doc(userExpoToken);
            return await docRef.delete();
        } catch (error) {
            console.log("❌​ Erreur lors de la suppression d'un utilisateur :", error.message);
            throw error;
        }
    }

    // Services pour les suggestions
    // GET - Récupération de toutes les suggestions
    async getAllSuggestions() {
        try {
            const snapshot = await this.getCollection('suggestions').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des suggestions :", error.message);
            throw error;
        }
    }

    // Services pour les catégories de transports
    // GET - Récupération de toutes les catégories de transports
    async getAllCategoriesTransports() {
        try {
            const snapshot = await this.getCollection('transports_categories').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des catégories de transports :", error.message);
            throw error;
        }
    }
    // GET - Récupération d'une catégorie de transport par son id
    async getTransportCategorieById(id) {
        try {
            const docRef = this.getCollection('transports_categories').doc(id.toString());
            const doc = await docRef.get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération de la catégorie de transport :", error.message);
            throw error;
        }
    }
}

export default Firestore;
