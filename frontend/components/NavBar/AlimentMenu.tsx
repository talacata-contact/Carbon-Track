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
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import CreateAlimentByCode from '@/components/Ajout/CreateAlimentByCode';
import CreateAlimentByText from '@/components/Ajout/CreateAlimentByText';

type Props = { onCreated?: () => void };

export default function AlimentMenu({ onCreated }: Props) {
  const [showCreateAlimentCode, setShowCreateAlimentCode] = useState(false);
  const [showCreateAlimentText, setShowCreateAlimentText] = useState(false);

  return (
    <View style={styles.container}>
      {/* Bouton QR code */}
      <TouchableOpacity
        style={[styles.circle, { backgroundColor: tabColors['aliment'] }]}
        onPress={() => setShowCreateAlimentCode(true)}
      >
        <FontAwesome5 name="qrcode" size={18} color="#fff" />
      </TouchableOpacity>

      {/* Bouton recherche classique */}
      <TouchableOpacity
        style={[styles.circle, { backgroundColor: tabColors['aliment'] }]}
        onPress={() => setShowCreateAlimentText(true)}
      >
        <FontAwesome5 name="search" size={18} color="#fff" />
      </TouchableOpacity>

      {/* Modal avec CreateAlimentByCode */}
      <Modal
        visible={showCreateAlimentCode}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateAlimentCode(false)}
      >
        <CreateAlimentByCode onClose={() => setShowCreateAlimentCode(false)} 
          onCreated={onCreated} />
      </Modal>

      {/* Modal avec CreateAlimentByText */}
      <Modal
        visible={showCreateAlimentText}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateAlimentText(false)}
      >
        <CreateAlimentByText onClose={() => setShowCreateAlimentText(false)} 
          onCreated={onCreated} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});