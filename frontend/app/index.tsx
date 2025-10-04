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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const launched = await AsyncStorage.getItem('hasLaunched');
        console.log("AsyncStorage 'hasLaunched' :", launched);

        if (launched) {
          // déjà lancé
          setFirstLaunch(false);
        } else {
          // premier lancement → on marque comme lancé
          setFirstLaunch(true);
        }
      } catch (e) {
        console.warn("Erreur AsyncStorage:", e);
        setFirstLaunch(true); // sécurité → aller sur welcome
      } finally {
        setLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (firstLaunch) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}