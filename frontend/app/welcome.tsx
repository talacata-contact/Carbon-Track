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

import { useTuto } from '@/contexts/TutoProvider';
import { initdb } from '@/db/initdb';
import { sendLocalNotification, syncUserActivity } from '@/services/notificationsService/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { syncMoyennesFr } from '../services/dataService/moyennesFr';
import { syncSuggestions } from '../services/dataService/suggestions';
import { syncChauffages } from '../services/referencesService/logements';
import { syncCategoriesTransports } from '../services/referencesService/transports';
import { createUser } from '../services/utilisateurService/utilisateur';

export default function Welcome() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { startTuto } = useTuto();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom.');
      return;
    }

    const connected = await checkInternetConnection();
    if (!connected) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté à Internet pour le premier lancement.'
      );
      return;
    }

    setLoading(true);
    try {
      await initdb();

      // --- syncCategoriesTransports ---
      const resTransports = await syncCategoriesTransports();
      if (!resTransports.status) {
        Alert.alert(
          'Erreur réseau',
          'Une erreur de connexion est survenue lors de la synchro des transports. Veuillez réessayer.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: handleStart }
          ]
        );
        return; // stoppe ici
      }

      // --- syncChauffages ---
      const resChauffages = await syncChauffages();
      if (!resChauffages.status) {
        Alert.alert(
          'Erreur réseau',
          'Une erreur de connexion est survenue lors de la synchro des chauffages. Veuillez réessayer.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: handleStart }
          ]
        );
        return;
      }

      // --- syncMoyennesFr ---
      const resMoyennes = await syncMoyennesFr();
      if (!resMoyennes.status) {
        Alert.alert(
          'Erreur réseau',
          'Une erreur de connexion est survenue lors de la synchro des moyennes. Veuillez réessayer.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: handleStart }
          ]
        );
        return;
      }

      // --- syncSuggestions ---
      const resSuggestions = await syncSuggestions();
      if (!resSuggestions.status) {
        Alert.alert(
          'Erreur réseau',
          'Une erreur de connexion est survenue lors de la synchro des suggestions. Veuillez réessayer.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: handleStart }
          ]
        );
        return;
      }

      // --- createUser ---
      const resUser = await createUser(name);
      if (resUser?.status === false) {
        Alert.alert(
          'Erreur réseau',
          'Impossible de créer l’utilisateur. Veuillez réessayer.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: handleStart }
          ]
        );
        return;
      }

      // --- Synchronisation de l'activité pour les notifications ---
      try {
        await syncUserActivity();
        await sendLocalNotification('Bienvenue !', 'Merci d’utiliser MonApp');
      } catch (err) {
        console.warn('⚠️ Impossible de synchroniser l’activité utilisateur:', err);
      }

      await AsyncStorage.setItem('hasLaunched', 'true');

      // Démarrage immédiat du tuto
      startTuto('general', true);

      // Navigation vers l'application
      navigation.navigate('(tabs)');
    } catch (err: any) {
      Alert.alert('Erreur', 'Impossible de terminer l’initialisation.');
      console.error(err);
      return;
    } finally {
      setLoading(false);
    }
  };

  const checkInternetConnection = async () => {
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue !</Text>
      <Text>Entrez votre nom pour commencer :</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Votre nom"
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Commencer" onPress={handleStart} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 5
  },
});