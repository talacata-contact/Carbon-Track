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

// Table 'logements_chauffages'
export const logementsChauffages =
    // sources : API Impact CO2 - ADEME
    [
        { id: 1, nom: 'Chauffage au gaz' },
        { id: 2, nom: 'Chauffage au fioul' },
        { id: 3, nom: 'Chauffage électrique' },
        { id: 4, nom: 'Chauffage avec une pompe à chaleur' },
        { id: 5, nom: 'Chauffage avec un poêle à granulés' },
        { id: 6, nom: 'Chauffage avec un poêle à bois' },
        { id: 7, nom: 'Chauffage via un réseau de chaleur' }
    ];

// Table 'transports_categories'
export const transportsCategories =
    // sources : API Impact CO2 - ADEME, Base Carbone ADEME, guides ACV transports
    [
        { id: 1, nom: 'Avion', duree_vie_km: 60_000_000, co2_construction_factor: 0.0002599999999999709 },
        { id: 2, nom: 'TGV', duree_vie_km: 18_000_000, co2_construction_factor: 0.00063 },
        { id: 3, nom: 'Intercités', duree_vie_km: 6_000_000, co2_construction_factor: 0.00318 },
        { id: 4, nom: 'Voiture thermique', duree_vie_km: 150_000, co2_construction_factor: 0.02560000000000003 },
        { id: 5, nom: 'Voiture électrique', duree_vie_km: 150_000, co2_construction_factor: 0.08359999999999998 },
        { id: 6, nom: 'Autocar thermique', duree_vie_km: 800_000, co2_construction_factor: 0.004421306270000001 },
        { id: 7, nom: 'Vélo', duree_vie_km: 20_000, co2_construction_factor: 0.00017 },
        { id: 8, nom: 'Vélo à assistance électrique', duree_vie_km: 20_000, co2_construction_factor: 0.008720000000000002 },
        { id: 9, nom: 'Bus thermique', duree_vie_km: 1_000_000, co2_construction_factor: 0.008900000000000014 },
        { id: 10, nom: 'Tramway', duree_vie_km: 3_000_000, co2_construction_factor: 0.00048 },
        { id: 11, nom: 'Métro', duree_vie_km: 3_000_000, co2_construction_factor: 0.00023999999999999908 },
        { id: 12, nom: 'Scooter ou moto légère thermique', duree_vie_km: 50_000, co2_construction_factor: 0.0159 },
        { id: 13, nom: 'Moto thermique', duree_vie_km: 80_000, co2_construction_factor: 0.0265 },
        { id: 14, nom: 'RER ou Transilien', duree_vie_km: 6_000_000, co2_construction_factor: 0.00318 },
        { id: 15, nom: 'TER', duree_vie_km: 6_000_000, co2_construction_factor: 0.00479 },
        { id: 16, nom: 'Bus électrique', duree_vie_km: 1_000_000, co2_construction_factor: 0.0122 },
        { id: 17, nom: 'Trottinette à assistance électrique', duree_vie_km: 10_000, co2_construction_factor: 0.0229 },
        { id: 21, nom: 'Bus (GNV)', duree_vie_km: 1_000_000, co2_construction_factor: 0.0089 },
        { id: 22, nom: 'Covoiturage thermique (1 passager)', duree_vie_km: 150_000, co2_construction_factor: 0.012800000000000014 },
        { id: 23, nom: 'Covoiturage thermique (2 passagers)', duree_vie_km: 150_000, co2_construction_factor: 0.008533333333333342 },
        { id: 24, nom: 'Covoiturage thermique (3 passagers)', duree_vie_km: 150_000, co2_construction_factor: 0.006400000000000007 },
        { id: 25, nom: 'Covoiturage thermique (4 passagers)', duree_vie_km: 150_000, co2_construction_factor: 0.005120000000000007 },
        { id: 26, nom: 'Covoiturage électrique (1 passager)', duree_vie_km: 150_000, co2_construction_factor: 0.04179999999999999 },
        { id: 27, nom: 'Covoiturage électrique (2 passagers)', duree_vie_km: 150_000, co2_construction_factor: 0.027866666666666665 },
        { id: 28, nom: 'Covoiturage électrique (3 passagers)', duree_vie_km: 150_000, co2_construction_factor: 0.020899999999999995 },
        { id: 29, nom: 'Covoiturage électrique (4 passagers)', duree_vie_km: 150_000, co2_construction_factor: 0.016719999999999995 },
        { id: 30, nom: 'Marche', duree_vie_km: 0, co2_construction_factor: 0 }
    ];

