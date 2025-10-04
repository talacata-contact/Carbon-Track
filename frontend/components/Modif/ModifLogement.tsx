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
import { getActionByReferenceId } from '@/services/evenementsService/actions';
import { deleteIteration, getIterationById, updateIteration } from '@/services/evenementsService/actionsIterations';
import { deleteReference, updateReference } from '@/services/evenementsService/actionsReferences';
import { printAllEventsByActionId } from "@/services/evenementsService/evenements";
import { deleteLogementForDemenagement, getAllChauffagesFromApi, getLogementById } from '@/services/referencesService/logements';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  onClose: () => void;
  referenceId?: number | null;
  iterationId?: number | null;
};

export default function ModifLogement({ onClose, referenceId = null, iterationId = null }: Props) {
  const [mode, setMode] = useState<'ref' | 'usage'>(referenceId ? 'ref' : 'usage');
  const [chauffages, setChauffages] = useState<any[]>([]);
  const [nom, setNom] = useState('');
  const [chauffageId, setChauffageId] = useState<string>('');
  const [superficie, setSuperficie] = useState('');
  const [temperature, setTemperature] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'date' | null>(null);
  const [isFavori, setIsFavori] = useState(false);
  const [params, setParams] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chauff = await getAllChauffagesFromApi();
        setChauffages(chauff);

        if (referenceId && !iterationId) {
          // Mode 'ref'
          setMode('ref');
          const ref = await getLogementById(referenceId);
          const l = ref.logement;
          setNom(l.nom || '');
          setChauffageId(l.chauffage_id?.toString() || '');
          setSuperficie(l.superficie_m2?.toString() || '');
          setTemperature(l.temp_chauffage?.toString() || '');
          setIsFavori(l.is_favori || false);

          const action = await getActionByReferenceId('creation', 'logement', referenceId);
          const iterData = await printAllEventsByActionId(Number(action.id));
          if (iterData?.action_details?.date_creation) {
            setDate(new Date(iterData.action_details.date_creation));
          }

        } else if (referenceId && iterationId) {
          // Mode 'usage'
          setMode('usage');
          const iter = await getIterationById(iterationId);

          if (iter?.iteration) {
            setDate(iter.iteration.date ? new Date(iter.iteration.date) : new Date());
            if (iter.iteration.params) {
              setParams(iter.iteration.params);
              setTemperature(iter.iteration.params.temp_chauffage?.toString() || '');
            }
          }
        }
      } catch (e) {
        console.warn('Erreur fetch ModifLogement:', e);
      }
    };

    fetchData();
  }, [referenceId, iterationId]);

  const formatDate = (d: Date | null) => d ? d.toLocaleDateString('fr-CA') : '';
  const showDatePicker = (target: 'date') => { setPickerTarget(target); setShowPicker(true); };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate && pickerTarget === 'date') setDate(selectedDate);
  };

  const validateForm = () => {
    if (mode === 'ref') {
      if (!nom.trim()) { Alert.alert('Erreur', 'Le nom du logement est requis.'); return false; }
      if (!chauffageId) { Alert.alert('Erreur', 'Le type de chauffage est requis.'); return false; }
      if (!superficie || isNaN(Number(superficie)) || Number(superficie) <= 0) { Alert.alert('Erreur', 'La superficie doit être un nombre positif.'); return false; }
      if (!temperature || isNaN(Number(temperature))) { Alert.alert('Erreur', 'La température doit être un nombre.'); return false; }
    } else {
      if (!temperature || isNaN(Number(temperature))) { Alert.alert('Erreur', 'La température doit être un nombre.'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (mode === 'ref' && referenceId) {
        await updateReference(
          'logement',
          referenceId,
          {
            nom,
            chauffage_id: Number(chauffageId),
            superficie_m2: Number(superficie),
            temp_chauffage: Number(temperature),
          },
          formatDate(date),
          isFavori
        );
      } else if (mode === 'usage' && iterationId) {
        await updateIteration(
          iterationId,
          'usage',
          'logement',
          referenceId,
          { ...params, temp_chauffage: Number(temperature) },
          formatDate(date),
        );
      }
      onClose();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Erreur inconnue');
    }
  };

  const handleDelete = () => {
    if (mode === 'ref' && referenceId) {
        // Suppression complète de la référence
        Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer ce logement et toutes ses actions associées ?', [
          { text: 'Annuler', style: 'cancel' },
          {
              text: 'Oui',
              onPress: async () => {
              try {
                  await deleteReference(referenceId, 'logement');
                  onClose();
              } catch (e: any) {
                  Alert.alert('Erreur', e.message || 'Suppression impossible');
              }
              },
              style: 'destructive',
          },
        ]);
    } else if (mode === 'usage' && iterationId) {
        // Suppression d'une itération
        Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer cette utilisation ?', [
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
        ]);
    }
    };


  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.modal}>
        <ScrollView contentContainerStyle={{ paddingBottom: 10 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 10 }}>
            {mode === 'ref' ? `Modification du logement – ${nom}` : `Modification de l’utilisation du logement`}
          </Text>

          {mode === 'ref' && (
            <>
              <Text style={styles.label}>Nom du logement</Text>
              <TextInput style={styles.input} value={nom} onChangeText={setNom} />

              <Text style={styles.label}>Type de chauffage</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={chauffageId} onValueChange={(itemValue: string) => setChauffageId(itemValue)} style={styles.picker}>
                  {chauffages.map(ch => <Picker.Item key={ch.id} label={ch.nom} value={ch.id.toString()} />)}
                </Picker>
              </View>

              <Text style={styles.label}>Superficie (m²)</Text>
              <TextInput style={styles.input} value={superficie} keyboardType="numeric" onChangeText={setSuperficie} />

              <Text style={styles.label}>Température</Text>
              <TextInput style={styles.input} value={temperature} keyboardType="numeric" onChangeText={setTemperature} />

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity onPress={() => showDatePicker('date')} style={[styles.input, styles.dateInput]}>
                <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === 'usage' && (
            <>
              <Text style={styles.label}>Température</Text>
              <TextInput style={styles.input} value={temperature} keyboardType="numeric" onChangeText={setTemperature} />

              <Text style={styles.label}>Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#eee' }]}
                editable={false}
                value={date ? formatDate(date) : ''}
              />
            </>
          )}

          {showPicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
            />
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            {/* Suppression complète */}
            <TouchableOpacity onPress={handleDelete}>
                <FontAwesome5 name="trash-alt" size={20} color="black" />
            </TouchableOpacity>

            {/* Suppression des favoris + annulation des actions passives */}
            {mode === 'ref' && referenceId && (
                <TouchableOpacity
                onPress={() => {
                    Alert.alert('Confirmation', 'Retirer ce logement des favoris ?', [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Oui',
                        onPress: async () => {
                        try {
                            await deleteLogementForDemenagement(referenceId, []);
                            onClose();
                        } catch (e: any) {
                            Alert.alert('Erreur', e.message || 'Suppression impossible');
                        }
                        },
                        style: 'destructive',
                    },
                    ]);
                }}
                >
                <FontAwesome5 name="truck-loading" size={20} color="black" />
                </TouchableOpacity>
            )}
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
    padding: 15,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    borderColor: tabColors['logement'],
    borderWidth: 1,
    padding: 8,
    marginTop: 5,
    borderRadius: 10,
  },
  pickerContainer: {
    borderColor: tabColors['logement'],
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 5,
  },
  picker: {
    height: 50,
  },
  button: {
    marginTop: 20,
    backgroundColor: tabColors['logement'],
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
