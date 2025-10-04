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

import { initdb } from "@/db/initdb";
import { syncMoyennesFr } from "@/services/dataService/moyennesFr";
import { syncSuggestions } from "@/services/dataService/suggestions";
import { createIterationForActionUsuelle } from "@/services/evenementsService/actionsIterations";
import { createPassiveAction } from "@/services/evenementsService/actionsPassives";
import { createActionUsuelle } from "@/services/evenementsService/actionsUsuelles";
import { createEvent } from "@/services/evenementsService/evenements";
import { syncChauffages } from "@/services/referencesService/logements";
import { syncCategoriesTransports } from "@/services/referencesService/transports";
import { createAbsence } from "@/services/utilisateurService/absences";
import { createUser } from "@/services/utilisateurService/utilisateur";


// FONCTION UTILITAIRE - Peuplement de la bdd pour test
// initialisation de la base de données
// création d'un user
// synchronisation des db locale avec la backend (moyennes, categories transport, chauffages)
// création de logement, transport, aliment
// utilisation de logement, transport et aliment
// création d'action usuelle
// création d'action passive (utilisation de logement, transport)
// création d'absences

export const filldbForTest = async () => {
    try {
        let response;
        // initialisation de la base de données (! à appeler une seule fois)
        response = await initdb();
        if (!response.status) {
            throw new Error(response.message);
        }

        // création de l'utilisateur
        response = await createUser("Talacata");
        if (!response.status) {
            throw new Error(response.message);
        }

        // synchronisation des données du backend (! à appeler une seule fois)
        response = await syncMoyennesFr();
        if (!response.status) {
            throw new Error(response.message);
        }
        response = await syncSuggestions();
        if (!response.status) {
            throw new Error(response.message);
        }
        response = await syncCategoriesTransports();
        if (!response.status) {
            throw new Error(response.message);
        }
        response = await syncChauffages();
        if (!response.status) {
            throw new Error(response.message);
        }

        // création de transport
        // action id 1 (création de la voiture 1)
        // itération id 1
        // transport id 1
        response = await createEvent('creation', 'transport', null,
            { nom: 'Voiture 1', categorie_id: 4, conso_km: 10 },
            '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 2 (création de la voiture 2)
        // itération id 2
        // transport id 2
        response = await createEvent('creation', 'transport', null,
            { nom: 'Voiture 2', categorie_id: 5, conso_km: 0 },
            '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }

        // création de logement
        // action id 3 (création de l'appartement 1)
        // itération id 3
        // logement id 1
        response = await createEvent('creation', 'logement', null,
            { nom: 'Appartement 1', chauffage_id: 1, superficie_m2: 70, temp_chauffage: 20 },
            '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 4 (création de l'appartement 2)
        // itération id 4
        // logement id 2
        response = await createEvent('creation', 'logement', null,
            { nom: 'Appartement 2', chauffage_id: 1, superficie_m2: 70, temp_chauffage: 20 },
            '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }

        // utilisation de transports
        // action id 5 (utilisation de la voiture 1)
        // itération id 5
        // transport id 1
        response = await createEvent('usage', 'transport', 1, { distance_km: 10 }, '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 5 (utilisation de la voiture 1)
        // itération id 6
        // transport id 1
        response = await createEvent('usage', 'transport', 1, { distance_km: 20 }, '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 6 (utilisation de la voiture 2)
        // itération id 7
        // transport id 2
        response = await createEvent('usage', 'transport', 2, { distance_km: 10 }, '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 6 (utilisation de la voiture 2)
        // itération id 8
        // transport id 2
        response = await createEvent('usage', 'transport', 2, { distance_km: 20 }, '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 7 (utilisation d'un transport non enregistré)
        // itération id 9
        // transport id 3
        response = await createEvent('usage', 'transport', null, { categorie_id: 14, distance_km: 30 }, '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 7 (utilisation du même transport non enregistré)
        // itération id 10
        // transport id 3
        response = await createEvent('usage', 'transport', null, { categorie_id: 14, distance_km: 30 }, '2025-08-03');
        if (!response.status) {
            throw new Error(response.message);
        }

        // consommation d'aliment
        // action id 8 (création d'un aliment)
        // action id 9 (consommation d'un aliment)
        // itération id 11 (création d'un aliment)
        // itération id 12 (consommation d'un aliment)
        // aliment id 1
        response = await createEvent('usage', 'aliment', null,
            {
                code: '5449000237972',
                product_name: 'Danette Vanille, Danone',
                brands: 'Danone, Danone',
                food_groups_tags: ["en:beverages", "en:sweetened-beverages"],
                quantity_value: 1,
                quantity_unit: 'kg'
            },
            '2025-01-01');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 8 (création d'un aliment)
        // action id 9 (consommation d'un aliment)
        // itération id 13 (création d'un aliment)
        // itération id 14 (consommation d'un aliment)
        // aliment id 1
        response = await createEvent('usage', 'aliment', null,
            {
                code: '5449000237972',
                product_name: 'Danette Vanille, Danone',
                brands: 'Danone, Danone',
                food_groups_tags: ["en:beverages", "en:sweetened-beverages"],
                quantity_value: 1,
                quantity_unit: 'kg'
            },
            '2025-01-01');
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 10 (création d'un aliment)
        // action id 11 (consommation d'un aliment)
        // itération id 15 (création d'un aliment)
        // itération id 16 (consommation d'un aliment)
        // aliment id 2
        response = await createEvent('usage', 'aliment', null,
            {
                code: '3033491432736',
                product_name: 'Chocolat',
                brands: 'Milka, Milka',
                food_groups_tags: ["en:milk-and-yogurt"],
                quantity_value: 1,
                quantity_unit: 'kg'
            },
            '2025-01-01');
        if (!response.status) {
            throw new Error(response.message);
        }
        // création d'une action usuelle
        // action usuelle id 1
        // action id 5
        // référence id 1 (transport)
        response = await createActionUsuelle(5, 3, 'Aller au travail', { distance_km: 100 });
        if (!response.status) {
            throw new Error(response.message);
        }
        // utilisation d'une action usuelle
        // action id 5
        // itération id 17
        // référence id 1 (transport)
        response = await createIterationForActionUsuelle(1, '2025-01-01');
        if (!response.status) {
            throw new Error(response.message);
        }
        // création d'une action passive (utilisation d'un transport - 1)
        // action passive id 1
        // action id 5
        // itération id 18
        response = await createPassiveAction(5, { distance_km: 100 }, 2, 'jours', '2025-08-02');
        if (!response.status) {
            throw new Error(response.message);
        }

        // utilisation de logement
        // action id 12 (utilisation de l'appartement 1 - création d'une action passive)
        // action passive id 2
        // itération id 19
        // logement id 1
        response = await createEvent('usage', 'logement', 1, { date_debut: '2025-07-25', date_fin: '2025-09-10' }, null);
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 13 (utilisation de l'appartement 2 - création d'une action passive)
        // action passive id 3
        // itération id ?
        // logement id 2
        response = await createEvent('usage', 'logement', 2, { date_debut: '2025-07-25', date_fin: '2025-09-10' }, null);
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 14 (utilisation d'un logement non enregistré - création d'une action passive)
        // action passive id 4
        // itération id ?
        // logement id 3
        response = await createEvent('usage', 'logement', null, { chauffage_id: 3, superficie_m2: 70, temp_chauffage: 20, date_debut: '2025-07-25', date_fin: '2025-09-10' }, null);
        if (!response.status) {
            throw new Error(response.message);
        }
        // action id 15 (utilisation d'un logement non enregistré - création d'une action passive)
        // action passive id 5
        // itération id ?
        // logement id 4
        response = await createEvent('usage', 'logement', null, { chauffage_id: 1, superficie_m2: 70, temp_chauffage: 20, date_debut: '2025-07-25', date_fin: '2025-09-10' }, null);
        if (!response.status) {
            throw new Error(response.message);
        }

        // création d'absences
        // absence id 1
        // action passive id 2
        response = await createAbsence(2, '2025-08-01', '2025-08-23');
        if (!response.status) {
            throw new Error(response.message);
        }
        // absence id 2
        // action passive id 3
        response = await createAbsence(3, '2025-08-01', '2025-08-28');
        if (!response.status) {
            throw new Error(response.message);
        }

        console.log("✅​ Peuplement de la base de données réussi !");
        return { status: true, message: "Peuplement de la base de données réussi !" };
    }
    catch (error) {
        console.log("❌​ Erreur lors du peuplement de la base de données :", error.message);
        return { status: false, message: error.message };
    }
}