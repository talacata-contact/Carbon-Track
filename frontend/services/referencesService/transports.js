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

import api from '@/api/api';
import { getdb } from '@/db/connectdb';

////////////////////////////////////////////////////////////////////////////////////
// TRANSPORTS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des transports favoris
export const getTransportsFavoris = async () => {
    console.log("🚗​ Récupération des transports favoris...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des transports favoris
        const sql = 'SELECT * FROM transports WHERE is_favori=1';
        const transports_favoris = await db.getAllAsync(sql);

        // vérification de la récupération
        // console.log("👉​ Transports favoris :", transports_favoris);

        // console.log("✅​ Transports favoris récupérés avec succès !");
        return { status: true, message: "Transports favoris récupérés avec succès !", transports_favoris: transports_favoris };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des transports favoris :", error.message);
        return { status: false, message: error.message };
    }
};

// GET - Récupération d'un transport par son id
export const getTransportById = async (id) => {
    // console.log("🚗​ Récupération d'un transport par son id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération du transport
        const sql = 'SELECT * FROM transports WHERE id = ?';
        const transport = await db.getFirstAsync(sql, [id]);

        // vérification de la récupération
        // console.log("👉​ Transport :", transport);

        // console.log("✅​ Transport récupéré avec succès !");
        return { status: true, message: "Transport récupéré avec succès !", transport: transport };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération du transport :", error.message);
        return { status: false, message: error.message };
    }
};

// GET - Récupération d'un transport non favoris par la catégorie id
export const getTransportNonFavorisByCategorieId = async (categorie_id) => {
    console.log("⚡​ Récupération d'un transport non favoris par la catégorie id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération du transport
        const sql = 'SELECT * FROM transports WHERE categorie_id = ? AND is_favori = 0';
        const transport = await db.getFirstAsync(sql, [categorie_id]);

        // vérification de la récupération
        // console.log("👉​ Transport non favoris :", transport);

        console.log("✅​ Transport récupéré avec succès !");
        return transport;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'un transport non favoris par la catégorie id :", error.message);
        throw error;
    }
}

// CREATE - Création d'un transport
export const createTransport = async (nom = "", categorie_id, conso_km = 0, is_favori) => {
    console.log("🚗​ Création d'un transport...");
    try {
        // si le transport n'est pas favori, nom du transport = nom de la catégorie
        if (!is_favori) {
            const response = await getAllCategoriesTransports();
            if (response.status) {
                const categories = response.categories;
                const categorie = categories.find(c => c.id === categorie_id);
                nom = categorie.nom;
            } else {
                throw new Error(response.message);
            }
        }

        // récupération de la base de données
        const db = await getdb();

        // création du transport
        const sql = 'INSERT INTO transports (nom, categorie_id, conso_km, is_favori) VALUES (?, ?, ?, ?)';
        await db.runAsync(sql, [nom, categorie_id, conso_km, is_favori]);

        // vérification de la création
        const selectSql = 'SELECT * FROM transports ORDER BY id DESC LIMIT 1';
        const transport = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouveau transport :", transport);

        console.log("✅​ Transport créé avec succès !");
        return transport;

    } catch (error) {
        console.log("❌​ Erreur lors de la création du transport :", error.message);
        throw error;
    }
};

