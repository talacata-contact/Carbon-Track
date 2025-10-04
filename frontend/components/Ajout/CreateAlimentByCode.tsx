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
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { getAlimentByCode, searchAlimentByBarcode } from '@/services/referencesService/aliments';

type Props = { onClose: () => void; onCreated?: () => void };

export default function CreateAlimentByCode({ onClose, onCreated }: Props) {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [aliment, setAliment] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [quantityUnit, setQuantityUnit] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <View style={alimentStyles.center}>
        <Text>Demande de permission caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={alimentStyles.center}>
        <Text>Pas d’accès à la caméra</Text>
        <TouchableOpacity style={alimentStyles.button} onPress={requestPermission}>
          <Text style={alimentStyles.buttonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    try {
      const barcode = result.data;
      const searchResult = await searchAlimentByBarcode(barcode);

      if (searchResult.status) {
        setAliment(searchResult.aliment);
      } else {
        // Vérifier si l'erreur est un 404
        if (searchResult.message?.includes('404')) {
          Alert.alert(
            'Produit non trouvé',
            'Veuillez réessayer',
            [{ text: 'OK', onPress: () => onClose() }] // fermeture du modal
          );
        } else {
          Alert.alert('Erreur', searchResult.message);
          setScanned(false); // on réactive le scan uniquement si ce n'est pas un 404
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Impossible de récupérer l'aliment.");
      setScanned(false);
    } finally {
      setLoading(false);
      setShowCamera(false);
    }
  };

  const formatDate = (d: Date | null) => d ? d.toLocaleDateString('fr-CA') : '';

  const handleValidate = async () => {
    if (!aliment) { 
      Alert.alert('Erreur', "Aucun aliment sélectionné."); 
      return; 
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) { 
      Alert.alert('Erreur', "Quantité invalide."); 
      return; 
    }

    if (!quantityUnit || quantityUnit === '') { 
      Alert.alert('Erreur', "Veuillez sélectionner une unité."); 
      return; 
    }

    setLoading(true);
    try {
      const existingAliment = await getAlimentByCode(aliment.code);
      const reference_id = existingAliment ? existingAliment.code : null;
      const params = {
        product_name: aliment.product_name,
        marques: aliment.brands,
        tags: aliment.food_groups_tags || [],
        quantity_value: Number(quantity),
        quantity_unit: quantityUnit,
        code: aliment.code,
      };
      await createEvent('creation', 'aliment', reference_id, params, date ? formatDate(date) : null);
      Alert.alert('Succès', 'Aliment enregistré !');
      if (onCreated) onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Impossible de créer l'événement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={alimentStyles.overlay}>
      <View style={alimentStyles.modal}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {showCamera && !aliment && (
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr','ean13','ean8','upc_e'] }}
              style={{ width: '100%', height: 410, marginTop: 10, borderRadius: 10 }}
            />
          )}

          {loading && (
            <View style={alimentStyles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={alimentStyles.overlayText}>Chargement...</Text>
            </View>
          )}

          {aliment && (
            <>
              <Text style={alimentStyles.label}>Nom: {aliment.product_name}</Text>
              <Text style={alimentStyles.label}>Code: {aliment.code}</Text>
              <Text style={alimentStyles.label}>Marques: {aliment.brands}</Text>
              <Text style={alimentStyles.label}>Catégories: {aliment.food_groups_tags?.join(', ')}</Text>

              <Text style={alimentStyles.label}>Quantité</Text>
              <TextInput
                style={alimentStyles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />

              <Text style={alimentStyles.label}>Unité</Text>
              <View style={alimentStyles.pickerContainer}>
                <Picker
                  selectedValue={quantityUnit}
                  onValueChange={setQuantityUnit}
                  style={alimentStyles.picker}
                  dropdownIconColor="#000"
                >
                  <Picker.Item label="Sélectionner une unité..." value="" />
                  <Picker.Item label="g" value="g" />
                  <Picker.Item label="kg" value="kg" />
                  <Picker.Item label="mL" value="mL" />
                  <Picker.Item label="L" value="L" />
                </Picker>
              </View>

              <Text style={alimentStyles.label}>Date</Text>
              <TouchableOpacity style={[alimentStyles.input, alimentStyles.dateInput]} onPress={() => setShowPicker(true)}>
                <Text>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(e, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              <TouchableOpacity style={alimentStyles.button} onPress={handleValidate}>
                <Text style={alimentStyles.buttonText}>Valider</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={[alimentStyles.button, alimentStyles.cancelButton]} onPress={onClose}>
            <Text style={[alimentStyles.buttonText, { color: '#000' }]}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const alimentStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: 'white', borderRadius: 10, maxHeight: '90%', padding: 15 },
  label: { fontWeight: '600', marginTop: 10 },
  input: { borderColor: tabColors['aliment'], borderWidth: 1, padding: 8, marginTop: 5, borderRadius: 10, backgroundColor: '#fff' },
  pickerContainer: { borderColor: tabColors['aliment'], borderWidth: 1, borderRadius: 10, marginTop: 5 },
  picker: { height: 50 },
  button: { marginTop: 20, backgroundColor: tabColors['aliment'], paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ddd', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
  dateInput: { justifyContent: 'center' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  overlayText: { color: '#fff', marginTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
