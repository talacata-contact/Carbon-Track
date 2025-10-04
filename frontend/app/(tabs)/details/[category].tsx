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

import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import IterationList from "@/components/Card/IterationList";
import EqCO2 from "@/components/Graph/EqCO2";
import ModifAliment from "@/components/Modif/ModifAliment";
import ModifLogement from "@/components/Modif/ModifLogement";
import ModifTransport from "@/components/Modif/ModifTransport";
import FavEtRepet from "@/components/NavBar/FavEtRepet";
import TutoOverlay from "@/components/Tuto/TutoOverlay";

import { tabColors } from '@/constants/Colors';
import { tutoSteps } from "@/constants/TutoSteps";

import { useTuto } from "@/contexts/TutoProvider";

import { printAllEventsByActionId } from "@/services/evenementsService/evenements";
import { getChauffageById } from "@/services/referencesService/logements";
import { getCategoryTransportById } from "@/services/referencesService/transports";

import { useFocusEffect } from '@react-navigation/native';

export default function DetailsScreen() {
  const { category, actionId } = useLocalSearchParams<{ category: string; actionId?: string }>();

  const [actionDetails, setActionDetails] = useState<any>(null);
  const [iterations, setIterations] = useState<any[]>([]);
  const [categoryLabel, setCategoryLabel] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modifTarget, setModifTarget] = useState<{ referenceId?: number; iterationId?: number } | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const tuto = useTuto();
  if (!tuto) return null;
  const { isTutoActive, currentStep, currentPage, nextStep, previousStep, skipTuto } = tuto;

  // Fetch des données
  const fetchData = useCallback(async () => {
    if (!actionId) return;
    setActionDetails(null);
    setIterations([]);
    setCategoryLabel("");

    try {
      const result = await printAllEventsByActionId(Number(actionId));
      if (!result.status) return;

      setActionDetails(result.action_details);
      setIterations(result.iterations);

      if (category === "transport") {
        const res = await getCategoryTransportById(result.action_details.params.categorie_id);
        if (res.status && res.category) setCategoryLabel(res.category.nom);
      }
      if (category === "logement") {
        const chauffageRes = await getChauffageById(result.action_details.params.chauffage_id);
        if (chauffageRes.status && chauffageRes.chauffage)
          setCategoryLabel(chauffageRes.chauffage.nom);
      }
    } catch (e) {
      console.warn("Erreur affichage action :", e);
    }
  }, [actionId, category]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData, refreshTrigger])
  );

  if (!actionDetails) {
    return (
      <View style={styles.center}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const openModif = (iterationId?: number, referenceId?: number) => {
    setModifTarget({ iterationId, referenceId });
    setModalVisible(true);
  };

  // Fermeture modal et trigger reload
  const handleModifClose = () => {
    setModalVisible(false);
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 100);
  };

  const renderParams = () => {
    switch (category) {
      case "transport":
        return (
          <View style={styles.paramsContainer}>
            <Text>Catégorie : {categoryLabel}</Text>
            <Text>Consommation au km : {actionDetails.params?.conso_km} L/100km</Text>
          </View>
        );
      case "logement":
        return (
          <View style={styles.paramsContainer}>
            <Text>Chauffage : {categoryLabel}</Text>
            <Text>Superficie : {actionDetails.params?.superficie_m2 || "N/A"} m²</Text>
            <Text>Température : {actionDetails.params?.temp_chauffage || "N/A"} °C</Text>
          </View>
        );
      case "aliment":
        return (
          <View style={styles.paramsContainer}>
            <Text>Aliment : {actionDetails.reference_nom || "N/A"}</Text>
            <Text>Marque(s) : {actionDetails.params?.marques || "N/A"}</Text>
            <Text>Tags : {actionDetails.params?.tags || "N/A"}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
        {/* Titre + bouton modifier */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.title}>{actionDetails.action_nom}</Text>
          {["logement", "transport"].includes(category) && actionDetails.reference_id && (
            <TouchableOpacity onPress={() => openModif(undefined, actionDetails.reference_id)}>
              <FontAwesome5 name="edit" size={24} color={tabColors[category]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Paramètres */}
        {renderParams()}

        {/* Date */}
        {category !== "aliment" && <Text style={styles.date}>Créé le : {actionDetails.date_creation}</Text>}

        {/* EqCO2 */}
        {actionDetails.co2_total > 0 && (
          <>
            <Text style={styles.totalText}>
              Consommation totale : {actionDetails.co2_total} {actionDetails.co2_total_unit}
            </Text>
            <Text style={styles.sectionTitle}>Équivalence :</Text>
            <EqCO2 value={actionDetails.co2_total} />
          </>
        )}

        {/* Itérations */}
        {(actionDetails.type_action !== "creation" || 
          (actionDetails.type_action === "creation" && category === "aliment")) && (
          <>
            <Text style={styles.sectionTitle}>Itérations</Text>
            <IterationList
              iterations={iterations}
              categorie={category}
              onPressIteration={(iter: any) => openModif(iter.id, actionDetails.reference_id)}
            />
          </>
        )}
      </ScrollView>

      {/* Boutons Favori + Répéter */}
      {(actionDetails.type_action !== "creation" || (actionDetails.type_action === "creation" && category === "aliment")) && (
        <FavEtRepet
          category={category as 'transport' | 'aliment' | 'logement'}
          referenceId={actionDetails.reference_id}
          actionId={Number(actionId)}
          showRepet={
            actionDetails.type_action !== 'creation' ||
            (actionDetails.type_action === 'creation' && category === 'aliment')
          }
          onFavPress={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modifTarget && (
              <>
                {category === "logement" && (
                  <ModifLogement
                    referenceId={modifTarget.referenceId}
                    iterationId={modifTarget.iterationId}
                    onClose={handleModifClose}
                  />
                )}
                {category === "transport" && (
                  <ModifTransport
                    referenceId={modifTarget.referenceId}
                    iterationId={modifTarget.iterationId}
                    onClose={handleModifClose}
                  />
                )}
                {category === "aliment" && modifTarget.iterationId && (
                  <ModifAliment
                    iterationId={modifTarget.iterationId}
                    onClose={handleModifClose}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Tutoriel */}
      {isTutoActive && (() => {
        let step;

        if (category === "aliment") {
          step = tutoSteps.categoryA[currentStep];
        } else if (category === "transport") {
          step = tutoSteps.categoryT[currentStep]
        } else if (category === "logement") {
          step = tutoSteps.categoryL[currentStep]
        }

        if (!step) return null;

        const message = step.message || "";
        const highlightPos = step.highlightPos || { x: 0, y: 0, width: 0, height: 0 };


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

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, marginLeft: 10, maxWidth: '90%' },
  date: { marginTop: 8, fontStyle: "italic", color: "#555", marginLeft: 10 },
  paramsContainer: { marginTop: 8, marginLeft: 10 },
  totalText: { fontWeight: "600", fontSize: 16, marginVertical: 8, textAlign: "right" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginVertical: 8, marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { borderRadius: 20, width: "90%", minHeight: "70%" },
});
