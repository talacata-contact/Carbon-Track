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
import { getSuggestionsByCategorie } from "@/services/dataService/suggestions";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Text,
  View,
} from "react-native";
import Swiper from "react-native-swiper";

type Suggestion = {
  id: number;
  categorie: string;
  suggestion: string;
  explication?: string;
  sources: string[];
};

type SuggestionsProps = {
  categorie: string;
  events: any;
  onVisibleChange?: (visible: boolean) => void;
};

const { width } = Dimensions.get("window");

const Suggestions: React.FC<SuggestionsProps> = ({ categorie, events, onVisibleChange }) => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      const response_suggestions = await getSuggestionsByCategorie(
        categorie,
        events
      );

      if (!response_suggestions.status) {
        setError(response_suggestions.message);
        setSuggestions([]);
      } else {
        setSuggestions(response_suggestions.suggestions);
        setError(null);
      }
      setLoading(false);
    };

    fetchSuggestions();
  }, [categorie, events]);

  useEffect(() => {
    if (onVisibleChange) {
      onVisibleChange(!loading && !error && suggestions.length > 0);
    }
  }, [loading, error, suggestions, onVisibleChange]);

  if (loading) {
    return (
      <View style={{ alignItems: "center", justifyContent: "center", padding: 12 }}>
        <ActivityIndicator size="large" color={tabColors[categorie]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ color: "red" }}>❌ {error}</Text>
      </View>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <View style={{ minHeight: 100, maxHeight: 300, marginVertical: 10 }}>
      <Swiper
        autoplay
        autoplayTimeout={5}
        showsPagination
        activeDotColor={tabColors[categorie]}
        paginationStyle={{
          bottom: 0,
          right: -250,
        }}
        containerStyle={{
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {suggestions.map((item) => (
          <View
            key={item.id}
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              width: width * 0.9,
              alignSelf: "center"
            }}
          >
            {/* Ligne icône + suggestion */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome5
                name="lightbulb"
                size={20}
                color={tabColors[item.categorie] || "gray"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{ fontSize: 15, fontWeight: "600", maxWidth: width * 0.8 }}
              >
                {item.suggestion}
              </Text>
            </View>

            {/* Source alignée à droite */}
            {item.sources && item.sources.length > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#3b82f6",
                  textDecorationLine: "underline",
                  textAlign: "right",
                  marginTop: 6,
                }}
                onPress={() => Linking.openURL(item.sources[0])}
              >
                {item.sources[0]}
              </Text>
            )}
          </View>
        ))}
      </Swiper>
    </View>
  );
};

export default Suggestions;
