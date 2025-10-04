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

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { tabColors } from '@/constants/Colors';
import { createEvent } from '@/services/evenementsService/evenements';
import { getAllCategoriesTransports, getTransportById, getTransportsFavoris } from '@/services/referencesService/transports';

export default function CreateTransport({ onClose }) {
  const [mode, setMode] = useState<'creation' | 'usage'>('creation');
  const [categories, setCategories] = useState([]);
  const [transports, setTransports] = useState([]);
  const [selectedTransportId, setSelectedTransportId] = useState<string | null>(null);

  const [nom, setNom] = useState('');
  const [categorieId, setCategorieId] = useState<string>('');
  const [consoKm, setConsoKm] = useState('');
  const [distanceKm, setDistanceKm] = useState('');

  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [isEditableUsage, setIsEditableUsage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getAllCategoriesTransports();
        setCategories(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);

        const response = await getTransportsFavoris();
        if (response.status && response.transports_favoris) {
          setTransports([
            ...response.transports_favoris,
            { id: 'non_enregistre', nom: 'Transport non enregistré' },
          ]);
        }
      } catch (error) {
        console.error('Erreur chargement catégories ou transports favoris :', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTransport = async () => {
      if (mode === 'usage' && selectedTransportId) {
        if (selectedTransportId !== 'non_enregistre') {
          try {
            const response = await getTransportById(selectedTransportId);
            if (response?.transport) {
              const transport = response.transport;
              setCategorieId(transport.categorie_id?.toString() || '');
              setConsoKm(
                transport.conso_km !== null && transport.conso_km !== undefined
                  ? transport.conso_km.toString()
                  : ''
              );
              setIsEditableUsage(false);
            } else {
              setCategorieId('');
              setConsoKm('');
              setIsEditableUsage(true);
            }
          } catch (error) {
            console.error('Erreur lors récupération transport :', error);
            setCategorieId('');
            setConsoKm('');
            setIsEditableUsage(true);
          }
        } else {
          setCategorieId('');
          setConsoKm('');
          setIsEditableUsage(true);
        }
      } else if (mode === 'creation') {
        setSelectedTransportId(null);
        setIsEditableUsage(false);
        setNom('');
        setCategorieId('');
        setConsoKm('');
        setDistanceKm('');
        setDate(null);
      }
    };
    fetchTransport();
  }, [selectedTransportId, mode]);

  const formatDate = (d: Date | null) => d ? d.toLocaleDateString('fr-CA') : '';

  const showDatePicker = () => setShowPicker(true);

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const validateForm = () => {
    if (mode === 'creation') {
      if (!nom.trim()) { Alert.alert('Erreur', 'Le nom du transport est requis.'); return false; }
      if (!categorieId) { Alert.alert('Erreur', 'La catégorie du transport est requise.'); return false; }
      if (consoKm && (isNaN(Number(consoKm)) || Number(consoKm) < 0)) {
        Alert.alert('Erreur', 'La consommation doit être un nombre positif.'); return false;
      }
      if (!date) { Alert.alert('Erreur', 'La date est requise.'); return false; }
    } else {
      if (!selectedTransportId) { Alert.alert('Erreur', 'Veuillez choisir un transport.'); return false; }
      if (selectedTransportId === 'non_enregistre') {
        if (!categorieId) { Alert.alert('Erreur', 'La catégorie du transport est requise.'); return false; }
        if (consoKm && (isNaN(Number(consoKm)) || Number(consoKm) < 0)) {
          Alert.alert('Erreur', 'La consommation doit être un nombre positif.'); return false;
        }
      }
      if (!distanceKm || isNaN(Number(distanceKm)) || Number(distanceKm) <= 0) {
        Alert.alert('Erreur', 'La distance parcourue doit être un nombre positif.'); return false;
      }
      if (!date) { Alert.alert('Erreur', 'La date est requise.'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (mode === 'creation') {
        await createEvent(
          'creation',
          'transport',
          null,
          { nom, categorie_id: Number(categorieId), conso_km: consoKm ? Number(consoKm) : null },
          formatDate(date)
        );
      } else {
        if (selectedTransportId && selectedTransportId !== 'non_enregistre') {
          await createEvent(
            'usage',
            'transport',
            Number(selectedTransportId),
            { distance_km: Number(distanceKm) },
            formatDate(date)
          );
        } else {
          await createEvent(
            'usage',
            'transport',
            null,
            { nom: nom || undefined, categorie_id: Number(categorieId), conso_km: consoKm ? Number(consoKm) : null, distance_km: Number(distanceKm) },
            formatDate(date)
          );
        }
      }
      onClose();
    } catch (error) {
      Alert.alert('Erreur', "Une erreur s'est produite lors de l'enregistrement.");
    }
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.modal}>
        <ScrollView contentContainerStyle={{ paddingBottom: 10 }} keyboardShouldPersistTaps="handled">
          <View style={[styles.pickerContainer, { backgroundColor: tabColors['transport'] }]}>
            <Picker selectedValue={mode} onValueChange={setMode} style={styles.picker} dropdownIconColor="#fff">
              <Picker.Item label="Utilisation d'un transport" value="usage" />
              <Picker.Item label="Création / Achat d'un transport" value="creation" />
            </Picker>
          </View>

          {mode === 'creation' && (
            <>
              <Text style={styles.label}>Nom du transport</Text>
              <TextInput style={styles.input} placeholder="Nom du transport" value={nom} onChangeText={setNom} />

              <Text style={styles.label}>Catégorie du transport</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={categorieId} onValueChange={(itemValue: string) => setCategorieId(itemValue)} style={styles.picker} dropdownIconColor="#000">
                  <Picker.Item label="-- Choisir une catégorie --" value="" />
                  {categories.map((c) => <Picker.Item key={c.id} label={c.nom} value={c.id.toString()} />)}
                </Picker>
              </View>

              <Text style={styles.label}>Consommation (par km)</Text>
              <TextInput style={styles.input} placeholder="Ex: 0.06 (L/100km) ou 0.15 (kWh/100km)" value={consoKm} keyboardType="numeric" onChangeText={setConsoKm} />

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity onPress={showDatePicker} style={[styles.input, styles.dateInput]}>
                <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === 'usage' && (
            <>
              <Text style={styles.label}>Choisir un transport</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={selectedTransportId || ''} onValueChange={(itemValue: string) => setSelectedTransportId(itemValue)} style={styles.picker} dropdownIconColor="#000">
                  <Picker.Item label="-- Choisir un transport --" value="" />
                  {transports.map((t) => <Picker.Item key={t.id} label={t.nom || 'Sans nom'} value={t.id} />)}
                </Picker>
              </View>

              <Text style={styles.label}>Catégorie du transport</Text>
              {isEditableUsage ? (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={categorieId} onValueChange={(itemValue: string) => setCategorieId(itemValue)} style={styles.picker} dropdownIconColor="#000">
                    <Picker.Item label="-- Choisir une catégorie --" value="" />
                    {categories.map((c) => <Picker.Item key={c.id} label={c.nom} value={c.id.toString()} />)}
                  </Picker>
                </View>
              ) : (
                <TextInput style={[styles.input, { backgroundColor: '#eee' }]} editable={false} value={categories.find((c) => c.id.toString() === categorieId)?.nom || ''} />
              )}

              <Text style={styles.label}>Consommation (par km) — facultatif</Text>
              <TextInput style={styles.input} value={consoKm} keyboardType="numeric" onChangeText={setConsoKm} />

              <Text style={styles.label}>Distance parcourue (km)</Text>
              <TextInput style={styles.input} placeholder="Ex: 100" value={distanceKm} keyboardType="numeric" onChangeText={setDistanceKm} />

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity onPress={showDatePicker} style={[styles.input, styles.dateInput]}>
                <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
              </TouchableOpacity>
            </>
          )}

          {showPicker && (
            <DateTimePicker testID="dateTimePicker" value={date || new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChangeDate} />
          )}

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
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '90%',
    padding: 20,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    marginTop: 12,
  },
  input: {
    borderColor: tabColors['transport'],
    borderWidth: 1,
    padding: 10,
    marginTop: 6,
    borderRadius: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: tabColors['transport'],
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    marginTop: 20,
    backgroundColor: tabColors['transport'],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  dateInput: {
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
