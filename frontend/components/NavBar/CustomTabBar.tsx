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
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const tabs = [
  {
    name: 'aliment',
    icon: (size: number) => <FontAwesome5 name="utensils" size={size} color="#fff" />,
  },
  {
    name: 'transport',
    icon: (size: number) => <MaterialCommunityIcons name="bus" size={size} color="#fff" />,
  },
  {
    name: 'logement',
    icon: (size: number) => <FontAwesome5 name="home" size={size} color="#fff" />,
  },
  {
    name: 'index',
    icon: (size: number) => <FontAwesome5 name="chart-pie" size={size} color="#fff" />,
  },
];

export default function CustomTabBar() {
  const pathname = usePathname();
  const segments = pathname.split('/');

  // Détermination de l'onglet actif
  let active = segments[segments.length - 1] || 'index';
  if (segments.includes('details')) {
    active = segments[segments.length - 1]; // ex: logement, transport, aliment
  }
  if (active === '') active = 'index';

  const router = useRouter();
  const backgroundColor = tabColors[active] || '#000';

  return (
    <View style={{ flex: 1 / 10, position: 'relative' }}>
      {/* Barre d'onglets */}
      <View style={[styles.container, { backgroundColor }]}>
        {tabs.map((t) => {
          const focused = t.name === active;
          const iconSize = focused ? 32 : 26;

          return (
            <View key={t.name} style={styles.tabWrapper}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  if (t.name === 'index') {
                    router.replace('/'); // racine
                  } else {
                    router.replace(`/${t.name}`);
                  }
                }}
                style={styles.touchable}
              >
                <View
                  style={
                    focused
                      ? [styles.bubble, { backgroundColor: tabColors[t.name] || backgroundColor }]
                      : styles.iconContainer
                  }
                >
                  {t.icon(iconSize)}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 10,
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  bubble: {
    position: 'absolute',
    top: -50,
    width: 70,
    padding: 14,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    top: -100,
    right: 25,
    alignItems: 'flex-end',
  },
});
