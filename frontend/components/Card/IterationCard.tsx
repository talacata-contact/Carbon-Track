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
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  iteration: any;
  categorie?: string;
  onPress?: () => void;
};

export default function IterationCard({ iteration, categorie, onPress }: Props) {
  if (!iteration) return null;

  const { date, co2, params, type_action } = iteration;

  const paramsParsed = typeof params === 'string' ? JSON.parse(params) : params;
  const paramsDisplay = printParamsIteration(type_action, categorie || '', iteration, params);

  const renderParams = () => {
    if (categorie === 'transport' && paramsDisplay?.distance_km != null) {
      return (
        <Text>
          Distance : {paramsDisplay.distance_km} km{"\n"}
          Consommation au km : {paramsDisplay.conso_km} L/100km
        </Text>
      );
    }
    else if (categorie === 'aliment' && paramsDisplay?.quantity_value != null) {
      return (
        <Text>
          Quantité : {paramsDisplay.quantity_value} {paramsDisplay.quantity_unit} {"\n"}
        </Text>
      );
    }
    if (paramsParsed.temp_chauffage != null) {
      return <Text>Température : {paramsParsed.temp_chauffage} °C</Text>;
    }
    return null;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.card, { backgroundColor: tabColors[categorie || ''] || '#fff', opacity: 0.9 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.date}>{date}</Text>
          {co2 != null && (
            <Text style={styles.co2}>
              {co2} {paramsDisplay?.co2_unit || 'kg CO2'}
            </Text>
          )}
        </View>
        <View style={styles.params}>{renderParams()}</View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: { fontWeight: 'bold', fontSize: 16 },
  params: { marginTop: 4 },
  co2: { fontWeight: 'bold', fontSize: 16 },
});
