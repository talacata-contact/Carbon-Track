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
import { getActionById } from '@/services/evenementsService/actions';
import { deleteIterationsByActionPassiveId } from '@/services/evenementsService/actionsIterations';
import { deletePassiveAction } from '@/services/evenementsService/actionsPassives';
import { updatePassiveAction } from '@/services/evenementsService/actionsPassives.js';
import { createAbsence } from '@/services/utilisateurService/absences';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ActionPassiveList({ passiveEvents, onRefresh }) {
  // --- Modal ajout absence ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPassive, setSelectedPassive] = useState<any | null>(null);
  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'dateDebut' | 'dateFin' | 'date' | 'endDate' | null>(null);

  // --- Modal édition action passive ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editPassive, setEditPassive] = useState<any | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [distanceKm, setDistanceKm] = useState('');
  const [temperature, setTemperature] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState<string>('g');
  const [repeatNumber, setRepeatNumber] = useState('');
  const [repeatUnit, setRepeatUnit] = useState<string>('jours');

  const formatDate = (d: Date | null) => (d ? d.toLocaleDateString('fr-CA') : '');

  // --- Supprimer action passive ---
  const confirmDelete = (action_passive_id: number) => {
    Alert.alert(
      "Supprimer l'action passive",
      "Voulez-vous supprimer aussi toutes les itérations associées ?",
      [
        { text: "Supprimer seulement l'action passive", style: "destructive", onPress: async () => { await deletePassiveAction(action_passive_id); onRefresh(); } },
        { text: "Supprimer avec toutes les itérations", style: "destructive", onPress: async () => { await deleteIterationsByActionPassiveId(action_passive_id); await deletePassiveAction(action_passive_id); onRefresh(); } },
        { text: "Annuler", style: "cancel" }
      ]
    );
  };

  // --- Ajout absence ---
  const handleAddAbsence = (item) => {
    setSelectedPassive(item);
    setDateDebut(null);
    setDateFin(null);
    setModalVisible(true);
  };

  const handleValidateAbsence = async () => {
    if (!selectedPassive || !dateDebut || !dateFin) {
      Alert.alert("Erreur", "Veuillez sélectionner les deux dates.");
      return;
    }
    if (dateDebut > dateFin) {
      Alert.alert("Erreur", "La date de début doit être avant la date de fin.");
      return;
    }
    try {
      await createAbsence(selectedPassive.action_passive_id, dateDebut.toISOString(), dateFin.toISOString());
      Alert.alert("Succès", "Absence ajoutée !");
      setModalVisible(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible d'ajouter l'absence.");
    }
  };

  // --- Edition action passive ---
  const openEditModal = async (item: any) => {
    try {
      const action = await getActionById(item.action_id);
      setEditPassive({ ...item, categorie: action.categorie });
      setDate(item.action_passive_date_debut ? new Date(item.action_passive_date_debut) : new Date());
      setEndDate(item.action_passive_date_fin ? new Date(item.action_passive_date_fin) : null);
      setRepeatNumber(item.action_passive_repeat_every?.toString() || '');
      setRepeatUnit(item.action_passive_repeat_unit || 'jours');

      const params = item.params ? JSON.parse(item.params) : {};
      if (action.categorie === 'transport') {
        setDistanceKm(params.distance_km?.toString() || '');
        setTemperature('');
        setQuantity('');
      } else if (action.categorie === 'logement') {
        setTemperature(params.temp_chauffage?.toString() || '');
        setDistanceKm('');
        setQuantity('');
      } else if (action.categorie === 'aliment') {
        setQuantity(params.quantity_value?.toString() || '');
        setQuantityUnit(params.quantity_unit || 'g');
        setDistanceKm('');
        setTemperature('');
      }

      setEditModalVisible(true);
    } catch (err) {
      console.error("Erreur lors de la récupération de la catégorie :", err);
      Alert.alert("Erreur", "Impossible de récupérer la catégorie de l'action.");
    }
  };

  const handleValidateEdit = async () => {
    if (!editPassive) return;

    // Validation
    if (editPassive.categorie === 'transport' && (!distanceKm || isNaN(Number(distanceKm)) || Number(distanceKm) <= 0)) {
      Alert.alert("Erreur", "La distance doit être un nombre positif.");
      return;
    }
    if (editPassive.categorie === 'logement' && (!temperature || isNaN(Number(temperature)))) {
      Alert.alert("Erreur", "La température doit être un nombre.");
      return;
    }
    if (editPassive.categorie === 'aliment' && (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0)) {
      Alert.alert("Erreur", "La quantité doit être un nombre positif.");
      return;
    }
    if (!repeatNumber || isNaN(Number(repeatNumber)) || Number(repeatNumber) <= 0) {
      Alert.alert("Erreur", "Le nombre de répétitions doit être un nombre positif.");
      return;
    }

    // Paramètres
    let params: any = {};
    if (editPassive.categorie === 'transport') params = { "distance_km": Number(distanceKm) };
    else if (editPassive.categorie === 'logement') params = { "temp_chauffage": Number(temperature) };
    else if (editPassive.categorie === 'aliment') params = { "quantity_value": Number(quantity), quantity_unit: quantityUnit };

    const updates: any = {
      date_debut: date.toISOString(),
      repeat_every: Number(repeatNumber),
      repeat_unit: repeatUnit,
      date_fin: endDate ? endDate.toISOString() : null,
      params
    };

    try {
      await updatePassiveAction(editPassive.action_passive_id, updates);
      Alert.alert("Succès", "Action passive modifiée !");
      setEditModalVisible(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de modifier l'action passive.");
    }
  };

  // --- Date picker ---
  const showDatePicker = (target: 'dateDebut' | 'dateFin' | 'date' | 'endDate') => {
    setPickerTarget(target);
    setShowPicker(true);
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (!selectedDate) return;

    if (pickerTarget === 'dateDebut') setDateDebut(selectedDate);
    else if (pickerTarget === 'dateFin') setDateFin(selectedDate);
    else if (pickerTarget === 'date') setDate(selectedDate);
    else if (pickerTarget === 'endDate') setEndDate(selectedDate);
  };

  const isTodayBetween = (start: string, end: string) => {
  if (!start || !end) return false;
  const today = new Date();
  const dStart = new Date(start);
  const dEnd = new Date(end);
  return today >= dStart && today <= dEnd;
};


  return (
    <View style={{ marginTop: 10 }}>
      {passiveEvents.map((item) => (
        <View key={item.action_passive_id} style={styles.row}>
          <TouchableOpacity onPress={() => confirmDelete(item.action_passive_id)}>
            <FontAwesome5 name="trash-alt" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={{ flex: 1 }} onPress={() => openEditModal(item)}>
            <Text style={styles.nom}>{item.action_nom}</Text>
          </TouchableOpacity>

          {item.absence && isTodayBetween(item.absence.date_debut, item.absence.date_fin) ? (
            <Text style={{ fontWeight: "600", maxWidth: 120 }}>
              Absence : {formatDate(new Date(item.absence.date_debut))} - {formatDate(new Date(item.absence.date_fin))}
            </Text>
          ) : (
            <TouchableOpacity
              style={{ ...styles.btnAbsence, backgroundColor: tabColors['general'] }}
              onPress={() => handleAddAbsence(item)}
            >
              <Text style={{ color: 'white' }}>Ajouter une absence</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Modal édition action passive */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {/* Dates */}
              <Text style={styles.label}>Date début</Text>
              <TouchableOpacity style={[styles.dateBtn, { borderColor: tabColors[editPassive?.categorie || 'general'] }]} onPress={() => showDatePicker('date')}>
                <Text>{formatDate(date)}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Date fin</Text>
              <TouchableOpacity style={[styles.dateBtn, { borderColor: tabColors[editPassive?.categorie || 'general'] }]} onPress={() => showDatePicker('endDate')}>
                <Text>{formatDate(endDate)}</Text>
              </TouchableOpacity>

              {/* Répétition */}
              <Text style={styles.label}>Répéter tous les :</Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1, borderColor: tabColors[editPassive?.categorie || 'general'] }]}
                  value={repeatNumber}
                  keyboardType="numeric"
                  onChangeText={setRepeatNumber}
                />
                <View style={[styles.pickerContainer, { flex: 1, borderColor: tabColors[editPassive?.categorie || 'general'] }]}>
                  <Picker selectedValue={repeatUnit} onValueChange={(itemValue: string) => setRepeatUnit(itemValue)} style={styles.picker} dropdownIconColor={tabColors[editPassive?.categorie || 'general']}>
                    <Picker.Item label="Jours" value="jours" />
                    <Picker.Item label="Semaines" value="semaines" />
                    <Picker.Item label="Mois" value="mois" />
                    <Picker.Item label="Années" value="années" />
                  </Picker>
                </View>
              </View>

              {/* Champs selon catégorie */}
              {editPassive?.categorie === 'transport' && (
                <>
                  <Text style={styles.label}>Distance (km)</Text>
                  <TextInput style={[styles.input, { borderColor: tabColors['transport'] }]} value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" />
                </>
              )}
              {editPassive?.categorie === 'logement' && (
                <>
                  <Text style={styles.label}>Température</Text>
                  <TextInput style={[styles.input, { borderColor: tabColors['logement'] }]} value={temperature} onChangeText={setTemperature} keyboardType="numeric" />
                </>
              )}
              {editPassive?.categorie === 'aliment' && (
                <>
                  <Text style={styles.label}>Quantité</Text>
                  <TextInput style={[styles.input, { borderColor: tabColors['aliment'] }]} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

                  <Text style={styles.label}>Unité</Text>
                  <View style={[styles.pickerContainer, { borderColor: tabColors['aliment'] }]}>
                    <Picker selectedValue={quantityUnit} onValueChange={(itemValue: string) => setQuantityUnit(itemValue)} style={styles.picker} dropdownIconColor={tabColors['aliment']}>
                      <Picker.Item label="g" value="g" />
                      <Picker.Item label="kg" value="kg" />
                      <Picker.Item label="ml" value="ml" />
                      <Picker.Item label="L" value="L" />
                    </Picker>
                  </View>
                </>
              )}

              {/* Date picker */}
              {showPicker && (
                <DateTimePicker
                  value={pickerTarget === 'endDate' ? (endDate || new Date()) : date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                />
              )}

              {/* Boutons */}
              <TouchableOpacity style={[styles.button, { backgroundColor: tabColors[editPassive?.categorie || 'general'] }]} onPress={handleValidateEdit}>
                <Text style={styles.buttonText}>Valider</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                <Text style={{ color: 'black', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal ajout absence */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Date début</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => showDatePicker('dateDebut')}>
                <Text>{formatDate(dateDebut)}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Date fin</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => showDatePicker('dateFin')}>
                <Text>{formatDate(dateFin)}</Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}

              <TouchableOpacity style={[styles.button, { backgroundColor: tabColors['general'] }]} onPress={handleValidateAbsence}>
                <Text style={styles.buttonText}>Valider</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: 'black', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  nom: { flex: 1, marginHorizontal: 10, fontSize: 14, fontWeight: '600' },
  btnAbsence: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: 'white', borderRadius: 10, padding: 15, maxHeight: '80%' },
  label: { fontWeight: '600', marginTop: 10, color: 'black' },
  dateBtn: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 5, backgroundColor: '#fff' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginTop: 5 },
  picker: { height: 50 },
  button: { marginTop: 20, backgroundColor: tabColors['general'], paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ddd', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
