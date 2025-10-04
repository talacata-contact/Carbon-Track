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
import { getAllCategoriesTransportsFromApi, getTransportById } from '@/services/referencesService/transports';
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

export default function ModifTransport({ onClose, referenceId = null, iterationId = null }: Props) {
    const [mode, setMode] = useState<'ref' | 'usage'>(referenceId ? 'ref' : 'usage');
    const [categories, setCategories] = useState<any[]>([]);
    const [nom, setNom] = useState('');
    const [categorieId, setCategorieId] = useState<string>('');
    const [consoKm, setConsoKm] = useState('');
    const [distanceKm, setDistanceKm] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'date' | null>(null);
    const [isFavori, setIsFavori] = useState(false);
    const [params, setParams] = useState<any>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const type = await getAllCategoriesTransportsFromApi();
                setCategories(type);

                if (referenceId && !iterationId) {
                    // Mode 'ref'
                    setMode('ref');
                    const ref = await getTransportById(referenceId);
                    const t = ref.transport;
                    setNom(t.nom || '');
                    setCategorieId(t.categorie_id?.toString() || '');
                    setConsoKm(t.conso_km?.toString() || '');
                    setIsFavori(t.is_favori || false);

                    const action = await getActionByReferenceId('creation', 'transport', referenceId);
                    
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
                            setConsoKm(iter.iteration.params.conso_km?.toString() || '');
                            setDistanceKm(iter.iteration.params.distance_km?.toString() || '');
                        }
                    }
                }
            } catch (e) {
                console.warn('Erreur fetch ModifTransport:', e);
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
        if (!nom.trim()) { Alert.alert('Erreur', 'Le nom du transport est requis.'); return false; }
        if (!categorieId) { Alert.alert('Erreur', 'La catégorie est requise.'); return false; }
        if (consoKm && (isNaN(Number(consoKm)) || Number(consoKm) < 0)) { Alert.alert('Erreur', 'La conso doit être un nombre positif.'); return false; }
        } else {
        if (consoKm && (isNaN(Number(consoKm)) || Number(consoKm) < 0)) { Alert.alert('Erreur', 'La conso doit être un nombre positif.'); return false; }
        if (!distanceKm || isNaN(Number(distanceKm)) || Number(distanceKm) <= 0) { Alert.alert('Erreur', 'La distance doit être un nombre positif.'); return false; }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            if (mode === 'ref' && referenceId) {
                await updateReference(
                'transport',
                referenceId,
                {
                    nom,
                    categorie_id: Number(categorieId),
                    conso_km: consoKm ? Number(consoKm) : null,
                },
                formatDate(date),
                isFavori,
                );
            } else if (mode === 'usage' && iterationId) {
                await updateIteration(
                iterationId,
                'usage',
                'transport',
                referenceId,
                { ...params, conso_km: consoKm ? Number(consoKm) : null, distance_km: Number(distanceKm) },
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
            Alert.alert('Confirmation', 'Supprimer ce transport et toutes ses actions associées ?', [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Oui',
                    onPress: async () => {
                        try {
                        await deleteReference(referenceId, 'transport');
                        onClose();
                        } catch (e: any) {
                        Alert.alert('Erreur', e.message || 'Suppression impossible');
                        }
                    },
                    style: 'destructive',
                },
            ]);
        } else if (mode === 'usage' && iterationId) {
        Alert.alert('Confirmation', 'Supprimer cette utilisation ?', [
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
            {mode === 'ref' ? `Modification du transport – ${nom}` : `Modification de l’utilisation du transport`}
          </Text>

          {mode === 'ref' && (
            <>
              <Text style={styles.label}>Nom du transport</Text>
              <TextInput style={styles.input} value={nom} onChangeText={setNom} />

              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={categorieId} onValueChange={(itemValue: string) => setCategorieId(itemValue)} style={styles.picker}>
                  {categories.map(c => <Picker.Item key={c.id} label={c.nom} value={c.id.toString()} />)}
                </Picker>
              </View>

              <Text style={styles.label}>Consommation (par km)</Text>
              <TextInput style={styles.input} value={consoKm} keyboardType="numeric" onChangeText={setConsoKm} />

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity onPress={() => showDatePicker('date')} style={[styles.input, styles.dateInput]}>
                <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === 'usage' && (
            <>
                <Text style={styles.label}>Consommation (par km)</Text>
                <TextInput style={styles.input} value={consoKm} keyboardType="numeric" onChangeText={setConsoKm} />

                <Text style={styles.label}>Distance parcourue (km)</Text>
                <TextInput style={styles.input} value={distanceKm} keyboardType="numeric" onChangeText={setDistanceKm} />

                <Text style={styles.label}>Date</Text>
                <TouchableOpacity onPress={() => showDatePicker('date')} style={[styles.input, styles.dateInput]}>
                    <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
                </TouchableOpacity>
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
    borderColor: tabColors['transport'],
    borderWidth: 1,
    padding: 8,
    marginTop: 5,
    borderRadius: 10,
  },
  pickerContainer: {
    borderColor: tabColors['transport'],
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 5,
  },
  picker: {
    height: 50,
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
  dateInput: {
    justifyContent: 'center',
  },
});
