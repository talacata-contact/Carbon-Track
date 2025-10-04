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

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { tabColors } from '@/constants/Colors';
import { alimentIcons, transportIcons } from '@/constants/IconMap';
import { getActionById, getActionByReferenceId } from '@/services/evenementsService/actions';
import { createIterationForActionUsuelle } from '@/services/evenementsService/actionsIterations';
import { getActionUsuelleByActionId, isPossibleToCreateActionUsuelle } from '@/services/evenementsService/actionsUsuelles';

import FavAliment from '@/components/Fav/FavAliment';
import FavTransport from '@/components/Fav/FavTransport';
import RepetAliment from '@/components/Repet/RepetAliment';
import RepetLogement from '@/components/Repet/RepetLogement';
import RepetTransport from '@/components/Repet/RepetTransport';

interface FavEtRepetProps {
  category: 'transport' | 'aliment' | 'logement';
  referenceId: number;
  actionId: number;
  onFavPress?: () => void;
  showRepet?: boolean;
}

export default function FavEtRepet({
  category,
  referenceId,
  actionId,
  onFavPress,
  showRepet = true,
}: FavEtRepetProps) {
  const backgroundColor = tabColors[category] || '#000';
  const [showModal, setShowModal] = useState(false);
  const [showFavTransport, setShowFavTransport] = useState(false);
  const [showFavAliment, setShowFavAliment] = useState(false);
  const [actionUsuelle, setActionUsuelle] = useState<any>(null);
  const [canCreateAction, setCanCreateAction] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let usuelle = await getActionUsuelleByActionId(actionId);

        if (!usuelle && category === 'aliment') {
          const action = await getActionById(actionId);
          let action_associee = null;
          if (action.type_action === "creation") {
            action_associee = await getActionByReferenceId("usage", "aliment", action.aliment_code);
          } else {
            action_associee = await getActionByReferenceId("creation", "aliment", action.aliment_code);
          }
          if (action_associee?.id) {
            usuelle = await getActionUsuelleByActionId(action_associee.id);
          }
        }

        setActionUsuelle(usuelle || null);
        const possible = await isPossibleToCreateActionUsuelle();
        setCanCreateAction(possible.is_possible);
      } catch (error) {
        console.log('Erreur récupération action usuelle:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [actionId]);

  const handleFavPress = async () => {
    if (actionUsuelle) {
      const today = new Date().toISOString().split('T')[0];
      await createIterationForActionUsuelle(actionUsuelle.id, today);
      onFavPress?.();
    } else if (canCreateAction) {
      if (category === 'transport') return setShowFavTransport(true);
      if (category === 'aliment') return setShowFavAliment(true);
    }
  };

  if (loading) return <ActivityIndicator size="small" color="#000" />;

  return (
    <>
      {/* Boutons flottants */}
      <View style={styles.container}>
        {(category !== 'logement' && (actionUsuelle || canCreateAction)) && (
          <TouchableOpacity style={[styles.circle, { backgroundColor }]} onPress={handleFavPress}>
            {actionUsuelle ? (
              category === 'transport' ? (
                transportIcons[actionUsuelle.num_icone]
                  ? React.createElement(transportIcons[actionUsuelle.num_icone], { size: 20, color: '#fff' })
                  : <Ionicons name="star" size={20} color="#fff" />
              ) : category === 'aliment' ? (
                alimentIcons[actionUsuelle.num_icone]
                  ? React.createElement(alimentIcons[actionUsuelle.num_icone], { size: 20, color: '#fff' })
                  : <Ionicons name="star" size={20} color="#fff" />
              ) : <Ionicons name="star" size={20} color="#fff" />
            ) : <Ionicons name="star-outline" size={20} color="#fff" />}
          </TouchableOpacity>
        )}

        {showRepet && (
          <TouchableOpacity style={[styles.circle, { backgroundColor }]} onPress={() => setShowModal(true)}>
            <Ionicons name="repeat" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Modals de répétition */}
      {showModal && category === 'transport' && (
        <RepetTransport referenceId={referenceId} actionId={actionId} onClose={() => { setShowModal(false); onFavPress?.(); }} />
      )}
      {showModal && category === 'aliment' && (
        <RepetAliment referenceId={referenceId} actionId={actionId} onClose={() => { setShowModal(false); onFavPress?.(); }} />
      )}
      {showModal && category === 'logement' && (
        <RepetLogement referenceId={referenceId} actionId={actionId} onClose={() => { setShowModal(false); onFavPress?.(); }} />
      )}

      {/* Modals de création d'action usuelle */}
      {showFavTransport && (
        <FavTransport
          actionId={actionId}
          onClose={async () => {
            setShowFavTransport(false);
            const usuelle = await getActionUsuelleByActionId(actionId);
            setActionUsuelle(usuelle);
            onFavPress?.();
          }}
        />
      )}
      {showFavAliment && (
        <FavAliment
          actionId={actionId}
          onClose={async () => {
            setShowFavAliment(false);
            const usuelle = await getActionUsuelleByActionId(actionId);
            setActionUsuelle(usuelle);
            onFavPress?.();
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'column',
    gap: 10,
    bottom: 50,
    right: 25,
    alignItems: 'flex-end',
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
