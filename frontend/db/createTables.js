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

////////////////////////////////////////////////////////////////////////////////////
// CRÉATION DES TABLES
////////////////////////////////////////////////////////////////////////////////////

// CREATE - Création des tables
export const createTables = async (db) => {
    console.log("📦​ Création des tables...");
    try {
        await db.execAsync(
            `DROP TABLE IF EXISTS utilisateur;
            CREATE TABLE utilisateur (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                is_tuto_done BOOLEAN NOT NULL DEFAULT FALSE,
                objectif_co2_mensuel_aliment_creation INTEGER,
                objectif_co2_mensuel_aliment_usage INTEGER,
                objectif_co2_mensuel_transport_usage INTEGER,
                objectif_co2_mensuel_logement_usage INTEGER,
                serie_connexion INTEGER NOT NULL DEFAULT 0
            );

            DROP TABLE IF EXISTS utilisateur_logs;
            CREATE TABLE utilisateur_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date_log TEXT NOT NULL
            );

            DROP TABLE IF EXISTS logements;
            CREATE TABLE logements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                chauffage_id INTEGER NOT NULL,
                superficie_m2 INTEGER NOT NULL,
                temp_chauffage INTEGER DEFAULT 20,
                is_favori BOOLEAN NOT NULL DEFAULT FALSE
            );

            DROP TABLE IF EXISTS chauffages;
            CREATE TABLE chauffages (
                id INTEGER PRIMARY KEY NOT NULL,
                nom TEXT NOT NULL
            );

            DROP TABLE IF EXISTS transports;
            CREATE TABLE transports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                categorie_id INTEGER NOT NULL,
                conso_km REAL DEFAULT 0,
                is_favori BOOLEAN NOT NULL DEFAULT FALSE
            );

            DROP TABLE IF EXISTS transports_categories;
            CREATE TABLE transports_categories (
                id INTEGER PRIMARY KEY NOT NULL,
                nom TEXT NOT NULL
            );

            DROP TABLE IF EXISTS aliments;
            CREATE TABLE aliments (
                code TEXT NOT NULL PRIMARY KEY,
                nom TEXT,
                marques TEXT,
                tags TEXT,
                is_favori BOOLEAN NOT NULL DEFAULT FALSE
            );

            DROP TABLE IF EXISTS actions;
            CREATE TABLE actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                type_action TEXT CHECK(type_action IN ('creation', 'usage')) NOT NULL,
                categorie TEXT CHECK(categorie IN ('logement', 'transport', 'aliment')) NOT NULL,
                logement_id INTEGER,
                transport_id INTEGER,
                aliment_code TEXT,
                FOREIGN KEY (logement_id) REFERENCES logements(id) ON DELETE CASCADE,
                FOREIGN KEY (transport_id) REFERENCES transports(id) ON DELETE CASCADE,
                FOREIGN KEY (aliment_code) REFERENCES aliments(code) ON DELETE CASCADE
            );

            DROP TABLE IF EXISTS actions_usuelles;
            CREATE TABLE actions_usuelles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_id INTEGER NOT NULL,
                num_icone INTEGER NOT NULL,
                nom TEXT NOT NULL,
                params JSON,
                FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE
            );

            DROP TABLE IF EXISTS actions_passives;
            CREATE TABLE actions_passives (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_id INTEGER NOT NULL,
                params JSON,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                repeat_every INTEGER NOT NULL DEFAULT 1,
                repeat_unit TEXT CHECK(repeat_unit IN ('jours', 'semaines', 'mois', 'années')) NOT NULL DEFAULT 'jours',
                date_debut DATE NOT NULL,
                date_fin DATE,
                FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE
            );

            DROP TABLE IF EXISTS actions_iterations;
            CREATE TABLE actions_iterations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_id INTEGER NOT NULL,
                action_passive_id INTEGER,
                params JSON NOT NULL,
                co2 REAL,
                date DATE NOT NULL,
                FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
                FOREIGN KEY (action_passive_id) REFERENCES actions_passives(id) ON DELETE SET NULL
            );

            DROP TABLE IF EXISTS utilisateur_absences;
            CREATE TABLE utilisateur_absences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date_debut DATE NOT NULL,
                date_fin DATE,
                action_passive_id INTEGER NOT NULL,
                FOREIGN KEY (action_passive_id) REFERENCES actions_passives(id) ON DELETE CASCADE
            );

            DROP TABLE IF EXISTS moyennes_fr;
            CREATE TABLE moyennes_fr (
                id INTEGER PRIMARY KEY NOT NULL,
                categorie TEXT CHECK (categorie IN ('aliment', 'logement', 'transport')) NOT NULL,
                type_action TEXT CHECK (type_action IN ('creation', 'usage')) NOT NULL,
                moyenne_value REAL NOT NULL,
                moyenne_unit TEXT CHECK (moyenne_unit IN ('kgCO2e/j', 'gCO2e/j')) NOT NULL
            );
            
            DROP TABLE IF EXISTS suggestions;
            CREATE TABLE suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categorie TEXT CHECK (categorie IN ('aliment', 'logement', 'transport')) NOT NULL,
                contexte TEXT NOT NULL,
                suggestion TEXT NOT NULL,
                explication TEXT NOT NULL,
                sources TEXT NOT NULL
            );`
        );

        // activation des clés étrangères
        await db.execAsync('PRAGMA foreign_keys = ON');

        console.log("✅ Création des tables réussie !");

    } catch (error) {
        console.log("❌ Erreur lors de la création des tables :", error.message);
        throw error;
    }
};