// Table 'moyennes_fr'
export const moyennesFr =
    // sources : Ministère de la Transition Écologique - SDES, ADEME
    [
        { id: 1, categorie: 'logement', type_action: 'usage', moyenne_value: 2.4, moyenne_unit: 'kgCO2e/j' },
        { id: 2, categorie: 'transport', type_action: 'usage', moyenne_value: 4.9, moyenne_unit: 'kgCO2e/j' },
        { id: 3, categorie: 'aliment', type_action: 'creation', moyenne_value: 5.4, moyenne_unit: 'kgCO2e/j' },
        { id: 4, categorie: 'aliment', type_action: 'usage', moyenne_value: 340, moyenne_unit: 'gCO2e/j' }
    ];

// Table 'suggestions'
export const suggestions =
    // sources : WWF, ADEME, EcoConso, CentDegres, ...
    [
        {
            id: 1,
            categorie: 'aliment',
            contexte: { tags: ["fr:boeuf", "fr:steak", "fr:viande-rouge", "en:beef", "en:red-meat", "en:meat", "en:meat-other-than-poultry"] },
            suggestion: "Remplacez la viande rouge par du poulet pour réduire vos émissions de près de 60 %!",
            explication: "La production de bœuf est très émettrice en gaz à effet de serre (~28 kg CO₂e/kg), car elle implique beaucoup de méthane (fermentation digestive des vaches) et de surfaces agricoles. Le poulet en émet 6 fois moins, et reste une source riche en protéines.",
            sources: ["https://www.fao.org/newsroom/detail/new-fao-report-maps-pathways-towards-lower-livestock-emissions/fr#:~:text=Parmi%20les%20donn%C3%A9es%20les%20plus,%C3%A0%20l'%C3%A9levage%20avicole%2C%208", "https://agirpourlatransition.ademe.fr/particuliers/maison/cuisine/empreinte-carbone-assiette", "https://www.wwf.fr/agir-au-quotidien/alternatives-a-la-viande-comment-composer-une-assiette-durable-et-equilibree#:~:text=Deux%20%C5%93ufs%20apportent%2027%20grammes,en%20min%C3%A9raux%20et%20en%20vitamines"]
        },
        {
            id: 2,
            categorie: 'aliment',
            contexte: { tags: ["fr:viande", "en:meat", "en:daily-meat", "fr:charcuterie", "en:meat-other-than-poultry"] },
            suggestion: "Testez une recette végétarienne avec des lentilles ou pois chiches : protéinée et 10 fois moins polluante que le steak !",
            explication: " Les légumineuses comme les lentilles ou les pois chiches ont une très faible empreinte carbone (0,9–1,1 kg CO₂e/kg), tout en étant riches en protéines, fibres et micronutriments.",
            sources: ["https://economie-circulaire.ademe.fr/alimentation-durable", "https://agirpourlatransition.ademe.fr/particuliers/maison/cuisine/empreinte-carbone-assiette", "https://librairie.ademe.fr/agriculture-alimentation-foret-bioeconomie/4396-empreintes-sol-energie-et-carbone-de-l-alimentation.html#product-presentation", "https://www.wwf.fr/agir-au-quotidien/alternatives-a-la-viande-comment-composer-une-assiette-durable-et-equilibree#:~:text=Deux%20%C5%93ufs%20apportent%2027%20grammes,en%20min%C3%A9raux%20et%20en%20vitamines"]
        },
        {
            id: 3,
            categorie: 'aliment',
            contexte: { tags: ["fr:poulet", "fr:oeuf", "en:chicken", "en:eggs", "en:poultry"] },
            suggestion: "Optez pour des œufs bio ou poulet fermier : moins d'antibiotiques et plus de respect du bien-être animal.",
            explication: "Les produits labellisés bio ou Label Rouge garantissent une alimentation naturelle des animaux, moins d'antibiotiques, et des conditions d'élevage plus respectueuses.",
            sources: ["https://www.wwf.fr/agir-au-quotidien/alimentation", "https://economie-circulaire.ademe.fr/alimentation-durable", "https://www.wwf.fr/agir-au-quotidien/alternatives-a-la-viande-comment-composer-une-assiette-durable-et-equilibree#:~:text=Deux%20%C5%93ufs%20apportent%2027%20grammes,en%20min%C3%A9raux%20et%20en%20vitamines", "https://www.wwf.fr/vous-informer/effet-panda/la-transition-agricole-et-alimentaire-a-commence"]
        },
        {
            id: 4,
            categorie: 'aliment',
            contexte: { tags: ["fr:poisson", "fr:saumon", "fr:cabillaud", "fr:crevette", "en:fish", "en:shrimp", "en:cod", "en:salmon", "en:fatty-fish", "en:fish-and-seafood"] },
            suggestion: "Consommez au maximum deux portions de poisson par semaine, et variez les espèces pour préserver les océans.",
            explication: "93 % des stocks halieutiques sont exploités à leur maximum ou surexploités. Privilégier la variété (ex. : maquereau, sardine) et les labels (MSC, ASC, AB) permet de soulager les espèces en danger.",
            sources: ["https://www.wwf.fr/projets/consoguide-poisson-ou-comment-consommer-du-poisson-differemment"]
        },
        {
            id: 5,
            categorie: 'aliment',
            contexte: { tags: ["fr:plats-transformes", "fr:plats-prepares", "fr:nuggets", "fr:raviolis", "fr:quiches", "en:processed-food", "en:ready-meal", "en:one-dish-meals"] },
            suggestion: "Essayez de cuisiner 2 fois par semaine pour réduire les additifs, les emballages et le CO₂ caché.",
            explication: "Les plats industriels contiennent souvent des ingrédients ultra-transformés, riches en sel et graisses cachées, et génèrent davantage d’émissions (chaînes de production longues, emballages, transport)..",
            sources: ["https://centdegres.ca/ressources/les-aliments-ultra-transformes-sont-aussi-nuisible-pour-l-environnement", "https://www.inserm.fr/c-est-quoi/pas-si-super-cest-quoi-un-aliment-ultra-transforme/", "https://www.ecoconso.be/fr/content/le-wwf-prouve-quon-peut-manger-plus-durable-et-moins-cher"]
        },
        {
            id: 6,
            categorie: 'aliment',
            contexte: { tags: ["fr:lait", "fr:lait-industriel", "fr:produits-laitiers-industriels", "en:milk", "en:industrial-milk", "en:dairy-products", "en:milk-and-yogurt", "en:milk-and-dairy-products"] },
            suggestion: "Privilégiez le lait bio ou lait de petites fermes pour diminuer votre empreinte carbone jusqu’à 10 %!",
            explication: "Le lait produit en agriculture biologique consomme moins d’engrais synthétiques et envoie 9 % de CO₂ en moins par litre que le lait conventionnel dès la première année de conversion ; sur l’ensemble de la chaine, l’impact est réduit d’environ 4 % à 17 %.",
            sources: ["https://link.springer.com/article/10.1007/s13593-022-00775-7", "https://www.fao.org/newsroom/detail/new-fao-report-maps-pathways-towards-lower-livestock-emissions/fr#:~:text=Parmi%20les%20donn%C3%A9es%20les%20plus,%C3%A0%20l'%C3%A9levage%20avicole%2C%208", "https://economie-circulaire.ademe.fr/alimentation-durable"]
        },
        {
            id: 7,
            categorie: 'aliment',
            contexte: { tags: ["fr:fromage-industriel", "fr:fromage", "en:hard-cheese", "en:cheese"] },
            suggestion: "Remplacez le fromage à pâte dure ou par du chèvre ou du brie : jusqu’à 30 % d’impact en moins !",
            explication: "Le lait de vache, en particulier sous forme de fromages à pâte dure, génère des émissions de méthane importantes ; les fromages de chèvre ou à pâte molle sont nettement moins émissifs.",
            sources: ["https://centdegres.ca/ressources/les-aliments-ultra-transformes-sont-aussi-nuisible-pour-l-environnement", "https://ourworldindata.org/environmental-impacts-of-food#explore-data-on-the-environmental-impacts-of-food", "https://cambridgecarbonfootprint.org/actions/eat_less_hard_cheese/"]
        },
        {
            id: 8,
            categorie: 'aliment',
            contexte: { tags: ["fr:boissons-sucrees", "en:soda", "en:soft-drink", "en:sugar-drinks", "en:sugar-soda", "en:sugar-soft-drink", "en:sweetened-beverages"] },
            suggestion: "Réduisez les boissons sucrées à maximum 10 % de votre apport calorique journalier pour éviter obésité et caries !",
            explication: "L’OMS recommande de limiter les sucres libres à moins de 10 % des apports caloriques (idéalement < 5 %) pour réduire les risques de surpoids et de caries dentaires..",
            sources: ["https://www.who.int/fr/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake-among-adults-and-children", "https://centdegres.ca/ressources/les-aliments-ultra-transformes-sont-aussi-nuisible-pour-l-environnement", "https://www.ecoconso.be/fr/content/le-wwf-prouve-quon-peut-manger-plus-durable-et-moins-cher"]
        },
        {
            id: 9,
            categorie: 'aliment',
            contexte: { tags: ["fr:fruits-exotiques", "fr:avocats", "fr:mangue", "en:tropical-fruit", "en:fruits"] },
            suggestion: "Favorisez les fruits locaux ou de saison : les exotiques peuvent multiplier l’empreinte carbone jusqu’à 4× !",
            explication: "Les produits hors saison importés par avion ou frets maritimes ont une empreinte carbone beaucoup plus élevée que les produits locaux, en particulier lorsqu’ils sont cultivés sous serres chauffées.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/conso/alimentation/manger-local-de-saison-pourquoi-c-est-essentiel"]
        },
        {
            id: 10,
            categorie: 'aliment',
            contexte: { tags: ["fr:cafe-instantane", "fr:chocolat-chaud-instantane", "en:instant-coffee", "en:instant-cocoa"] },
            suggestion: "Consommez économique : passez au café filtre ou préparez votre chocolat chaud maison, pour réduire votre impact !",
            explication: "Le café instantané, le cacao ou les boissons chocolatées contiennent souvent des ingrédients ultra-transformés avec un impact environnemental et sanitaire plus élevés. Les versions maison utilisent moins d’emballages et d’additifs.",
            sources: ["https://www.syndicatfrancaisducafe.com/wp-content/uploads/2022/04/SyndicatDuCafe_2020.pdf", "https://centdegres.ca/ressources/les-aliments-ultra-transformes-sont-aussi-nuisible-pour-l-environnement"]
        },
        {
            id: 11,
            categorie: 'aliment',
            contexte: { tags: ["fr:chocolat", "en:chocolate", "en:chocolate-products"] },
            suggestion: "Réduisez votre consommation de chocolat ou choisissez du chocolat équitable pour protéger les forêts !",
            explication: "La culture du cacao est l’un des moteurs de la déforestation en Afrique de l’Ouest, en particulier en Côte d’Ivoire et au Ghana, où sont produits 60 % du cacao mondial. Cette culture intensive, souvent menée sans pratiques durables, détruit les forêts tropicales, réduit la biodiversité et accentue le changement climatique.\n\nEn choisissant des chocolats certifiés équitables (Fairtrade, Rainforest Alliance…) ou bio, vous soutenez des pratiques agricoles plus respectueuses de l’environnement et des conditions de travail plus justes pour les petits producteurs.\n\nLimiter sa consommation de chocolat ultra-transformé (bonbons, barres…) permet également de réduire son empreinte carbone tout en améliorant la qualité nutritionnelle de ses achats.",
            sources: ["https://www.fao.org/family-farming/detail/fr/c/1707642/", "https://economie-circulaire.ademe.fr/alimentation-durable"]
        },
        {
            id: 12,
            categorie: 'logement',
            contexte: { critere: "supérieur", superficie_m2: 120, chauffage_id: 4 },
            suggestion: "Baissez votre thermostat de 2 °C en hiver : économisez jusqu’à 8 % d’énergie et de CO₂ chaque année !",
            explication: "Réduire la température de 20 °C à 18 °C permet d’économiser environ 7–10 % d’énergie dans un logement bien isolé équipé d’une pompe à chaleur.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/maison/chauffage/bons-gestes-chauffage-plus-economique"]
        },
        {
            id: 13,
            categorie: 'logement',
            contexte: { chauffage_id: 5 },
            suggestion: "Entretien annuel du poêle + bois labellisé : réduisez vos émissions de particules fines et CO2 de 20 à 30 %!",
            explication: "Un poêle non entretenu génère davantage de particules fines et de monoxyde de carbone. L’utilisation de granulés certifiés réduit les émissions polluantes.",
            sources: ["https://www.ademe.fr/presse/communique-national/les-poele-a-granules-de-bonnes-performances-en-conditions-reelles-et-des-pistes-pour-mieux-les-installer-et-les-utiliser/"]
        },
        {
            id: 14,
            categorie: 'logement',
            contexte: { chauffage_id: 6 },
            suggestion: "Passez à des bûches densifiées ou granulés : jusqu’à 30 % d’émissions de particules en moins !",
            explication: "Les combustibles densifiés brûlent plus proprement (moins de résidus polluants) que le bois ordinaire ou humide, réduisant les émissions fines.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/maison/chauffage/bien-chauffer-bois-moins-polluer"]
        },
        {
            id: 15,
            categorie: 'logement',
            contexte: { chauffage_id: 3 },
            suggestion: "Optez pour une pompe à chaleur ou améliorez l’isolation : réduisez vos émissions de CO2 jusqu’à 60 %!",
            explication: "Remplacer un chauffage électrique direct par une pompe à chaleur permet de diviser par deux environ la consommation d’énergie pour le même confort. Améliorer l’isolation augmente encore le gain.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/maison/chauffage/pompe-a-chaleur-maison", "https://www.ademe.fr/presse/communique-national/decarboner-le-chauffage-quelle-place-pour-les-pompes-a-chaleur-lademe-publie-un-avis-dexpert/"]
        },
        {
            id: 16,
            categorie: 'logement',
            contexte: { chauffage_id: 1 },
            suggestion: "Optez pour une pompe à chaleur ou améliorez l’isolation : réduisez vos émissions de CO2 jusqu’à 60 %!",
            explication: "Remplacer un chauffage électrique direct par une pompe à chaleur permet de diviser par deux environ la consommation d’énergie pour le même confort. Améliorer l’isolation augmente encore le gain.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/maison/chauffage/pompe-a-chaleur-maison", "https://www.ademe.fr/presse/communique-national/decarboner-le-chauffage-quelle-place-pour-les-pompes-a-chaleur-lademe-publie-un-avis-dexpert/"]
        },
        {
            id: 17,
            categorie: 'logement',
            contexte: { chauffage_id: 2 },
            suggestion: "Optez pour une pompe à chaleur ou améliorez l’isolation : réduisez vos émissions de CO2 jusqu’à 60 %!",
            explication: "Remplacer un chauffage électrique direct par une pompe à chaleur permet de diviser par deux environ la consommation d’énergie pour le même confort. Améliorer l’isolation augmente encore le gain.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/maison/chauffage/pompe-a-chaleur-maison", "https://www.ademe.fr/presse/communique-national/decarboner-le-chauffage-quelle-place-pour-les-pompes-a-chaleur-lademe-publie-un-avis-dexpert/"]
        },
        {
            id: 18,
            categorie: 'logement',
            contexte: { chauffage_id: 7 },
            suggestion: "Vérifiez le mix énergétique de votre réseau + réduisez chauffage intérieur de 1 °C : -5 % sur vos émissions.",
            explication: "Les réseaux de chaleur peuvent être très performants, mais leur efficacité dépend du mix d’énergie utilisé. Baisser d’1 °C réduit significativement l’énergie consommée.",
            sources: ["https://www.enrchoix.idf.ademe.fr/ressources/mutualiser-les-besoins/avis-ademe-reseauxchaleur-2017.pdf"]
        },
        {
            id: 19,
            categorie: 'logement',
            contexte: { critere: "supérieur", temp_chauffage: 21 },
            suggestion: "Réduisez votre thermostat à 19–20 °C : plus de confort, moins de facture, -8% d’émissions en moyenne !",
            explication: "Au-delà de 20 °C, chaque degré supplémentaire consomme jusqu’à 6–8 % de plus en énergie, sans augmenter le confort thermique.\nUne température intérieure supérieure à 21 °C peut indiquer une mauvaise isolation. Une maison mal isolée nécessite plus d’énergie pour maintenir une température stable, ce qui augmente la consommation et les émissions. Renforcer l’isolation des combles, des murs et des fenêtres permet de conserver la chaleur et de réduire significativement les besoins en chauffage.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/maison/chauffage/bons-gestes-chauffage-plus-economique", "https://agirpourlatransition.ademe.fr/particuliers/maison/renovation/comment-bien-isoler-maison"]
        },
        {
            id: 20,
            categorie: 'logement',
            contexte: { critere: "supérieur", temp_chauffage: 25 },
            suggestion: "Vérifiez votre isolation ! Une bonne isolation peut vous faire économiser jusqu’à 30 % d’énergie.",
            explication: "Une température intérieure supérieure à 25 °C en hiver est inhabituelle et peut indiquer une mauvaise isolation ou un chauffage mal régulé. Une maison mal isolée nécessite plus d’énergie pour maintenir une température stable, ce qui augmente la consommation et les émissions. Renforcer l’isolation des combles, des murs et des fenêtres permet de conserver la chaleur et de réduire significativement les besoins en chauffage.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/maison/chauffage/bons-gestes-chauffage-plus-economique", "https://agirpourlatransition.ademe.fr/particuliers/maison/renovation/comment-bien-isoler-maison"]
        },
        {
            id: 21,
            categorie: 'transport',
            contexte: { categorie_ids: [4] },
            suggestion: "Passez à une voiture compacte ou hybride pour réduire vos émissions de CO₂ jusqu’à 40 %!",
            explication: "Les SUV émettent en moyenne 25 % à 40 % de CO₂ de plus qu’une citadine. En France, ils ont été responsables d’une augmentation nette des émissions liées au transport individuel depuis 2010. Choisir un véhicule plus léger et plus sobre (compacte, hybride) permet de réduire fortement l’impact environnemental, sans changer complètement de mode de vie.",
            sources: ["https://www.iea.org/reports/global-ev-outlook-2023", "https://www.wwf.fr/sites/default/files/doc-2020-10/20201005_Etude_L-impact-ecrasant-des-SUV-sur-le-climat_WWF-France.pdf"]
        },
        {
            id: 22,
            categorie: 'transport',
            contexte: { categorie_ids: [4], critere: "inférieur", distance_km: 5 },
            suggestion: "Remplacez les trajets courts en voiture par du vélo ou de la marche : bon pour la planète et pour la santé !",
            explication: "Les trajets de moins de 5 km représentent 50 % des déplacements urbains, mais ce sont aussi les plus polluants lorsqu’ils sont effectués en voiture thermique. Le moteur consomme davantage à froid, et les polluants sont mal filtrés. Opter pour des mobilités douces (marche, vélo, trottinette) réduit jusqu’à 90 % les émissions de ces trajets.",
            sources: ["https://www.insee.fr/fr/statistiques/7622203", "https://infos.ademe.fr/magazine-octobre-2024/comment-nous-deplacons-nous/"]
        },
        {
            id: 23,
            categorie: 'transport',
            contexte: { categorie_ids: [4, 5], critere: "inférieur", distance_km: 15 },
            suggestion: "Passez aux transports en commun pour diviser vos émissions par 5 sur vos trajets quotidiens.",
            explication: "Un trajet moyen en bus ou métro émet entre 20 à 60 g de CO₂/km, contre 200 g pour une voiture thermique en solo. Les transports en commun sont donc jusqu’à 5 fois moins polluants. Ils permettent aussi de réduire le bruit, le stress lié à la conduite, et les coûts (carburant, stationnement, entretien).",
            sources: ["https://impactco2.fr/transport"]
        },
        {
            id: 24,
            categorie: 'transport',
            contexte: { categorie_ids: [1], critere: "inférieur", distance_km: 1000 },
            suggestion: "Remplacez les vols courts par le train : 80 fois moins d’émissions pour un trajet équivalent !",
            explication: "Un vol court-courrier (ex : Paris-Nice) émet environ 250 à 400 g de CO₂/km par passager, contre 3 à 5 g pour un TGV. Le train est donc jusqu’à 80 fois moins émetteur. De plus, les trajets porte-à-porte sont souvent aussi rapides, surtout si on tient compte des temps d’embarquement.\nVous pouvez effectuer la comparaison pour vos futurs trajets sur le site de l'ADEME :\nagirpourlatransition.ademe.fr",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/bureau/deplacements/calculer-emissions-carbone-trajets", "https://www.wwf.fr/vous-informer/actualites/le-vrai-poids-climatique-des-vols-courts", "https://librairie.ademe.fr/mobilite-et-transport/5078-empreinte-environnementale-des-transports-longue-distance.html"]
        },
        {
            id: 25,
            categorie: 'transport',
            contexte: { categorie_ids: [4, 5, 6, 9, 10, 11, 14, 16, 21], critere: "inférieur", distance_km: 15 },
            suggestion: "Essayez le vélo pour vos trajets locaux : 0 émission, 0 bruit, 100 % santé.",
            explication: "Le vélo est le moyen de transport le plus efficace écologiquement pour les trajets de moins de 5 km. Il est sans émission directe, très peu énergivore à produire et excellent pour la santé cardio-vasculaire. En ville, il est aussi souvent plus rapide que la voiture ou le bus.",
            sources: ["https://infos.ademe.fr/mobilite-transports/2024/tout-le-monde-a-velo/", "https://www.who.int/fr/news-room/fact-sheets/detail/physical-activity"]
        },
        {
            id: 26,
            categorie: 'transport',
            contexte: { categorie_ids: [6, 9, 10, 11, 14, 16, 21] },
            suggestion: "Continuez à faire du bien à la planète : métro, tram, et bus émettent 5 à 10 fois moins qu’une voiture.",
            explication: "Les transports en commun urbains ont une empreinte carbone très faible : 20 à 60 g de CO₂/km. Même une voiture électrique individuelle reste 2 à 3 fois plus émettrice à l'usage, sans compter la production. Rester sans voiture, c’est l’un des meilleurs choix écologiques et économiques sur le long terme.",
            sources: ["https://nosgestesclimat.fr/blog/mobilites/alternatives-voiture-individuelle"]
        },
        {
            id: 27,
            categorie: 'transport',
            contexte: { categorie_ids: [4], critere: "supérieur", conso_km: 8 },
            suggestion: "Un véhicule plus économe peut réduire vos émissions de moitié, et vos dépenses de carburant aussi.",
            explication: "La consommation excessive est souvent liée à une conduite agressive, un véhicule mal entretenu ou une technologie dépassée. Éco-conduite, pneus bien gonflés, allègement du véhicule, ou changement pour un modèle plus sobre peuvent réduire la consommation de 1 à 2 L/100 km, soit près d’une tonne de CO₂ par an.\nUn véhicule thermique ancien consomme souvent 8 à 10 L/100 km, soit plus de 250 g CO₂/km.\nUn modèle moderne consommant 5 L/100 km émettrait environ 130 g CO₂/km, soit deux fois moins.\nUne autre option est de passer à un véhicule hybride ou d’optimiser vos trajets avec du covoiturage.\nConsultez ces sites pour vous renseigner sur les véhicules neufs les moins polluants et les plus adaptés à vos usages ainsi que les aides auxquelles vous pouvez prétendre :\ncarlabelling.ademe.fr\njechangemavoiture.gouv.fr",
            sources: ["https://nosgestesclimat.fr/blog/mobilites/alternatives-voiture-individuelle", "https://www.notre-environnement.gouv.fr/themes/societe/le-mode-de-vie-des-menages-ressources/article/impacts-de-la-circulation-des-vehicules-particuliers#:~:text=En%20France%2C%20les%20v%C3%A9hicules%20particuliers,de%20CO2%20en%202019."]
        },
        {
            id: 28,
            categorie: 'transport',
            contexte: { categorie_ids: [4], critere: "inférieur", distance_km: 15 },
            suggestion: "Pensez au deux-roues : moins de CO₂, plus rapide, et plus facile à garer !",
            explication: "80 % des automobilistes roulent seuls, ce qui rend l’usage d’un deux-roues plus pertinent pour les trajets urbains. En plus de réduire les émissions de CO₂, un scooter ou une moto occupe 3 à 4 fois moins d’espace qu’une voiture.\nDes alternatives écologiques sont désormais disponibles : scooters et motos électriques, vélos à assistance électrique, etc. Pour maximiser les bénéfices environnementaux :\n- évitez les modèles surpuissants ou très gourmands;\n- vérifiez que le véhicule respecte la norme Euro5 (qui fixe les limites maximales de rejet de gaz polluants);\n- ne modifiez pas la ligne d’échappement, souvent déjà très sonore.",
            sources: ["https://agirpourlatransition.ademe.fr/particuliers/conso/conso-responsable/comment-choisir-voiture-deux-roues-moins-polluant"]
        },
    ];