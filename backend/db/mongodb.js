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

import { MongoClient } from 'mongodb';
import { getdbConfig } from './config.js';
import { logementsChauffages, transportsCategories, moyennesFr, suggestions } from './tables.js';

class MongoDB {
    // constructeur
    constructor() {
        this.client = null;
        this.db = null;
        this.config = getdbConfig();
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // DB
    /////////////////////////////////////////////////////////////////////////////////////

    // fonction pour se connecter à la base de données
    async connect() {
        console.log(`\n📦​ Connexion à MongoDB (${this.config.database})...`);
        try {
            // création du client
            this.client = new MongoClient(this.config.connectionString);
            await this.client.connect();
            // connexion à la base de données
            this.db = this.client.db(this.config.database);
            console.log("✅​ Serveur connecté à MongoDB !");
        } catch (err) {
            console.log("❌​ Erreur lors de la connexion à MongoDB : ", err.message);
            throw err;
        }
    }

    // fonction pour se déconnecter de la base de données
    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log("✅​ Connexion MongoDB fermée !");
        }
    }

    // fonction pour créer et remplir les collections
    async createAndFillCollections() {
        console.log("\n📦​ Création et remplissage des collections MongoDB...");
        try {
            // suppression des collections existantes
            await this.deleteAllCollections();

            // remplissage de la collection logements_chauffages
            console.log("📦​ Remplissage de la collection 'logements_chauffages'...");
            const chauffagesWithId = logementsChauffages.map(item => ({ _id: item.id, ...item }));
            await this.getCollection('logements_chauffages').insertMany(chauffagesWithId);

            // remplissage de la collection transports_categories
            console.log("📦​ Remplissage de la collection 'transports_categories'...");
            const transportsWithId = transportsCategories.map(item => ({ _id: item.id, ...item }));
            await this.getCollection('transports_categories').insertMany(transportsWithId);

            // remplissage de la collection moyennes_fr
            console.log("📦​ Remplissage de la collection 'moyennes_fr'...");
            const moyennesWithId = moyennesFr.map(item => ({ _id: item.id, ...item }));
            await this.getCollection('moyennes_fr').insertMany(moyennesWithId);

            // remplissage de la collection suggestions
            console.log("📦​ Remplissage de la collection 'suggestions'...");
            const suggestionsWithId = suggestions.map(item => ({ _id: item.id, ...item }));
            await this.getCollection('suggestions').insertMany(suggestionsWithId);

            // création d'une collection vide pour users_activities
            console.log("📦​ Création de la collection 'users_activities'...");
            const usersCollection = this.getCollection('users_activities');
            await usersCollection.insertOne({ _temp: true });
            await usersCollection.deleteOne({ _temp: true });

            console.log("✅​ Collections MongoDB créées et remplies avec succès !");
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
                await this.db.dropCollection(collectionName).catch(() => {
                    // ignore l'erreur si la collection n'existe pas
                });
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
            const collection = this.getCollection('logements_chauffages');
            return await collection.find({}).toArray();
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des chauffages :", error.message);
            throw error;
        }
    }

    // Services pour les moyennes fr
    // GET - Récupération de toutes les moyennes fr
    async getAllMoyennesFr() {
        try {
            const collection = this.getCollection('moyennes_fr');
            return await collection.find({}).toArray();
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des moyennes fr :", error.message);
            throw error;
        }
    }

    // Services pour les notifications
    // GET - Récupération des activités des utilisateurs
    async getUsersActivities() {
        try {
            const collection = this.getCollection('users_activities');
            return await collection.find({}).toArray();
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des activités des utilisateurs :", error.message);
            throw error;
        }
    }
    // GET - Récupération de l'activité d'un utilisateur
    async getUserActivity(userExpoToken) {
        try {
            const collection = this.getCollection('users_activities');
            return await collection.findOne({ _id: userExpoToken });
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération de l'activité d'un utilisateur :", error.message);
            throw error;
        }
    }
    // POST - Création de l'activité d'un utilisateur
    async createUserActivity(userExpoToken, lastActivityDate) {
        try {
            const collection = this.getCollection('users_activities');
            return await collection.insertOne({
                _id: userExpoToken,
                last_activity_date: lastActivityDate
            });
        } catch (error) {
            console.log("❌​ Erreur lors de la création de l'activité d'un utilisateur :", error.message);
            throw error;
        }
    }
    // PUT - Mise à jour de l'activité d'un utilisateur
    async updateUserActivity(userExpoToken, lastActivityDate) {
        try {
            const collection = this.getCollection('users_activities');
            return await collection.updateOne({ _id: userExpoToken }, { $set: { last_activity_date: lastActivityDate } });
        } catch (error) {
            console.log("❌​ Erreur lors de la mise à jour de l'activité d'un utilisateur :", error.message);
            throw error;
        }
    }
    // DELETE - Suppression d'un utilisateur
    async deleteUser(userExpoToken) {
        try {
            const collection = this.getCollection('users_activities');
            return await collection.deleteOne({ _id: userExpoToken });
        } catch (error) {
            console.log("❌​ Erreur lors de la suppression d'un utilisateur :", error.message);
            throw error;
        }
    }

    // Services pour les suggestions
    // GET - Récupération de toutes les suggestions
    async getAllSuggestions() {
        try {
            const collection = this.getCollection('suggestions');
            return await collection.find({}).toArray();
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des suggestions :", error.message);
            throw error;
        }
    }

    // Services pour les catégories de transports
    // GET - Récupération de toutes les catégories de transports
    async getAllCategoriesTransports() {
        try {
            const collection = this.getCollection('transports_categories');
            return await collection.find({}).toArray();
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération des catégories de transports :", error.message);
            throw error;
        }
    }
    // GET - Récupération d'une catégorie de transport par son id
    async getTransportCategorieById(id) {
        try {
            const collection = this.getCollection('transports_categories');
            return await collection.findOne({ _id: parseInt(id) });
        } catch (error) {
            console.log("❌​ Erreur lors de la récupération de la catégorie de transport :", error.message);
            throw error;
        }
    }
}

export default MongoDB;
