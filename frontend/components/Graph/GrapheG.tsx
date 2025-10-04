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
import { Alert, Text as RNText, View } from 'react-native';
import Svg, { Circle, Line, Path, Text } from 'react-native-svg';

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? '1' : '0';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

interface GrapheGProps {
  data: { label: string; value: number; color: string }[];
}

export default function GrapheG({ data }: GrapheGProps) {
  const total = data?.reduce((sum, d) => sum + d.value, 0) || 0;

  const radius = 110;
  const centerX = 60;
  const centerY = 150;
  const strokeWidth = 60;

  const gapDegrees = 2;
  const totalGap = gapDegrees * (data?.length || 0);
  const totalAngleForArcs = 180 - totalGap;

  let angle = 0;

  if (!data || data.length === 0) return null;

  return (
    <View>
      <Svg width={350} height={300}>
        {data.map((item, index) => {
          // Si la valeur est 0, on saute l'affichage de l'arc et du pointeur
          if (item.value === 0) return null;

          const angleSpan = total > 0 ? (item.value / total) * totalAngleForArcs : 0;
          const startAngle = angle;
          const endAngle = angle + angleSpan;
          const midAngle = startAngle + angleSpan / 2;

          const pointerStart = polarToCartesian(centerX, centerY, radius + 25, midAngle);
          const pointerEndX = centerX + radius + 80;
          const pointerEnd = { x: pointerEndX, y: pointerStart.y };

          angle = endAngle + gapDegrees;

          return (
            <React.Fragment key={index}>
              <Path
                d={describeArc(centerX, centerY, radius, startAngle, endAngle)}
                stroke={item.color || '#000'}
                strokeWidth={strokeWidth}
                fill="none"
                onPress={() => Alert.alert(`Catégorie : ${item.label}`)}
              />
              <Line
                x1={pointerStart.x}
                y1={pointerStart.y}
                x2={pointerEnd.x}
                y2={pointerEnd.y}
                stroke={item.color || '#000'}
                strokeWidth={3}
              />
              <Circle
                cx={pointerEnd.x}
                cy={pointerEnd.y}
                r={5}
                fill={item.color || '#000'}
              />
              <Text
                x={pointerEnd.x + 12}
                y={pointerEnd.y + 6}
                fontSize={16}
                fill="#333"
              >
                {String(item.value)}
              </Text>
            </React.Fragment>
          );
        })}
        <Text
          x={centerX}
          y={centerY + 5}
          textAnchor="middle"
          fontSize="28"
          fill="#333"
          fontWeight="bold"
        >
          {total.toFixed(2)}
        </Text>
        <Text
          x={centerX}
          y={centerY + 35}
          textAnchor="middle"
          fontSize="14"
          fill="#666"
        >
          KgCO2eq
        </Text>
      </Svg>

      <View
        style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 20, justifyContent: 'center' }}
      >
        {data.map((item, index) => (
          <View
            key={index}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                backgroundColor: item.color || '#000',
                marginRight: 6,
                borderRadius: 3,
              }}
            />
            <RNText style={{ fontSize: 16, color: '#333' }}>
              {item.label}
            </RNText>
          </View>
        ))}
      </View>
    </View>
  );
}
