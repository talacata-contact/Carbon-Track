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

////////////////////////////////////////////////////////////////////////////////////
// UTILISATEUR
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération de l'utilisateur
export const getUser = async () => {
    // console.log("👤​ Récupération de l'utilisateur...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de l'utilisateur
        const sql = 'SELECT * FROM utilisateur WHERE id = 1';
        const user = await db.getFirstAsync(sql);

        // vérification de la récupération
        // console.log("👉​ Utilisateur :", user);

        // console.log("✅​ Utilisateur récupéré avec succès !");
        return { status: true, message: "Utilisateur récupéré avec succès !", user: user };

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération de l'utilisateur :", error.message);
        return { status: false, message: error.message };
    }
};

// CREATE - Création de l'utilisateur
export const createUser = async (nom) => {
    console.log("👤​ Création de l'utilisateur...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // création de l'utilisateur
        const sql = 'INSERT INTO utilisateur (nom) VALUES (?)';
        await db.runAsync(sql, [nom]);

        // vérification de la création
        // const selectSql = 'SELECT * FROM utilisateur WHERE id = 1';
        // const user = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouveau utilisateur :", user);

        console.log("✅​ Utilisateur créé avec succès !");
        return { status: true, message: "Utilisateur créé avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la création de l'utilisateur :", error.message);
        return { status: false, message: error.message };
    }
};

// UPDATE - Modification de l'utilisateur
export const updateUser = async (updates) => {
    console.log("👤​ Modification de l'utilisateur...");
    try {
        if (Object.keys(updates).length === 0) {
            throw new Error("❌​ Aucune modification apportée à l'utilisateur");
        }

        // récupération de la base de données
        const db = await getdb();

        // modification de l'utilisateur
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = ?`).join(", ");

        // requête sql
        const sql = `UPDATE utilisateur SET ${setClause} WHERE id = 1`;
        await db.runAsync(sql, values);

        // vérification de la modification
        // const selectSql = 'SELECT * FROM utilisateur WHERE id = 1';
        // const user = await db.getFirstAsync(selectSql);
        // console.log("👉​ Utilisateur modifié :", user);

        console.log("✅​ Utilisateur modifié avec succès !");
        return { status: true, message: "Utilisateur modifié avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la modification de l'utilisateur :", error.message);
        return { status: false, message: error.message };
    }
};