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
import { useTuto } from '@/contexts/TutoProvider';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  backgroundColor?: string;
  onPressSettings?: () => void;
  logoSource: any;
}

export default function Header({ onPressSettings, logoSource }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/');

  let active = segments[segments.length - 1] || 'index';
  if (segments.includes('details')) {
    active = segments[segments.length - 1];
  }
  if (active === '') active = 'index';

  const backgroundColor = tabColors[active] || '#000';

  const tuto = useTuto();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Logo cliquable pour revenir à l'index */}
      <TouchableOpacity
        onPress={() => router.replace('/')}
        activeOpacity={0.7}
      >
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>

      {active !== 'index' && (
        <TouchableOpacity
          style={{ marginLeft: 150 }}
          onPress={() => tuto.startTuto(active)}
        >
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onPressSettings} style={styles.iconWrapper}>
        <Ionicons name="settings-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  logo: {
    width: 120,
    height: 60,
  },
  iconWrapper: {
    padding: 4,
    paddingEnd: 50,
  },
});
