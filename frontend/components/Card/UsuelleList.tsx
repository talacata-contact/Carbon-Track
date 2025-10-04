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

import { tabColors } from "@/constants/Colors";
import { alimentIcons, transportIcons } from "@/constants/IconMap";
import { getActionById } from "@/services/evenementsService/actions";
import { deleteActionUsuelle, getAllActionsUsuelles, updateActionUsuelle } from "@/services/evenementsService/actionsUsuelles";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function UsuelleList() {
  const [actions, setActions] = useState<any[]>([]);

  // 🔄 Récupération des actions
  const fetchActions = async () => {
    const res = await getAllActionsUsuelles();
    if (res.status && res.actions_usuelles) {
      // récupérer la catégorie de chaque action
      const enriched = await Promise.all(
        res.actions_usuelles.map(async (a: any) => {
          const act = await getActionById(a.action_id);
          return { ...a, categorie: act?.categorie || "transport" };
        })
      );
      setActions(enriched);
    }
  };

  // 🔄 Recharge à chaque fois que la page est focus
  useFocusEffect(
    useCallback(() => {
      fetchActions();
    }, [])
  );

  // 📝 Modification instantanée
  const handleUpdate = async (id: number, field: string, value: any) => {
    await updateActionUsuelle(id, { [field]: value });
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  // 🗑️ Suppression
  const handleDelete = async (id: number) => {
    await deleteActionUsuelle(id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  // 🎨 Affichage d’un item
  const renderItem = ({ item }: { item: any }) => {
    const IconComp =
      item.categorie === "transport"
        ? transportIcons[item.num_icone]
        : alimentIcons[item.num_icone];

    const backgroundColor = tabColors[item.categorie] || "#999";

    return (
      <View
        style={[
          styles.rowContainer,
          { backgroundColor: backgroundColor + "33" }, // fond transparent
        ]}
      >
        {/* Icone cercle */}
        <TouchableOpacity
          style={[styles.circle, { backgroundColor }]}
          onPress={() => console.log("TODO: popup icons", item)}
        >
          {IconComp ? (
            <IconComp size={20} color="#fff" />
          ) : (
            <Ionicons name="star" size={20} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Nom éditable */}
        <TextInput
          style={styles.name}
          value={item.nom}
          onChangeText={(txt) => handleUpdate(item.id, "nom", txt)}
        />

        {/* Supprimer */}
        <TouchableOpacity
          style={[styles.circle, { backgroundColor }]}
          onPress={() => handleDelete(item.id)}
        >
          <FontAwesome5 name="trash-alt" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={actions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 10 }}
    />
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
  },
});