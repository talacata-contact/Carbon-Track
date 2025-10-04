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
import { alimentIcons } from '@/constants/IconMap';
import { createActionUsuelle } from '@/services/evenementsService/actionsUsuelles';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type FavAlimentProps = {
  actionId: number;
  onClose: () => void;
};

export default function FavAliment({ actionId, onClose }: FavAlimentProps) {
  const [actionName, setActionName] = useState<string>(`Action ${actionId}`);
  const [quantity, setQuantity] = useState<string>('100');
  const [quantityUnit, setQuantityUnit] = useState<string>('g');
  const [selectedIcon, setSelectedIcon] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Erreur', 'Quantité invalide.');
      return false;
    }
    if (!quantityUnit) {
      Alert.alert('Erreur', 'Veuillez sélectionner une unité.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createActionUsuelle(actionId, selectedIcon, actionName, {
        quantity_value: Number(quantity),
        quantity_unit: quantityUnit,
      });
      Alert.alert('Succès', 'Action usuelle créée !');
      onClose();
    } catch (e: any) {
      console.warn(e);
      Alert.alert('Erreur', e.message || "Impossible de créer l’action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView keyboardShouldPersistTaps="handled">
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
            {Object.entries(alimentIcons).map(([num, IconComp]) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.iconWrapper,
                  selectedIcon === Number(num) && { borderColor: tabColors['aliment'], borderWidth: 2 },
                ]}
                onPress={() => setSelectedIcon(Number(num))}
              >
                <IconComp size={30} color={selectedIcon === Number(num) ? tabColors['aliment'] : '#666'} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Quantité</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Unité</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={quantityUnit}
              onValueChange={setQuantityUnit}
              style={styles.picker}
              dropdownIconColor="#000"
            >
              <Picker.Item label="g" value="g" />
              <Picker.Item label="kg" value="kg" />
              <Picker.Item label="ml" value="ml" />
              <Picker.Item label="L" value="L" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Valider</Text>
            )}
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
    maxHeight: '75%',
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
    borderColor: tabColors['aliment'],
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
    backgroundColor: tabColors['aliment'],
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
