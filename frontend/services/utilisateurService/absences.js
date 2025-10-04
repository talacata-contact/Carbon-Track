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
import { deletePassiveIterationsForPeriod } from '../evenementsService/actionsIterations';
import { getPassiveActionById, syncPassiveAction, updatePassiveAction } from '../evenementsService/actionsPassives';

////////////////////////////////////////////////////////////////////////////////////
// ABSENCES
////////////////////////////////////////////////////////////////////////////////////

// GET - Récupération des absences
export const getAllAbsences = async () => {
    console.log("⚡​ Récupération des absences...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération des absences
        const sql = 'SELECT * FROM utilisateur_absences';
        const absences = await db.getAllAsync(sql);

        // vérification des absences
        // console.log("👉​ Absences :", absences);

        console.log("✅​ Absences récupérées avec succès !");
        return absences;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération des absences :", error.message);
        throw error;
    }
}

// GET - Récupération d'une absence par son id
export const getAbsenceById = async (absence_id) => {
    console.log("⚡​ Récupération d'une absence par son id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de l'absence
        const sql = 'SELECT * FROM utilisateur_absences WHERE id = ?';
        const absence = await db.getFirstAsync(sql, [absence_id]);

        // vérification de la récupération
        // console.log("👉​ Absence :", absence);

        console.log("✅​ Absence récupérée avec succès !");
        return absence;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une absence par son id :", error.message);
        throw error;
    }
}

// GET - Récupération d'une absence par son action passive id
export const getAbsenceByActionPassiveId = async (action_passive_id) => {
    console.log("⚡​ Récupération d'une absence par son action passive id...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // récupération de l'absence
        const sql = 'SELECT * FROM utilisateur_absences WHERE action_passive_id = ?';
        const absence = await db.getFirstAsync(sql, [action_passive_id]);

        // vérification de la récupération
        // console.log("👉​ Absence :", absence);

        console.log("✅​ Absence récupérée avec succès !");
        return absence;

    } catch (error) {
        console.log("❌​ Erreur lors de la récupération d'une absence par son action passive id :", error.message);
        throw error;
    }
}

// CREATE - Création d'une absence
export const createAbsence = async (action_passive_id, date_debut, date_fin) => {
    console.log("⚡​ Création d'une absence...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // création de l'absence
        const sql = 'INSERT INTO utilisateur_absences (date_debut, date_fin, action_passive_id) VALUES (?, ?, ?)';
        await db.runAsync(sql, [date_debut, date_fin, action_passive_id]);

        // vérification de la création de l'absence
        const selectSql = 'SELECT * FROM utilisateur_absences ORDER BY id DESC LIMIT 1';
        const absence = await db.getFirstAsync(selectSql);
        // console.log("👉​ Nouvelle absence :", absence);

        console.log("✅​ Absence créée avec succès !");

        // synchronisation de l'absence
        await syncAbsence(absence, true);

        return { status: true, message: "Absence créée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la création de l'absence :", error.message);
        return { status: false, message: error.message };
    }
}

// DELETE - Suppression d'une absence
export const deleteAbsence = async (absence_id) => {
    console.log("⚡​ Suppression d'une absence...");
    try {
        // récupération de la base de données
        const db = await getdb();

        // vérification avant suppression
        const selectSql_before = 'SELECT * FROM utilisateur_absences WHERE id = ?';
        const absence_before = await db.getFirstAsync(selectSql_before, [absence_id]);
        // console.log("👉​ Absence à supprimer :", absence_before);

        // suppression de l'absence
        const sql = 'DELETE FROM utilisateur_absences WHERE id = ?';
        await db.runAsync(sql, [absence_id]);

        // vérification après suppression
        // const selectSql_after = 'SELECT * FROM utilisateur_absences WHERE id = ?';
        // const absence_after = await db.getFirstAsync(selectSql_after, [absence_id]);
        // console.log("👉​ Absence supprimée :", absence_after);

        // réactivation de l'action passive associée
        await updatePassiveAction(absence_before.action_passive_id, { is_active: true });

        // synchronisation de l'action passive associée
        const action_passive = await getPassiveActionById(absence_before.action_passive_id);
        await syncPassiveAction(action_passive, false);

        console.log("✅​ Absence supprimée avec succès !");
        return { status: true, message: "Absence supprimée avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la suppression de l'absence :", error.message);
        return { status: false, message: error.message };
    }
}

// SYNC - Synchronisation d'une absence
const syncAbsence = async (absence, absence_just_created) => {
    console.log("⚡​ Synchronisation d'une absence...");
    try {
        // récupération des dates
        const now = new Date().toISOString().split('T')[0];
        const date_debut = new Date(absence.date_debut).toISOString().split('T')[0];
        const date_fin = new Date(absence.date_fin).toISOString().split('T')[0];

        // si l'absence est en cours : on supprime les itérations présentes pendant l'absence et on désactive l'action passive associée (is_active = false)
        if (date_debut <= now && now <= date_fin) {
            // suppression des itérations présentes pendant l'absence
            await deletePassiveIterationsForPeriod(absence.action_passive_id, date_debut, date_fin);

            // désactivation de l'action passive associée
            await updatePassiveAction(absence.action_passive_id, { is_active: false });
        }

        // si l'absence est finie (et vient d'être créée) : on supprime les itérations présentes pendant l'absence et on supprime l'absence directement
        if (now > date_fin && absence_just_created) {
            // suppression des itérations présentes pendant l'absence
            await deletePassiveIterationsForPeriod(absence.action_passive_id, date_debut, date_fin);

            // suppression de l'absence
            const response = await deleteAbsence(absence.id);
            if (!response.status) {
                throw new Error(response.message);
            }
        }

        // si l'absence est finie (et ne vient pas d'être créée): on supprime les itérations présentes pendant l'absence, on réactive l'action passive associée (is_active = true) avec une nouvelle date de début (= date de fin de l'absence + 1 jour) et on supprime l'absence
        if (now > date_fin && !absence_just_created) {
            // suppression des itérations présentes pendant l'absence
            await deletePassiveIterationsForPeriod(absence.action_passive_id, date_debut, date_fin);

            // changement de la date de début pour reprendre l'action passive au bon moment après la fin de l'absence
            const new_start_date = new Date(date_fin);
            new_start_date.setDate(new_start_date.getDate() + 1); // = jour suivant la fin de l'absence
            await updatePassiveAction(absence.action_passive_id, { date_debut: new_start_date.toISOString().split('T')[0], is_active: true });

            // resynchronisation de l'action passive associée (avec true pour prendre en compte la nouvelle date de début)
            const action_passive = await getPassiveActionById(absence.action_passive_id);
            await syncPassiveAction(action_passive, true);

            // suppression de l'absence
            const response_delete = await deleteAbsence(absence.id);
            if (!response_delete.status) {
                throw new Error(response_delete.message);
            }
        }

        console.log("✅​ Absence synchronisée avec succès !");

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation de l'absence :", error.message);
        throw error;
    }
}

// SYNC - Synchronisation des absences
export const syncAbsences = async () => {
    console.log("⚡​ Synchronisation des absences...");
    try {
        // récupération des absences
        const absences = await getAllAbsences();

        // synchronisation des absences
        for (const absence of absences) {
            // console.log("👉​ Absence :", absence);
            await syncAbsence(absence, false);
        }

        console.log("✅​ Absences synchronisées avec succès !");
        return { status: true, message: "Absences synchronisées avec succès !" };

    } catch (error) {
        console.log("❌​ Erreur lors de la synchronisation des absences :", error.message);
        return { status: false, message: error.message };
    }
}