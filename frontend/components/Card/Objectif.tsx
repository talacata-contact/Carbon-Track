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

import EqCO2 from "@/components/Graph/EqCO2";
import { tabColors } from "@/constants/Colors";
import { getMoyennesFr } from "@/services/dataService/moyennesFr";
import { getUser, updateUser } from "@/services/utilisateurService/utilisateur";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function Objectif() {
  const [user, setUser] = useState<any>(null);
  const [moyennes, setMoyennes] = useState<any>(null);

  const [aliment, setAliment] = useState<string>("");
  const [transport, setTransport] = useState<string>("");
  const [logement, setLogement] = useState<string>("");

  const screenWidth = Dimensions.get('window').width;

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      const resUser = await getUser();
      if (resUser.status && resUser.user) {
        const u = resUser.user;
        setUser(u);

        if (u.objectif_co2_mensuel_aliment_creation)
          setAliment(String(u.objectif_co2_mensuel_aliment_creation));
        if (u.objectif_co2_mensuel_transport_usage)
          setTransport(String(u.objectif_co2_mensuel_transport_usage));
        if (u.objectif_co2_mensuel_logement_usage)
          setLogement(String(u.objectif_co2_mensuel_logement_usage));
      }

      const resMoy = await getMoyennesFr();
      if (resMoy.status && resMoy.moyennesFr) {
        setMoyennes(resMoy.moyennesFr);
      }
    };

    fetchData();
  }, []);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(async () => {
      try {
        await updateUser({
          objectif_co2_mensuel_aliment_creation: parseFloat(aliment),
          objectif_co2_mensuel_transport_usage: parseFloat(transport),
          objectif_co2_mensuel_logement_usage: parseFloat(logement),
        });
      } catch (error) {
        throw error;
      }
    }, 1000); // 500 ms après la dernière modification

    return () => clearTimeout(timeout);
  }, [aliment, transport, logement, user]);

  const renderBloc = (
    title: string,
    value: string,
    setValue: (v: string) => void,
    color: string,
    moyenneValue: number
  ) => {
    const numericVal = parseFloat(value);

    return (
      <View style={[styles.section, { backgroundColor: `${color}33` }]}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="create-outline" size={20} color={color} />
          <TextInput
            style={[styles.input, { borderColor: color }]}
            keyboardType="numeric"
            placeholder="0"
            value={value}
            onChangeText={setValue}
          />
          <Text style={styles.unit}>kgCO₂/mois</Text>
        </View>

        <Text style={styles.eqTitle}>Équivalence</Text>
        <View>
          <EqCO2 value={numericVal} />
        </View>
        
        <Text style={styles.subText}>
          {"Valeur de référence française"} : {moyenneValue} kgCO₂/mois
        </Text>
        <Text style={styles.subText}>
          ≈ {(numericVal / 30).toFixed(1)} kgCO₂/jour | {(numericVal * 12).toFixed(0)} kgCO₂/an
        </Text>
      </View>
    );
  };

  if (!moyennes) return <Text>Chargement...</Text>;

  const moyenneAliment = moyennes[2].moyenne_value * 30;
  const moyenneTransport = moyennes[1].moyenne_value * 30;
  const moyenneLogement = moyennes[0].moyenne_value * 30;

  return (
    <View contentContainerStyle={styles.container}>
      {renderBloc(
        "Votre objectif mensuel - Alimentation",
        aliment,
        setAliment,
        tabColors['aliment'],
        moyenneAliment
      )}
      {renderBloc(
        "Votre objectif mensuel - Transport",
        transport,
        setTransport,
        tabColors["transport"],
        moyenneTransport
      )}
      {renderBloc(
        "Votre objectif mensuel - Logement",
        logement,
        setLogement,
        tabColors["logement"],
        moyenneLogement
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  section: {
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    marginLeft: 6,
  },
  unit: {
    fontSize: 14,
    color: "#555",
  },
  subText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  eqTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 6,
  },
  eqContainer: {
    height: 50,
    marginBottom: 8,  
  },
});
