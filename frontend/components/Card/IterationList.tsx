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

import React from 'react';
import { ScrollView, Text } from 'react-native';
import IterationCard from './IterationCard';

type Props = {
  iterations: any[];
  categorie?: string;
  onPressIteration?: (iter: any) => void;
};

export default function IterationList({ iterations, categorie, onPressIteration }: Props) {
  if (!iterations || iterations.length === 0) return <Text>Aucune itération trouvée</Text>;

  return (
    <ScrollView>
      {iterations.map((iteration, idx) => (
        <IterationCard
          key={idx}
          iteration={iteration}
          categorie={categorie}
          onPress={() => onPressIteration && onPressIteration(iteration)}
        />
      ))}
    </ScrollView>
  );
}