// UPDATE - Modification d'un transport
export const updateTransport = async (id, updates) => {
    console.log("🚗​ Modification d'un transport...");
    try {
        // vérification des modifications
        if (Object.keys(updates).length === 0) {
            throw new Error("❌​ Aucune modification apportée au transport");
        }

        // récupération de la base de données
        const db = await getdb();

        // modification du transport
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = ?`).join(", ");

        // requête sql
        const sql = `UPDATE transports SET ${setClause} WHERE id = ?`;
        await db.runAsync(sql, [...values, id]);

        // vérification de la modification
        // const selectSql = 'SELECT * FROM transports WHERE id = ?';
        // const transport = await db.getFirstAsync(selectSql, [id]);
        // console.log("👉​ Transport modifié :", transport);

        console.log("✅​ Transport modifié avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la modification du transport :", error.message);
        throw error;
    }
};

// DELETE - Suppression d'un transport
export const deleteTransport = async (id) => {
    console.log("🚗​ Suppression d'un transport...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        // const selectSql_before = 'SELECT * FROM transports WHERE id = ?';
        // const transport_before = await db.getFirstAsync(selectSql_before, [id]);
        // console.log("👉​ Transport à supprimer :", transport_before);

        // suppression du transport
        const sql = 'DELETE FROM transports WHERE id = ?';
        await db.runAsync(sql, [id]);

        // vérification après suppression
        // const selectSql_after = 'SELECT * FROM transports WHERE id = ?';
        // const transport_after = await db.getFirstAsync(selectSql_after, [id]);
        // console.log("👉​ Transport supprimé :", transport_after);

        console.log("✅​ Transport supprimé avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression d'un transport :", error.message);
        throw error;
    }
}

////////////////////////////////////////////////////////////////////////////////////
// CATEGORIES DE TRANSPORTS
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des catégories de transports
export const getAllCategoriesTransports = async () => {
    console.log("🚗​ Récupération des catégories de transports...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des catégories de transports
        const sql = 'SELECT * FROM transports_categories';
        const categories = await db.getAllAsync(sql);

        // vérification de la récupération
        // console.log("👉​ Catégories de transports :", categories);

        // console.log("✅​ Catégories de transports récupérées avec succès !");
        return { status: true, message: "Catégories de transports récupérées avec succès !", categories: categories };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des catégories de transports :", error.message);
        return { status: false, message: error.message };
    }
}

// GET - Récupération des catégories de transports depuis l'API
export const getAllCategoriesTransportsFromApi = async () => {
    console.log("🌐​​ Appel à l'API pour récupérer les catégories de transports...");
    try {
        // appel à l'API
        const response = await api.get('/transports/categories');

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour récupérer les catégories de transports réussi !");
        return response.data.categories;

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour récupérer les catégories de transports :", error.message);
        throw error;
    }
};

// GET - Récupération d'une catégorie de transport par son id
export const getCategoryTransportById = async (id) => {
    // console.log("🚗​ Récupération d'une catégorie de transport par son id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de la catégorie de transport
        const sql = 'SELECT * FROM transports_categories WHERE id = ?';
        const category = await db.getFirstAsync(sql, [id]);

        // vérification de la récupération
        // console.log("👉​ Catégorie de transport :", category);

        // console.log("✅​ Catégorie de transport récupérée avec succès !");
        return { status: true, message: "Catégorie de transport récupérée avec succès !", category: category };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une catégorie de transport par son id :", error.message);
        return { status: false, message: error.message };
    }
}

// SYNC - Synchronisation des catégories de transports
export const syncCategoriesTransports = async () => {
    console.log("🚗​​ Synchronisation des catégories de transports...");
    try {
        // récupération des catégories de transports
        const categories = await getAllCategoriesTransportsFromApi();

        // récupération de la base de données
        const db = await getdb();

        // insertion (ou mise à jour) des catégories de transports
        for (const category of categories) {
            const sqlInsert = 'INSERT OR REPLACE INTO transports_categories (id, nom) VALUES (?, ?)';
            await db.runAsync(sqlInsert, [category.id, category.nom]);
        }

        // suppression des catégories de transports non présentes dans l'API
        const placeholders = categories.map(() => '?').join(',');
        const sqlDelete = `DELETE FROM transports_categories WHERE id NOT IN (${placeholders})`;
        const ids = categories.map(c => c.id);
        await db.runAsync(sqlDelete, ids);

        // vérification de la synchronisation
        const sqlSelect = 'SELECT * FROM transports_categories';
        const categories_synced = await db.getAllAsync(sqlSelect);
        // console.log("👉​ Catégories de transports synchronisées :", categories_synced);

        console.log("✅​ Synchronisation des catégories de transports réussie !");
        return { status: true, message: "Synchronisation des catégories de transports réussie !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation des catégories de transports :", error.message);
        return { status: false, message: error.message };
    }
}

////////////////////////////////////////////////////////////////////////////////////
// POIDS CARBONE
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération du poids carbone de création d'un transport
export const getPoidsCarboneCreationTransport = async (transport_id) => {
    console.log("🚗​ Récupération du poids carbone de création d'un transport...");
    try {
        // récupération de la catégorie du transport
        const response_transport = await getTransportById(transport_id);
        let categorie_id;
        if (response_transport.status) {
            const transport = response_transport.transport;
            categorie_id = transport.categorie_id;
        } else {
            throw new Error(response_transport.message);
        }

        // appel à l'API
        console.log("🌐​ Appel à l'API pour récupérer le poids carbone de création d'un transport...");
        // console.log("👉​ Categorie_id :", categorie_id);
        const response = await api.get(`/transports/co2/creation?categorie_id=${categorie_id}`);

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour récupérer le poids carbone de création d'un transport réussi !");
        return response.data.co2_creation;

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour récupérer le poids carbone de création d'un transport :", error.message);
        throw error;
    }
};

// GET - Récupération du poids carbone d'usage d'un transport
export const getPoidsCarboneUsageTransport = async (transport_id, distance_km) => {
    console.log("🚗​ Récupération du poids carbone d'usage d'un transport...");
    try {
        // récupération de la catégorie du transport
        const response_transport = await getTransportById(transport_id);
        let categorie_id;
        if (response_transport.status) {
            const transport = response_transport.transport;
            categorie_id = transport.categorie_id;
        } else {
            throw new Error(response_transport.message);
        }

        // appel à l'API
        console.log("🌐​ Appel à l'API pour récupérer le poids carbone d'usage d'un transport...");
        // console.log("👉​ Categorie_id :", categorie_id);
        // console.log("👉​ Distance_km :", distance_km);
        const response = await api.get(`/transports/co2/usage?categorie_id=${categorie_id}&distance_km=${distance_km}`);

        // vérification de la réponse
        // console.log("👉​ Réponse de l'API :", response.data);

        console.log("✅​ Appel à l'API pour récupérer le poids carbone d'usage d'un transport réussi !");
        return response.data.co2_usage;

    } catch (error) {
        console.log("❌​ Erreur lors de l'appel à l'API pour récupérer le poids carbone d'usage d'un transport :", error.message);
        throw error;
    }
};