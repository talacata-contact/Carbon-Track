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

// components/Picker/FilterPicker.js
import { tabColors } from "@/constants/Colors";
import { Picker } from '@react-native-picker/picker';
import React from "react";
import { StyleSheet, View } from "react-native";

export default function FilterPicker({ options, selectedValue, onValueChange }) {
    return (
        <View style={{ marginVertical: 10 }}>
            <View style={styles.pickerBox}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={onValueChange}
                    style={styles.picker}
                    dropdownIconColor="white"
                >
                    {options.map((opt) => (
                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                    ))}
                </Picker>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pickerBox: {
        backgroundColor: tabColors.general,
        borderRadius: 10,
        height: 30,
        paddingHorizontal: 6,
        justifyContent: "center",
        paddingVertical: 0,
        alignSelf: "flex-end",
        overflow: "hidden",
    },
    picker: {
        width: 160,
        height: 50,
        color: "white",
    }
});