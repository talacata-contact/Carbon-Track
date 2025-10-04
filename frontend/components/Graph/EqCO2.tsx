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
import { Dimensions, View } from 'react-native';
import { WebView } from 'react-native-webview';

type EqCO2Props = {
  value: number;
};

export default function EqCO2({ value }: EqCO2Props) {
  const width = Dimensions.get('window').width + 20;
  const height = 50;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { margin: 0; padding: 0; background-color: transparent; }
      </style>
    </head>
    <body>
      <script name="impact-co2" src="https://impactco2.fr/iframe.js"
        data-type="comparateur/etiquette"
        data-search="?value=${Math.round(value)}&comparisons=pompeachaleur,voitureelectrique,repasvegetarien&language=fr&theme=default">
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ width, height }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        style={{ width, height, backgroundColor: 'transparent' }}
      />
    </View>
  );
}
