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

import { tabColors } from '@/constants/Colors';
import React, { useMemo, useState } from 'react';
import { Text as RNText, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text } from 'react-native-svg';

export type Iteration = {
  co2: number;
  date: string;
  type_action?: 'usage' | 'creation';
  [key: string]: any;
};

type Props = { objectif: number; moyenneFrancaise: number; moyennePrecedente: number; categorie: string; iterations: Iteration[];
  onPressPoint?: (iteration: Iteration) => void;
};

// 🔧 utilitaire pour normaliser les dates
const formatDateKey = (d: Date) => d.toISOString().split("T")[0];
const formatForTooltip = (d: string) => {
  const dateObj = new Date(d);
  return `${dateObj.getDate().toString().padStart(2, "0")}/${(dateObj.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
};

export default function Graphe({
  objectif,
  moyenneFrancaise,
  moyennePrecedente,
  categorie,
  iterations,
  onPressPoint,
}: Props) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  const chartWidth = 380;
  const chartHeight = 200;
  const padding = 30;
  const rightPadding = 60;

  const safeNumber = (n: any) => (typeof n === 'number' && !isNaN(n) ? n : 0);

  // Préparer données : un point par type_action
  const data = useMemo(() => {
    const grouped: Record<string, { usage: number; creation: number }> = {};
    iterations.forEach((it) => {
      if (!grouped[it.date]) grouped[it.date] = { usage: 0, creation: 0 };
      if (it.type_action === 'creation') {
        grouped[it.date].creation += safeNumber(it.co2);
      } else {
        grouped[it.date].usage += safeNumber(it.co2);
      }
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .flatMap(([date, { usage, creation }]) => {
        const points: { date: string; co2: number; type_action: 'usage' | 'creation' }[] = [];
        if (usage > 0) points.push({ date, co2: usage, type_action: 'usage' });
        if (creation > 0) points.push({ date, co2: creation, type_action: 'creation' });
        return points;
      });
  }, [iterations]);

  // Vérifier si au moins un point "creation" existe
  const hasCreation = data.some((d) => d.type_action === "creation");

  const avgCurrent =
    data.reduce((sum, d) => sum + d.co2, 0) / Math.max(1, data.length);

  const maxVal = Math.max(
    ...data.map((d) => safeNumber(d.co2)),
    safeNumber(objectif),
    safeNumber(moyenneFrancaise),
    safeNumber(moyennePrecedente),
    1 // éviter division par 0
  );

  const getY = (value: number) =>
    chartHeight - padding - (value / maxVal) * (chartHeight - 2 * padding);

  const uniqueDates = [
    ...new Set(data.map((d) => d.date)),
  ];

  const getXByDate = (date: string) => {
    const idx = uniqueDates.indexOf(date);
    return uniqueDates.length === 1
      ? (chartWidth - rightPadding + padding) / 2
      : padding +
          (idx / (uniqueDates.length - 1)) *
            (chartWidth - padding - rightPadding);
  };

  // Couleurs dynamiques selon la catégorie
  let colorDataBelow, colorMoyFr, colorMoy;
  switch (categorie) {
    case 'logement':
      colorDataBelow = tabColors['logement'];
      colorMoyFr = tabColors['aliment'];
      colorMoy = tabColors['transport'];
      break;
    case 'transport':
      colorDataBelow = tabColors['transport'];
      colorMoyFr = tabColors['logement'];
      colorMoy = tabColors['aliment'];
      break;
    case 'aliment':
      colorDataBelow = tabColors['aliment'];
      colorMoyFr = tabColors['transport'];
      colorMoy = tabColors['logement'];
      break;
    default:
      colorDataBelow = '#888';
      colorMoyFr = '#888';
      colorMoy = '#888';
  }

  // Autres couleurs fixes
  const colorObjectif = tabColors['logo'];
  const colorMoyPrec = tabColors['general'];
  const colorDataUp = tabColors['rouge'];

  const darken = (color: string) =>
    color.startsWith('#') ? `${color}AA` : color;

  // Axe Y : ticks réguliers
  const getStep = (max: number) => {
    if (max <= 50) return 5;
    if (max <= 100) return 10;
    if (max <= 200) return 20;
    if (max <= 500) return 100;
    if (max <= 1000) return 200;
    if (max <= 2000) return 20;
    return 500;
  };
  const yStep = getStep(maxVal);
  const yTicks = [];
  for (let v = 0; v <= maxVal; v += yStep) {
    yTicks.push(v);
  }

  // Axe X : ticks réguliers
  const startDate = data.length > 0 ? new Date(data[0].date) : null;
  const endDate = data.length > 0 ? new Date(data[data.length - 1].date) : null;
  const dayStep =
    endDate && startDate
      ? ((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) <= 5
        ? 1
          : (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) <= 10
        ? 2
          : (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) <= 20
        ? 3
          : (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) <= 30
        ? 4
          : 5)
      : 1;

  const xTicks: Date[] = [];
  if (startDate && endDate) {
    let current = new Date(startDate);
    while (current <= endDate) {
      xTicks.push(new Date(current));
      current.setDate(current.getDate() + dayStep);
    }
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableWithoutFeedback onPress={() => setTooltip(null)}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Axes */}
          <Line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#ccc" />
          <Line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - rightPadding}
            y2={chartHeight - padding}
            stroke="#ccc"
          />

          {/* Graduation axe Y */}
          {yTicks.map((value, i) => {
            const y = getY(value);
            return (
              <Text
                key={i}
                x={padding - 6}
                y={y + 4}
                fontSize="10"
                fill="#333"
                textAnchor="end"
              >
                {value}
              </Text>
            );
          })}
          {/* Label Y au-dessus de l'axe, horizontal */}
          <Text
            x={padding}
            y={padding - 10}
            fontSize="12"
            fill="#333"
            textAnchor="start"
          >
            KgCO2eq
          </Text>

          {/* Graduation axe X */}
          {xTicks.map((tickDate, i) => {
            const dateKey = formatDateKey(tickDate);
            if (!uniqueDates.includes(dateKey)) return null;
            const x = getXByDate(dateKey);
            return (
              <Text
                key={i}
                x={x}
                y={chartHeight - padding + 15}
                fontSize="10"
                fill="#333"
                textAnchor="middle"
              >
                {tickDate.getDate()}
              </Text>
            );
          })}

          {/* Lignes de référence */}
          <Line
            x1={padding}
            y1={getY(safeNumber(objectif))}
            x2={chartWidth - rightPadding}
            y2={getY(safeNumber(objectif))}
            stroke={colorObjectif}
            strokeDasharray="4 4"
          />
          <Text x={chartWidth - rightPadding + 5} y={getY(safeNumber(objectif)) + 4} fontSize="10" fill={colorObjectif}>
            Objectif
          </Text>

          <Line
            x1={padding}
            y1={getY(safeNumber(moyenneFrancaise))}
            x2={chartWidth - rightPadding}
            y2={getY(safeNumber(moyenneFrancaise))}
            stroke={colorMoyFr}
            strokeDasharray="4 4"
          />
          <Text x={chartWidth - rightPadding + 5} y={getY(safeNumber(moyenneFrancaise)) + 4} fontSize="10" fill={colorMoyFr}>
            Moy. FR
          </Text>

          <Line
            x1={padding}
            y1={getY(safeNumber(moyennePrecedente))}
            x2={chartWidth - rightPadding}
            y2={getY(safeNumber(moyennePrecedente))}
            stroke={colorMoyPrec}
            strokeDasharray="4 4"
          />
          <Text x={chartWidth - rightPadding + 5} y={getY(safeNumber(moyennePrecedente)) + 4} fontSize="10" fill={colorMoyPrec}>
            Moy. Préc.
          </Text>

          <Line
            x1={padding}
            y1={getY(avgCurrent)}
            x2={chartWidth - rightPadding}
            y2={getY(avgCurrent)}
            stroke={colorMoy}
            strokeDasharray="4 4"
          />
          <Text x={chartWidth - rightPadding + 5} y={getY(avgCurrent) + 4} fontSize="10" fill={colorMoy}>
            Moyenne
          </Text>

          {/* Points variables */}
          {data.map((d, index) => {
            const x = getXByDate(d.date);
            const y = getY(d.co2);
            const isAbove = d.co2 > objectif;
            const baseColor = isAbove ? colorDataUp : colorDataBelow;
            const pointColor = d.type_action === 'creation' ? darken(baseColor) : baseColor;

            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r={4}
                fill={pointColor}
                onPress={() => {
                  setTooltip({
                    x,
                    y,
                    label: `CO2 ${d.type_action}\n${d.co2.toFixed(2)} (${d.date})`,
                  });
                  if (onPressPoint) onPressPoint({ co2: d.co2, date: d.date, type_action: d.type_action });
                }}
              />
            );
          })}

          {/* Tooltip */}
          {tooltip && (
            <>
              <Rect x={tooltip.x - 45} y={tooltip.y - 50} width={90} height={35} rx={6} ry={6} fill="rgba(0,0,0,0.7)" />
              <Text x={tooltip.x} y={tooltip.y - 30} fontSize="12" fill="#fff" textAnchor="middle">
                {tooltip.label}
              </Text>
            </>
          )}
        </Svg>
      </TouchableWithoutFeedback>

      {/* Légende */}
      <View style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 6 }}>
          {/* Usage */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <View style={{ flexDirection: 'row', marginRight: 6 }}>
              <View style={{ width: 12, height: 12, backgroundColor: colorDataUp, borderRadius: 6, marginRight: 4 }} />
              <View style={{ width: 12, height: 12, backgroundColor: colorDataBelow, borderRadius: 6 }} />
            </View>
            <RNText style={{ color: '#333' }}>Données usage</RNText>
          </View>

          {/* Creation (affiché seulement si présent) */}
          {hasCreation && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
              <View style={{ flexDirection: 'row', marginRight: 6 }}>
                <View style={{ width: 12, height: 12, backgroundColor: darken(colorDataUp), borderRadius: 6, marginRight: 4 }} />
                <View style={{ width: 12, height: 12, backgroundColor: darken(colorDataBelow), borderRadius: 6 }} />
              </View>
              <RNText style={{ color: '#333' }}>Données création</RNText>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <View style={{ width: 16, height: 2, backgroundColor: colorObjectif, marginRight: 6 }} />
            <RNText style={{ color: '#333' }}>Objectif</RNText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <View style={{ width: 16, height: 2, backgroundColor: colorMoy, marginRight: 6 }} />
            <RNText style={{ color: '#333' }}>Votre Moyenne</RNText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <View style={{ width: 16, height: 2, backgroundColor: colorMoyPrec, marginRight: 6 }} />
            <RNText style={{ color: '#333' }}>Moy. Préc.</RNText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 16, height: 2, backgroundColor: colorMoyFr, marginRight: 6 }} />
            <RNText style={{ color: '#333' }}>Moy. FR</RNText>
          </View>
        </View>
      </View>
    </View>
  );
}
