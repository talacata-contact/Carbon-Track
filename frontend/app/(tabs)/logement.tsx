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

import ActionList from "@/components/Card/ActionList";
import Suggestions from "@/components/Card/Suggestions";
import FilterPicker from "@/components/Graph/FilterPicker";
import Graphe from "@/components/Graph/Graphe";
import SimplePlusFab from "@/components/NavBar/SimplePlus";
import TutoOverlay from "@/components/Tuto/TutoOverlay";

import { tabColors } from "@/constants/Colors";
import { tutoSteps } from "@/constants/TutoSteps";

import { useTuto } from "@/contexts/TutoProvider";

import { getMoyennesFr } from "@/services/dataService/moyennesFr";
import {
    getMoyenneCo2OfPreviousEvents,
    printAllEventsByCategorie
} from "@/services/evenementsService/evenements";
import { getUser } from "@/services/utilisateurService/utilisateur";

import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function LogementScreen() {
    const [loading, setLoading] = useState(true);
    const [objectif, setObjectif] = useState(0);
    const [moyenneFrancaise, setMoyenneFrancaise] = useState(0);
    const [moyennePrecedente, setMoyennePrecedente] = useState(0);
    const [iterations, setIterations] = useState([]);
    const [iterationsList, setIterationsList] = useState([]);
    
    const [periode, setPeriode] = useState("Ce mois"); // volet 1
    const [filtre, setFiltre] = useState("Tout"); // volet 2

    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    
    const tuto = useTuto();
    if (!tuto) return null;
    const { isTutoActive, currentStep, currentPage, nextStep, previousStep, skipTuto } = tuto;

    const fetchData = async () => {
        setLoading(true);
        try {
            const userResult = await getUser();
            const objectifCO2 = userResult.user.objectif_co2_mensuel_logement_usage;
            setObjectif(objectifCO2);

            const moyennesFrResult = await getMoyennesFr();
            const moyenneFr = moyennesFrResult.moyennesFr[2].moyenne_value * 30;
            setMoyenneFrancaise(moyenneFr);

            const eventsResult = await printAllEventsByCategorie('logement', periode, "Tout");
            const events = eventsResult.status 
                ? eventsResult.events.filter(e => e.type_action === 'usage') 
                : [];
            setIterations(events);

            const mapFiltreForService = (filtre) => {
              switch(filtre){
                case "Sup. à l’objectif": return "sup";
                case "Inf. à l’objectif": return "inf";
                default: return "Tout";
              }
            };

            const eventsListResult = await printAllEventsByCategorie('logement', periode, mapFiltreForService(filtre), objectifCO2);
            const iterationsFiltered = eventsListResult.status ? eventsListResult.events : [];
            setIterationsList(iterationsFiltered);

            const allEventsResult = await printAllEventsByCategorie('logement', 'Cette année', "Tout");
            const moyenneCO2 = await getMoyenneCo2OfPreviousEvents(allEventsResult.events, periode);
            setMoyennePrecedente(moyenneCO2.moyenne_co2?.usage || 0);

        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [periode, filtre]);

    // rafraîchir les données quand l'utilisateur revient sur l'onglet
    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [periode, filtre])
    );

    if (loading) return <Text>Chargement des données...</Text>;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ padding: 16, marginHorizontal: 10 }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                    Mes émissions liées au Logement
                </Text>

                {objectif === 0 && (
                    <Text style={{ color: "red", marginBottom: 10 }}>
                        Veuillez remplir l'objectif dans les paramètres.
                    </Text>
                )}

                <FilterPicker
                    options={[
                        { label: "Cette semaine", value: "Cette semaine" },
                        { label: "Ce mois", value: "Ce mois" },
                    ]}
                    selectedValue={periode}
                    onValueChange={setPeriode}
                />

                {iterations.length > 0 ? (
                    <Graphe
                        iterations={iterations}
                        objectif={objectif}
                        moyenneFrancaise={moyenneFrancaise}
                        moyennePrecedente={moyennePrecedente}
                        categorie="logement"
                        onPressPoint={(iteration) => console.log("Point cliqué :", iteration)}
                    />
                ) : (
                    <Text>Aucune donnée enregistrée pour le moment.</Text>
                )}

                <Suggestions 
                    categorie="logement" 
                    events={iterationsList} 
                    onVisibleChange={setSuggestionsVisible}
                />

                {/* Historique + Volet 2 */}
                <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 20, justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", marginRight: 12 }}>
                        Historique
                    </Text>
                    <FilterPicker
                        options={[
                            { label: "Tout", value: "Tout" },
                            { label: "Sup. à l’objectif", value: "Sup. à l’objectif" },
                            { label: "Inf. à l’objectif", value: "Inf. à l’objectif" },
                        ]}
                        selectedValue={filtre}
                        onValueChange={setFiltre}
                    />
                </View>

                {iterationsList.length > 0 ? (
                    <ActionList iterations={iterationsList} objectif={[true, objectif]} />
                ) : (
                    <Text>Aucun événement filtré pour cette période et ce filtre.</Text>
                )}
            </ScrollView>

            <SimplePlusFab target="logement" backgroundColor={tabColors['logement'] || '#000'} onCreated={fetchData} />
            
            {isTutoActive && (() => {
                const step = tutoSteps.logement[currentStep];
                if (!step) return null;

                let message = "";
                let highlightPos = { x: 0, y: 0, width: 0, height: 0 };

                if (step.dynamic) {
                    if (currentStep === 2) {
                    // Graphe
                    ({ message, highlightPos } = step.dynamic(iterations));
                    } else if (currentStep === 4) {
                    // Historique
                    ({ message, highlightPos } = step.dynamic(iterations, undefined, suggestionsVisible));
                    } else if (currentStep === 5) {
                    // Filtre objectif
                    ({ message, highlightPos } = step.dynamic(iterations, undefined, suggestionsVisible));
                    } else if (currentStep === 6) {
                    // Suggestions
                    ({ message, highlightPos } = step.dynamic(undefined, undefined, suggestionsVisible));
                    }
                } else {
                    message = step.message || "";
                    highlightPos = step.highlightPos || { x: 0, y: 0, width: 0, height: 0 };
                }

                return (
                    <TutoOverlay
                    highlightPos={highlightPos}
                    message={message}
                    currentStep={currentStep}
                    onNext={nextStep}
                    onPrevious={previousStep}
                    onSkip={skipTuto}
                    />
                );
            })()}
        </View>
    );
}