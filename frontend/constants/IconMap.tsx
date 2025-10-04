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

import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';

// --- Transport ---
export const transportIcons: Record<number, React.FC<{ size?: number; color?: string }>> = {
  1: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="car-side" size={size} color={color} />,        // Voiture
  2: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="bus-alt" size={size} color={color} />,        // Bus
  3: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="bicycle" size={size} color={color} />,        // Vélo
  4: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="plane" size={size} color={color} />,          // Avion
  5: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="train" size={size} color={color} />,          // Train (TGV)
  6: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="subway" size={size} color={color} />,         // Métro
  8: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="motorcycle" size={size} color={color} />,     // Moto
  9: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="helicopter" size={size} color={color} />,     // Hélicoptère
  10: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="taxi" size={size} color={color} />,          // Taxi
  11: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="ship" size={size} color={color} />,          // Bateau
};

// --- Aliment ---
export const alimentIcons: Record<number, React.FC<{ size?: number; color?: string }>> = {
  1: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="apple-alt" size={size} color={color} />,       // Fruits
  2: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="carrot" size={size} color={color} />,         // Légumes
  3: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="bread-slice" size={size} color={color} />,    // Pain / Boulangerie
  4: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="cheese" size={size} color={color} />,         // Fromage
  5: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="pizza-slice" size={size} color={color} />,    // Pizza
  8: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="coffee" size={size} color={color} />,         // Café
  13: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="drumstick-bite" size={size} color={color} />, // Viande (poulet)
  14: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="fish" size={size} color={color} />,         // Poisson
  15: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="egg" size={size} color={color} />,          // Œuf
  16: ({ size = 20, color = '#fff' }) => <FontAwesome5 name="candy-cane" size={size} color={color} />,   // Bonbons / sucreries
};
