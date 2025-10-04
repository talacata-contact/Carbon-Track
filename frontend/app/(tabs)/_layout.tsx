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

import { Tabs, useRouter, useSegments } from 'expo-router';
import { SafeAreaView, StatusBar, View } from 'react-native';

import CustomTabBar from '@/components/NavBar/CustomTabBar';
import Header from '@/components/NavBar/Header';
import { tabColors } from '@/constants/Colors';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  // Détermination de la catégorie active
  let active = (segments[segments.length - 1] || 'index').toLowerCase();
  if (segments.includes('details')) {
    active = segments[segments.length - 1]; // ex: logement, transport, aliment
  }
  if (active === '') active = 'index';

  const backgroundColor = tabColors[active] || '#000';

  const handleSettings = () => {
    router.push('params');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <Header
        onPressSettings={handleSettings}
        logoSource={require('@/assets/images/logo.png')}
      />
      <View style={{ flex: 1 }}>
        <Tabs
          initialRouteName="index"
          screenOptions={{ headerShown: false }}
          tabBar={() => <CustomTabBar />}
        >
          <Tabs.Screen name="aliment" />
          <Tabs.Screen name="transport" />
          <Tabs.Screen name="logement" />
          <Tabs.Screen name="index" options={{ title: 'General' }} />
          <Tabs.Screen name="details/[category]" />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
