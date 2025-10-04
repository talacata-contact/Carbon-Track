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
import { transportIcons } from '@/constants/IconMap';
import { createActionUsuelle } from '@/services/evenementsService/actionsUsuelles';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type FavTransportProps = {
  actionId: number;
  onClose: () => void;
};

export default function FavTransport({ actionId, onClose }: FavTransportProps) {
  const [selectedIcon, setSelectedIcon] = useState<number>(1);
  const [distance, setDistance] = useState<string>('100');
  const [actionName, setActionName] = useState<string>(`Action ${actionId}`);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!distance || isNaN(Number(distance)) || Number(distance) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir une distance positive.');
      return;
    }

    setLoading(true);
    try {
      await createActionUsuelle(actionId, selectedIcon, actionName, { distance_km: Number(distance) });
      Alert.alert('Succès', 'Action usuelle créée !');
      onClose();
    } catch (e: any) {
      console.warn(e);
      Alert.alert('Erreur', e.message || 'Impossible de créer l’action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 10 }}>
          <Text style={styles.title}>Enregistrement d'une action usuelle</Text>

          <Text style={styles.label}>Nom de l’action</Text>
          <TextInput
            style={styles.input}
            value={actionName}
            onChangeText={setActionName}
            placeholder="Nom de l'action"
          />

          <Text style={styles.label}>Icône</Text>
          <View style={styles.iconsContainer}>
            {Object.entries(transportIcons).map(([num, IconComp]) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.iconWrapper,
                  selectedIcon === Number(num) && { borderColor: tabColors['transport'], borderWidth: 2 }
                ]}
                onPress={() => setSelectedIcon(Number(num))}
              >
                <IconComp size={30} color={selectedIcon === Number(num) ? tabColors['transport'] : '#666'} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Pour quelle distance (km) ?</Text>
          <TextInput
            style={styles.input}
            value={distance}
            keyboardType="numeric"
            onChangeText={setDistance}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Chargement...' : 'Valider'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={[styles.buttonText, { color: '#000' }]}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000bd',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  modal: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    maxHeight: '64%',
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 15,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    borderColor: tabColors['transport'],
    borderWidth: 1,
    padding: 8,
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    marginTop: 20,
    backgroundColor: tabColors['transport'],
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
