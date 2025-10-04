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

import ActionList from '@/components/Card/ActionList';
import ActionPassiveList from '@/components/Card/ActionPassiveList';
import FilterPicker from '@/components/Graph/FilterPicker';
import GrapheG from '@/components/Graph/GrapheG';
import GeneralMenu from '@/components/NavBar/GeneralMenu';
import TutoOverlay from '@/components/Tuto/TutoOverlay';

import { tabColors } from '@/constants/Colors';
import { tutoSteps } from '@/constants/TutoSteps';
import { useTuto } from '@/contexts/TutoProvider';

import { printAllEvents, printAllPassiveEvents } from '@/services/evenementsService/evenements';
import { getAbsenceByActionPassiveId } from '@/services/utilisateurService/absences';
import { resetApp } from '@/services/utilisateurService/resetUtilisateur';

import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, Text, View } from 'react-native';

const periodeOptions = [
  { label: "Aujourd'hui", value: "Aujourd'hui" },
  { label: 'Cette semaine', value: 'Cette semaine' },
  { label: 'Ce mois', value: 'Ce mois' },
  { label: 'Ces 6 derniers mois', value: 'Ces 6 derniers mois' },
  { label: 'Cette année', value: 'Cette année' },
  { label: 'Depuis le début', value: 'Depuis le début' },
];

export default function GeneralScreen() {
  const tuto = useTuto();
  if (!tuto) return null;
  const { isTutoActive, currentStep, nextStep, previousStep, skipTuto } = tuto;

  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('Ce mois');
  const [events, setEvents] = useState<any[]>([]);
  const [totalCo2ByCategorie, setTotalCo2ByCategorie] = useState<any>({});
  const [resetting, setResetting] = useState(false);

  // 👇 États pour les actions passives
  const [passiveEvents, setPassiveEvents] = useState<any[]>([]);
  const [loadingPassiveEvents, setLoadingPassiveEvents] = useState(true);

  // Fonction fetch des événements
  const fetchEvents = async (selectedPeriode: string) => {
    try {
      const result = await printAllEvents(selectedPeriode);
      if (result.status) {
        setEvents(result.events);
        setTotalCo2ByCategorie(result.total_co2_by_categorie || {});
      } else {
        setEvents([]);
        setTotalCo2ByCategorie({});
      }
    } catch (error) {
      console.error('Erreur fetchEvents :', error);
      setEvents([]);
      setTotalCo2ByCategorie({});
    }
  };

  // Fonction fetch des actions passives
  const fetchPassiveEvents = async () => {
    try {
      const result = await printAllPassiveEvents();
      if (result.status) {
        const events = result.passive_events || [];

        // 🔹 Enrichir chaque event avec son absence
        const eventsWithAbsences = await Promise.all(
          events.map(async (ev) => {
            const absence = await getAbsenceByActionPassiveId(ev.action_passive_id);
            return { ...ev, absence };
          })
        );

        setPassiveEvents(eventsWithAbsences);
      } else {
        setPassiveEvents([]);
        console.warn('Aucun passive event récupéré :', result.message);
      }
    } catch (error) {
      console.error('Erreur fetchPassiveEvents :', error);
      setPassiveEvents([]);
    }
  };

  // 🔄 Reload complet
  const reloadAll = async () => {
    setLoading(true);
    setLoadingPassiveEvents(true);
    await Promise.all([fetchEvents(periode), fetchPassiveEvents()]);
    setLoading(false);
    setLoadingPassiveEvents(false);
  };

  // Reset App
  const handleResetApp = async () => {
    setResetting(true);
    try {
      await resetApp();
      Alert.alert('Réinitialisation', "L'application a été réinitialisée.");
      reloadAll(); // reload après reset
    } catch (e) {
      Alert.alert('Erreur', 'Erreur lors de la réinitialisation.');
    } finally {
      setResetting(false);
    }
  };

  // 🔹 Reload à chaque ouverture de l'écran
  useFocusEffect(
    React.useCallback(() => {
      reloadAll();
    }, [periode])
  );

  // Préparer les données pour le graphe
  const grapheData = events.length > 0 ? [
    { label: 'Aliment', value: totalCo2ByCategorie.total_co2_aliment || 0, color: tabColors.aliment },
    { label: 'Transport', value: totalCo2ByCategorie.total_co2_transport || 0, color: tabColors.transport },
    { label: 'Logement', value: totalCo2ByCategorie.total_co2_logement || 0, color: tabColors.logement },
  ] : [];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1, margin: 20 }}>
        {__DEV__ && (
          <>
            {resetting ? (
              <ActivityIndicator size="small" color="#000" style={{ marginTop: 10 }} />
            ) : (
              <Button title="Reset App" onPress={handleResetApp} />
            )}
          </>
        )}

        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Mes émissions CO2</Text>

        {/* Volet déroulant pour choisir la période */}
        <FilterPicker
          options={periodeOptions}
          selectedValue={periode}
          onValueChange={setPeriode}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <>
            {/* Graphe CO2 */}
            {grapheData.length > 0 ? (
              <GrapheG data={grapheData} />
            ) : (
              <Text style={{ marginTop: 20 }}>Aucune donnée pour cette période.</Text>
            )}

            {/* Historique */}
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 20 }}>Historique</Text>

            {/* Section des évènements passifs */}
            <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Évènements passifs</Text>
            {loadingPassiveEvents ? (
              <ActivityIndicator size="small" color="#000" style={{ marginVertical: 10 }} />
            ) : passiveEvents.length > 0 ? (
              <ActionPassiveList passiveEvents={passiveEvents} onRefresh={reloadAll} />
            ) : (
              <Text style={{ marginVertical: 10 }}>Aucune action passive trouvée.</Text>
            )}

            {/* Section autres évènements */}
            <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 20 }}>Autres évènements</Text>
            {events.length > 0 ? (
              <ActionList iterations={events} />
            ) : (
              <Text>Aucun événement enregistré pour cette période.</Text>
            )}
          </>
        )}
      </ScrollView>

      <GeneralMenu backgroundColor={'#000'} onCreated={reloadAll} />

      {/* Tutoriel */}
      {isTutoActive && (
        <TutoOverlay
          highlightPos={tutoSteps.general[currentStep]?.highlightPos || { x:0, y:0, width:0, height:0 }}
          message={tutoSteps.general[currentStep]?.message || ''}
          currentStep={currentStep}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTuto}
        />
      )}
    </View>
  );
}