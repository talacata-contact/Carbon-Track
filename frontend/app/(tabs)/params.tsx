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

import Objectif from "@/components/Card/Objectif";
import UsuelleList from "@/components/Card/UsuelleList";
import { tabColors } from "@/constants/Colors";
import { useTuto } from "@/contexts/TutoProvider";
import { exportdb } from "@/db/exportdb";
import { getUser, updateUser } from "@/services/utilisateurService/utilisateur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ParamsScreen() {
  const router = useRouter();
  const { startTuto } = useTuto();
  const [nom, setNom] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await getUser();
        setUser(u.user);
        setNom(u?.user.nom || "");
      } catch (err) {
        console.error("Erreur récupération utilisateur :", err);
      }
    };

    fetchUser();
  }, []);

  const handleUpdateName = async () => {
    if (nom && user && nom !== user.nom) {
      try {
        await updateUser({ nom });
        setUser({ ...user, nom });
      } catch (err) {
        console.error("Erreur mise à jour utilisateur :", err);
      }
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      {/* Titre */}
      <Text style={styles.title}>Paramètres</Text>

      {/* Section Votre nom */}
      <Text style={{ marginLeft: 15 }}>Votre nom</Text>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} />
        <TouchableOpacity onPress={handleUpdateName} style={styles.iconButton}>
          <Ionicons
            name="checkmark-circle"
            size={28}
            color={tabColors.general}
          />
        </TouchableOpacity>
      </View>

      {/* Bouton tutoriel */}
      <TouchableOpacity
        style={styles.fullButton}
        onPress={() => {
          startTuto('general', false);
          router.replace('/');
        }}
      >
        <Text style={styles.fullButtonText}>Suivre de nouveau le tutoriel</Text>
      </TouchableOpacity>

      {/* Section Actions usuelles */}
      <Text style={styles.sectionTitle}>Gestion des Actions Usuelles</Text>
      <UsuelleList />

      {/* Section Objectifs */}
      <Text style={styles.sectionTitle}>Gestion des Objectifs à atteindre</Text>
      <Objectif />

      {/* Bouton export */}
      <TouchableOpacity style={styles.fullButton} onPress={() => exportdb()}>
        <Text style={styles.fullButtonText}>Télécharger mes données</Text>
      </TouchableOpacity>

      {/* Bouton import */}
      {/*
      <TouchableOpacity style={styles.fullButton} onPress={() => importdb()}>
        <Text style={styles.fullButtonText}>Importer mes données</Text>
      </TouchableOpacity>
      */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  iconButton: {
    marginLeft: 10,
  },
  fullButton: {
    marginTop: 20,
    backgroundColor: tabColors.general,
    padding: 15,
    borderRadius: 20,
    height: 40,
  },
  fullButtonText: {
    width: 160,
    height: 50,
    color: "white",
  },
});
