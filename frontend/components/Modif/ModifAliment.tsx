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
import { deleteIteration, getIterationById, updateIteration } from '@/services/evenementsService/actionsIterations';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  onClose: () => void;
  iterationId: number;
};

export default function ModifAliment({ onClose, iterationId }: Props) {
  const [referenceId, setReferenceId] = useState<any>(null);
  const [typeAction, setTypeAction] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'date' | null>(null);
  const [action_passive_id, setActionPassiveId] = useState<number | null>(null);
  const [params, setParams] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const iter = await getIterationById(iterationId);
        if (iter?.iteration) {
          setDate(iter.iteration.date ? new Date(iter.iteration.date) : new Date());
          setActionPassiveId(iter.iteration.action_passive_id || null);
          setTypeAction(iter.iteration.params.type_action || '');
          if (iter.iteration.params) {
            setParams(iter.iteration.params);
            setReferenceId(iter.iteration.reference_id);
            setQuantity(iter.iteration.params.quantity_value?.toString() || '');
            setQuantityUnit(iter.iteration.params.quantity_unit || '');
          }
        }
      } catch (e) {
        console.warn('Erreur fetch ModifAliment:', e);
      }
    };
    fetchData();
  }, [iterationId]);

    const formatDate = (d: Date | null) => d ? d.toLocaleDateString('fr-CA') : '';
    const showDatePicker = (target: 'date') => { setPickerTarget(target); setShowPicker(true); };

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate && pickerTarget === 'date') setDate(selectedDate);
    };

  const validateForm = () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) { Alert.alert('Erreur', 'Quantité invalide.'); return false; }
    if (!quantityUnit) { Alert.alert('Erreur', 'Veuillez sélectionner une unité.'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await updateIteration(
        iterationId,
        typeAction,
        'aliment',
        referenceId,
        { ...params, quantity_value: Number(quantity), quantity_unit: quantityUnit },
        formatDate(date),
        params.action_passive_id || null
      );
      onClose();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de mettre à jour l’aliment.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
        'Confirmation',
        'Voulez-vous vraiment supprimer cette utilisation ?',
        [
        { text: 'Annuler', style: 'cancel' },
        {
            text: 'Oui',
            onPress: async () => {
            try {
                await deleteIteration(iterationId);
                onClose();
            } catch (e: any) {
                Alert.alert('Erreur', e.message || 'Suppression impossible');
            }
            },
            style: 'destructive',
        },
        ]
    );
    };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 10 }}>
            {`Modification de l’utilisation de l'aliment`}
          </Text>

          {params && (
            <>
              <Text style={styles.label}>Nom: {params.product_name}</Text>
              <Text style={styles.label}>Code: {params.code}</Text>
              <Text style={styles.label}>Marques: {params.brands}</Text>
              <Text style={styles.label}>Catégories: {params.tags?.join(', ')}</Text>

              <Text style={styles.label}>Quantité</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />

              <Text style={styles.label}>Unité</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={quantityUnit} onValueChange={(itemValue: string) => setQuantityUnit(itemValue)} style={styles.picker}>
                  <Picker.Item label="Sélectionner une unité..." value="" />
                  <Picker.Item label="g" value="g" />
                  <Picker.Item label="kg" value="kg" />
                  <Picker.Item label="ml" value="ml" />
                  <Picker.Item label="L" value="L" />
                </Picker>
              </View>

                <Text style={styles.label}>Date</Text>
                <TouchableOpacity onPress={() => showDatePicker('date')} style={[styles.input, styles.dateInput]}>
                    <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
                </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                />
              )}
            </>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            {/* Suppression de l'utilisation */}
            <TouchableOpacity onPress={handleDelete}>
                <FontAwesome5 name="trash-alt" size={20} color="black" />
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Valider</Text>
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
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '90%',
    padding: 15,
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
  dateInput: {
    justifyContent: 'center',
  },
});

