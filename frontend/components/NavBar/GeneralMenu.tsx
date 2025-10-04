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

import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CreateAlimentByCode from '@/components/Ajout/CreateAlimentByCode';
import CreateLogement from '@/components/Ajout/CreateLogement';
import CreateTransport from '@/components/Ajout/CreateTransport';
import { tabColors } from '@/constants/Colors';
import { alimentIcons, transportIcons } from '@/constants/IconMap';
import { getActionById } from '@/services/evenementsService/actions';
import { createIterationForActionUsuelle } from '@/services/evenementsService/actionsIterations';
import { getAllActionsUsuelles } from '@/services/evenementsService/actionsUsuelles';

const miniBtnSize = 50;
const MENU_GAP_ABOVE_MAIN = 12;

type Props = {
  backgroundColor: string;
  onCreated?: () => void;
};

export default function GeneralMenu({ backgroundColor, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<'logement' | 'transport' | 'aliment' | null>(null);
  const [actions, setActions] = useState<any[]>([]);

  
    const handleClose = () => {
      setModalTarget(null);
      if (onCreated) onCreated();
    };

  // 🔄 Récupération des actions usuelles avec icônes
  const handleFavoriPress = async () => {
    const res = await getAllActionsUsuelles();
    if (res.status && res.actions_usuelles) {
      const enriched = await Promise.all(
        res.actions_usuelles.map(async (a: any) => {
          const act = await getActionById(a.action_id);
          const categorie = act?.categorie || 'transport';

          let IconComp;
          if (categorie === 'transport') IconComp = transportIcons[a.num_icone] || Ionicons;
          else if (categorie === 'aliment') IconComp = alimentIcons[a.num_icone] || Ionicons;
          else IconComp = Ionicons;

          return {
            ...a,
            categorie,
            icon: <IconComp size={20} color="#fff" />,
          };
        })
      );
      setActions(enriched);
    }
  };

  // 📝 Créer une itération pour l’action usuelle
  const handleUsuellePress = async (actionUsuelle: any) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    await createIterationForActionUsuelle(actionUsuelle.id, formattedDate);
    handleClose();
  };

  const closeModal = () => setModalTarget(null);

  return (
    <View style={styles.wrapper}>
      {open && (
        // Menu en L positionné ABSOLUMENT par rapport au bouton général
        <View style={styles.menuLayer}>
          {/* LIGNE DU HAUT : favori (à droite) + usuelles vers la gauche */}
          <View style={styles.topRow}>
            {/* Favori = coin de l'angle (côté droit) */}
            <TouchableOpacity
              style={[styles.miniFab, styles.topRowFavorite]}
              onPress={handleFavoriPress}
            >
              <Ionicons name="heart" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Usuelles (rendues à gauche du favori grâce à row-reverse) */}
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.miniFab, styles.topRowAction, { backgroundColor: tabColors[action.categorie] }]}
                onPress={() => handleUsuellePress(action)}
              >
                {action.icon}
              </TouchableOpacity>
            ))}
          </View>

          {/* COLONNE : commence pile SOUS le favori */}
          <View style={styles.columnStack}>
            <TouchableOpacity
              style={[styles.miniFab, { backgroundColor: tabColors['aliment'] }]}
              onPress={() => setModalTarget('aliment')}
            >
              <FontAwesome5 name="utensils" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.miniFab, { backgroundColor: tabColors['transport'] }]}
              onPress={() => setModalTarget('transport')}
            >
              <MaterialCommunityIcons name="bus" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.miniFab, { backgroundColor: tabColors['logement'] }]}
              onPress={() => setModalTarget('logement')}
            >
              <FontAwesome5 name="home" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bouton principal */}
      <TouchableOpacity style={[styles.mainFab, { backgroundColor }]} onPress={() => setOpen(!open)}>
        <Text style={styles.mainFabText}>{open ? '×' : '+'}</Text>
      </TouchableOpacity>

      {/* Modals */}
      <Modal visible={modalTarget !== null} animationType="slide" transparent={true} onRequestClose={closeModal}>
        {modalTarget === 'logement' && <CreateLogement onClose={handleClose} />}
        {modalTarget === 'transport' && <CreateTransport onClose={handleClose} />}
        {modalTarget === 'aliment' && <CreateAlimentByCode onClose={handleClose} onCreated={onCreated} />}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // On ancre le wrapper en bas-droite pour un comportement constant
  wrapper: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'flex-end',
    bottom: 50, 
    right: 20,
  },

  // Calage du menu juste au-dessus du bouton général, aligné à DROITE
  menuLayer: {
    position: 'absolute',
    right: 0,
    bottom: miniBtnSize + MENU_GAP_ABOVE_MAIN,
    alignItems: 'flex-end',
  },

  // Favori à droite, usuelles qui partent vers la GAUCHE
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  topRowFavorite: {
    backgroundColor: tabColors['rouge'],
    marginLeft: 8,
  },
  topRowAction: {
    marginLeft: 8,
  },

  // Colonne sous le favori, alignée à droite
  columnStack: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  miniFab: {
    width: miniBtnSize,
    height: miniBtnSize,
    borderRadius: miniBtnSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  mainFab: {
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
  mainFabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 28,
  },
});
