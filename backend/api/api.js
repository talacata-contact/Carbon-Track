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

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// API Impact CO2
const API_IMPACT_CO2_URL = "https://impactco2.fr/api/v1";
const API_IMPACT_CO2_KEY = process.env.API_IMPACT_CO2_KEY;

export const api_impact_co2 = axios.create({
    baseURL: API_IMPACT_CO2_URL,
    headers: {
        'Authorization': `Bearer ${API_IMPACT_CO2_KEY}`,
        'Accept': 'application/json'
    },
    timeout: 10000,
});

// API OpenFoodFacts
const API_OPEN_FOOD_FACTS_URL_V1 = "https://world.openfoodfacts.org/cgi/search.pl";
const API_OPEN_FOOD_FACTS_URL_V2 = "https://world.openfoodfacts.org/api/v2";

export const api_openFoodFacts_v1 = axios.create({
    baseURL: API_OPEN_FOOD_FACTS_URL_V1,
    headers: {
        'Accept': 'application/json'
    },
    timeout: 10000,
});

export const api_openFoodFacts_v2 = axios.create({
    baseURL: API_OPEN_FOOD_FACTS_URL_V2,
    headers: {
        'Accept': 'application/json'
    },
    timeout: 10000,
});