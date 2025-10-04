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
import { createPassiveAction } from '@/services/evenementsService/actionsPassives';
import { createEvent } from '@/services/evenementsService/evenements';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  onClose: () => void;
  referenceId: number;
  actionId: number; // nécessaire pour répétition
};

export default function RepetAliment({ onClose, referenceId, actionId }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'date' | 'endDate' | null>(null);
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState<string>('g');
  const [isRepetition, setIsRepetition] = useState(false);
  const [repeatNumber, setRepeatNumber] = useState('');
  const [repeatUnit, setRepeatUnit] = useState<string>('jours');
  const [loading, setLoading] = useState(false);

  const formatDate = (d: Date | null) => d ? d.toLocaleDateString('fr-CA') : '';

  const showDatePicker = (target: 'date' | 'endDate') => {
    setPickerTarget(target);
    setShowPicker(true);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (!selectedDate) return;

    if (pickerTarget === 'date') setDate(selectedDate);
    else if (pickerTarget === 'endDate') setEndDate(selectedDate);
  };

  const validateForm = () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Erreur', 'La quantité doit être un nombre positif.');
      return false;
    }
    if (!quantityUnit) {
      Alert.alert('Erreur', 'Veuillez sélectionner une unité.');
      return false;
    }
    if (isRepetition && (!repeatNumber || isNaN(Number(repeatNumber)) || Number(repeatNumber) <= 0)) {
      Alert.alert('Erreur', 'Le nombre de répétitions doit être un nombre positif.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (!isRepetition) {
        await createEvent(
          'usage',
          'aliment',
          referenceId,
          { quantity_value: Number(quantity), quantity_unit: quantityUnit },
          formatDate(date)
        );
      } else {
        if (!actionId) {
          Alert.alert('Erreur', 'Action ID manquant pour la répétition.');
          return;
        }
        await createPassiveAction(
          actionId,
          { quantity_value: Number(quantity), quantity_unit: quantityUnit },
          Number(repeatNumber),
          repeatUnit,
          formatDate(date),
          endDate ? formatDate(endDate) : null
        );
      }
      Alert.alert('Succès', 'Action enregistrée !');
      onClose();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Planifier une action alimentaire</Text>

          {/* Picker Date */}
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity onPress={() => showDatePicker('date')} style={[styles.input, styles.dateInput]}>
            <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
          </TouchableOpacity>

          {/* Quantité */}
          <Text style={styles.label}>Quantité</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            keyboardType="numeric"
            onChangeText={setQuantity}
            placeholder="Ex: 100"
          />

          {/* Unité */}
          <Text style={styles.label}>Unité</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={quantityUnit} onValueChange={(itemValue: string) => setQuantityUnit(itemValue)} style={styles.picker} dropdownIconColor="#000">
              <Picker.Item label="g" value="g" />
              <Picker.Item label="kg" value="kg" />
              <Picker.Item label="ml" value="ml" />
              <Picker.Item label="L" value="L" />
            </Picker>
          </View>

          {/* Activer répétition */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.checkbox, isRepetition && styles.checkedCheckbox]}
              onPress={() => setIsRepetition(!isRepetition)}
            >
              {isRepetition && <Ionicons name="checkmark-circle" size={20} color={tabColors.general}/>}
            </TouchableOpacity>
            <Text style={{ marginLeft: 10 }}>Répéter cette action</Text>
          </View>

          {isRepetition && (
            <>
              <Text style={styles.label}>Répéter tous les :</Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={repeatNumber}
                  keyboardType="numeric"
                  onChangeText={setRepeatNumber}
                  placeholder="Nombre"
                />
                <View style={[styles.pickerContainer, { flex: 1 }]}>
                  <Picker selectedValue={repeatUnit} onValueChange={(itemValue: string) => setRepeatUnit(itemValue)} style={styles.picker} dropdownIconColor="#000">
                    <Picker.Item label="Jours" value="jours" />
                    <Picker.Item label="Semaines" value="semaines" />
                    <Picker.Item label="Mois" value="mois" />
                    <Picker.Item label="Années" value="années" />
                  </Picker>
                </View>
              </View>

              {/* Date de fin */}
              <Text style={styles.label}>Date de fin (facultatif)</Text>
              <TouchableOpacity onPress={() => showDatePicker('endDate')} style={[styles.input, styles.dateInput]}>
                <Text>{endDate ? formatDate(endDate) : 'Sélectionner une date'}</Text>
              </TouchableOpacity>
            </>
          )}

          {showPicker && (
            <DateTimePicker
              value={pickerTarget === 'endDate' ? (endDate || new Date()) : date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
            />
          )}

          {/* Boutons */}
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
    maxHeight: '60%',
    minWidth: '100%',
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
  dateInput: {
    justifyContent: 'center',
  },
  pickerContainer: {
    borderColor: tabColors['aliment'],
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 5,
  },
  picker: {
    height: 50,
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
  checkbox: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: tabColors['aliment'],
  },
});
