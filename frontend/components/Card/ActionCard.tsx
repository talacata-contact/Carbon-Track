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

import { tabColors } from '@/constants/Colors';
import { printParamsIteration } from '@/services/evenementsService/actionsIterations';
import { getChauffageById } from '@/services/referencesService/logements';
import { getCategoryTransportById } from '@/services/referencesService/transports';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ActionCard({ action, reference, actionDetails, objectif }) {
  const { nom, type_action, categorie, params, date, co2 } = actionDetails;

  const router = useRouter();

  // États pour stocker les libellés récupérés
  const [chauffageNom, setChauffageNom] = useState<string | null>(null);
  const [categorieTransportNom, setCategorieTransportNom] = useState<string | null>(null);

  // Récupération des paramètres formatés
  const paramsDisplay = printParamsIteration(type_action, categorie, reference, params);

  useEffect(() => {
    const fetchData = async () => {
      if (categorie === 'logement' && reference?.chauffage_id) {
        const res = await getChauffageById(reference.chauffage_id);
        if (res.status && res.chauffage) {
          setChauffageNom(res.chauffage.nom);
        }
      }
      if (categorie === 'transport' && reference?.categorie_id) {
        const res = await getCategoryTransportById(reference.categorie_id);
        if (res.status && res.category) {
          setCategorieTransportNom(res.category.nom);
        }
      }
    };
    fetchData();
  }, [categorie, reference]);

  // Fonction sécurisée pour afficher une valeur dans <Text>
  const safeDisplay = (val: any) => {
    if (val == null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return val.toString();
  };

  const renderParams = () => {
    switch (categorie) {
      case 'logement':
        return (
          <>
            <Text>Type chauffage : {safeDisplay(chauffageNom) || 'N/A'}</Text>
            <Text>Superficie : {safeDisplay(reference?.superficie_m2)} m²</Text>
            {type_action === 'usage' && (
              <Text>Température : {safeDisplay(paramsDisplay.temp_chauffage)}°C</Text>
            )}
          </>
        );

      case 'transport':
        return (
          <>
            <Text>Type : {safeDisplay(categorieTransportNom) || 'N/A'}</Text>
            {type_action === 'usage' && (
              <Text>Distance : {safeDisplay(paramsDisplay.distance_km)} km</Text>
            )}
            {paramsDisplay.conso_km != null && (
              <Text>Conso : {safeDisplay(paramsDisplay.conso_km)} L/100km</Text>
            )}
          </>
        );

      case 'aliment':
        return (
          <>
            <Text>
              Quantité : {safeDisplay(paramsDisplay.quantity_value)}{' '}
              {safeDisplay(paramsDisplay.quantity_unit)}
            </Text>
          </>
        );

      default:
        return null;
    }
  };

  const handlePress = () => {
    router.push({
      pathname: `/details/${categorie}`,
      params: { actionId: action.id }, // on passe uniquement l'ID
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              objectif?.[0] && co2 != null && co2 > objectif[1]
                ? tabColors['rouge']
                : tabColors[categorie] || '#fff',
            opacity: 0.6,
          },
        ]}
      >
        <Text style={styles.title}>{safeDisplay(nom)}</Text>
        <View style={styles.params}>{renderParams()}</View>
        <Text style={styles.date}>{safeDisplay(date)}</Text>
        {co2 != null && (
          <Text style={styles.co2}>
            {safeDisplay(co2)} {safeDisplay(paramsDisplay.co2_unit)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  params: {
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  co2: {
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 18,
    textAlign: 'right',
  },
});
