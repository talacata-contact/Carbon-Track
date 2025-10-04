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
  View,
} from 'react-native';

import { tabColors } from '@/constants/Colors';
import { createEvent } from '@/services/evenementsService/evenements';
import {
  getAllChauffages,
  getLogementById,
  getLogementsFavoris,
} from '@/services/referencesService/logements';

export default function CreateLogement({ onClose }) {
  const [mode, setMode] = useState<string>('creation');
  const [chauffages, setChauffages] = useState([]);
  const [logements, setLogements] = useState([]);
  const [selectedLogementId, setSelectedLogementId] = useState<string | null>(null);

  const [nom, setNom] = useState('');
  const [chauffageId, setChauffageId] = useState<string>('');
  const [superficie, setSuperficie] = useState('');
  const [temperature, setTemperature] = useState('');

  const [date, setDate] = useState<Date | null>(null);
  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'date' | 'dateDebut' | 'dateFin' | null>(null);

  const [isEditableUsage, setIsEditableUsage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const chauffageRes = await getAllChauffages();
      if (chauffageRes.status && chauffageRes.chauffages) setChauffages(chauffageRes.chauffages);

      const logementRes = await getLogementsFavoris();
      if (logementRes.status && logementRes.logements_favoris) {
        setLogements([
          ...logementRes.logements_favoris,
          { id: 'non_enregistre', nom: 'Logement non enregistré' },
        ]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLogement = async () => {
      if (mode === 'usage' && selectedLogementId) {
        if (selectedLogementId !== 'non_enregistre') {
          try {
            const response = await getLogementById(selectedLogementId);
            if (response?.status && response?.logement) {
              const logement = response.logement;
              setChauffageId(logement.chauffage_id?.toString() || '');
              setSuperficie(logement.superficie_m2?.toString() || '');
              setTemperature(
                logement.temp_chauffage !== null && logement.temp_chauffage !== undefined
                  ? logement.temp_chauffage.toString()
                  : ''
              );
              setIsEditableUsage(false);
            } else {
              setIsEditableUsage(true);
              setChauffageId('');
              setSuperficie('');
              setTemperature('');
            }
          } catch (error) {
            console.error('Erreur récupération logement :', error);
            setIsEditableUsage(true);
          }
        } else {
          setChauffageId('');
          setSuperficie('');
          setTemperature('');
          setIsEditableUsage(true);
        }
      } else if (mode === 'creation') {
        setSelectedLogementId(null);
        setIsEditableUsage(false);
        setNom('');
        setChauffageId('');
        setSuperficie('');
        setTemperature('');
        setDate(null);
        setDateDebut(null);
        setDateFin(null);
      }
    };
    fetchLogement();
  }, [selectedLogementId, mode]);

  const formatDate = (d: Date | null) => (d ? d.toLocaleDateString('fr-CA') : '');

  const showDatePicker = (target: 'date' | 'dateDebut' | 'dateFin') => {
    setPickerTarget(target);
    setShowPicker(true);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (pickerTarget === 'date') setDate(selectedDate);
      else if (pickerTarget === 'dateDebut') setDateDebut(selectedDate);
      else if (pickerTarget === 'dateFin') setDateFin(selectedDate);
    }
  };

  const validateForm = () => {
    if (mode === 'creation') {
      if (!nom.trim()) { Alert.alert('Erreur', 'Le nom du logement est requis.'); return false; }
      if (!chauffageId) { Alert.alert('Erreur', 'Le type de chauffage est requis.'); return false; }
      if (!superficie || isNaN(Number(superficie)) || Number(superficie) <= 0) {
        Alert.alert('Erreur', 'La superficie doit être un nombre positif.'); return false;
      }
      if (temperature && isNaN(Number(temperature))) {
        Alert.alert('Erreur', 'La température doit être un nombre.'); return false;
      }
      if (!date) { Alert.alert('Erreur', 'La date est requise.'); return false; }
    } else {
      if (!selectedLogementId) { Alert.alert('Erreur', 'Veuillez choisir un logement.'); return false; }
      if (selectedLogementId === 'non_enregistre') {
        if (!chauffageId) { Alert.alert('Erreur', 'Le type de chauffage est requis.'); return false; }
        if (!superficie || isNaN(Number(superficie)) || Number(superficie) <= 0) {
          Alert.alert('Erreur', 'La superficie doit être un nombre positif.'); return false;
        }
      }
      if (temperature && isNaN(Number(temperature))) {
        Alert.alert('Erreur', 'La température doit être un nombre.'); return false;
      }
      if (!dateDebut) { Alert.alert('Erreur', 'La date de début est requise.'); return false; }
      if (!dateFin) { Alert.alert('Erreur', 'La date de fin est requise.'); return false; }
      if (dateDebut > dateFin) { Alert.alert('Erreur', 'La date de début doit être avant la date de fin.'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (mode === 'creation') {
        await createEvent(
          'creation',
          'logement',
          null,
          { nom, chauffage_id: Number(chauffageId), superficie_m2: Number(superficie), temp_chauffage: Number(temperature) },
          formatDate(date)
        );
      } else {
        if (selectedLogementId && selectedLogementId !== 'non_enregistre') {
          await createEvent('usage', 'logement', Number(selectedLogementId), { 
            temp_chauffage: Number(temperature), 
            date_debut: formatDate(dateDebut), 
            date_fin: formatDate(dateFin) 
          }, null);
        } else {
          await createEvent('usage', 'logement', null, {
            chauffage_id: Number(chauffageId),
            superficie_m2: Number(superficie),
            temp_chauffage: Number(temperature),
            date_debut: formatDate(dateDebut),
            date_fin: formatDate(dateFin),
          }, null);
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
          <View style={[styles.pickerContainer, { backgroundColor: tabColors['logement'] }]}>
            <Picker selectedValue={mode} onValueChange={setMode} style={styles.picker} dropdownIconColor="#fff">
              <Picker.Item label="Utilisation d'un logement" value="usage" />
              <Picker.Item label="Création / Achat d'un logement" value="creation" />
            </Picker>
          </View>

          {mode === 'creation' && (
            <>
              <Text style={styles.label}>Nom du logement</Text>
              <TextInput style={styles.input} placeholder="Nom du logement" value={nom} onChangeText={setNom} />

              <Text style={styles.label}>Type de chauffage</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={chauffageId} onValueChange={(itemValue: string) => setChauffageId(itemValue)} style={styles.picker} dropdownIconColor="#000">
                  <Picker.Item label="-- Choisir un chauffage --" value="" />
                  {chauffages.map((ch) => <Picker.Item key={ch.id} label={ch.nom} value={ch.id.toString()} />)}
                </Picker>
              </View>

              <Text style={styles.label}>Superficie (m²)</Text>
              <TextInput style={styles.input} placeholder="Superficie (m²)" value={superficie} keyboardType="numeric" onChangeText={setSuperficie} />

              <Text style={styles.label}>Température</Text>
              <TextInput style={styles.input} placeholder="Température" value={temperature} keyboardType="numeric" onChangeText={setTemperature} />

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity onPress={() => showDatePicker('date')} style={[styles.input, styles.dateInput]}>
                <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === 'usage' && (
            <>
              <Text style={styles.label}>Choisir un logement</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={selectedLogementId || ''} onValueChange={(itemValue: string) => setSelectedLogementId(itemValue)} style={styles.picker} dropdownIconColor="#000">
                  <Picker.Item label="-- Choisir un logement --" value="" />
                  {logements.map((l) => <Picker.Item key={l.id} label={l.nom || 'Sans nom'} value={l.id} />)}
                </Picker>
              </View>

              <Text style={styles.label}>Type de chauffage</Text>
              {isEditableUsage ? (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={chauffageId} onValueChange={(itemValue: string) => setChauffageId(itemValue)} style={styles.picker} dropdownIconColor="#000">
                    <Picker.Item label="-- Choisir un chauffage --" value="" />
                    {chauffages.map((ch) => <Picker.Item key={ch.id} label={ch.nom} value={ch.id.toString()} />)}
                  </Picker>
                </View>
              ) : (
                <TextInput style={[styles.input, { backgroundColor: '#eee' }]} editable={false} value={chauffages.find((c) => c.id.toString() === chauffageId)?.nom || ''} />
              )}

              <Text style={styles.label}>Superficie (m²)</Text>
              <TextInput style={[styles.input, !isEditableUsage && { backgroundColor: '#eee' }]} editable={isEditableUsage} value={superficie} keyboardType="numeric" onChangeText={setSuperficie} />

              <Text style={styles.label}>Température</Text>
              <TextInput style={styles.input} editable={true} value={temperature} keyboardType="numeric" onChangeText={setTemperature} />

              <Text style={styles.label}>Date de début</Text>
              <TouchableOpacity onPress={() => showDatePicker('dateDebut')} style={[styles.input, styles.dateInput]}>
                <Text>{dateDebut ? formatDate(dateDebut) : 'Sélectionner une date de début'}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Date de fin</Text>
              <TouchableOpacity onPress={() => showDatePicker('dateFin')} style={[styles.input, styles.dateInput]}>
                <Text>{dateFin ? formatDate(dateFin) : 'Sélectionner une date de fin'}</Text>
              </TouchableOpacity>
            </>
          )}

          {showPicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={
                pickerTarget === 'date' ? date || new Date()
                : pickerTarget === 'dateDebut' ? dateDebut || new Date()
                : pickerTarget === 'dateFin' ? dateFin || new Date()
                : new Date()
              }
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
            />
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
    padding: 20 
  },
  modal: { 
    backgroundColor: 'white', 
    borderRadius: 10, 
    maxHeight: '90%', 
    padding: 15 
  },
  label: { 
    fontWeight: '600', 
    marginTop: 10 
  },
  input: { 
    borderColor: tabColors['logement'], 
    borderWidth: 1, 
    padding: 8, 
    marginTop: 5, 
    borderRadius: 10 
  },
  pickerContainer: { 
    borderColor: tabColors['logement'], 
    borderWidth: 1, 
    borderRadius: 10, 
    marginTop: 5 
  },
  picker: { 
    height: 50 
  },
  button: { 
    marginTop: 20, 
    backgroundColor: tabColors['logement'], 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  cancelButton: { 
    backgroundColor: '#ddd', 
    marginTop: 10 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  dateInput: { 
    justifyContent: 'center' 
  },
});
