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

import * as SQLite from "expo-sqlite";

let db = null;
let openingPromise = null;
const DB_NAME = "carbon-track-db.db";

export const getdb = async () => {
    if (db) return db;
    if (openingPromise) return openingPromise;

    openingPromise = (async () => {
        try {
            db = await SQLite.openDatabaseAsync(DB_NAME);
            return db;
        } finally {
            openingPromise = null; // reset quand fini
        }
    })();

    return openingPromise;
};

export const resetdb = () => {
    db = null;
    openingPromise = null;
};