import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Mask, Rect } from "react-native-svg";

interface TutoOverlayProps {
  highlightPos: { x: number; y: number; width: number; height: number };
  message: string;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  currentStep: number;
}

export default function TutoOverlay({
  highlightPos,
  message,
  onNext,
  onPrevious,
  onSkip,
  currentStep,
}: TutoOverlayProps) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const { x, y, width, height } = highlightPos;

  // Position dynamique du bloc message + boutons
  const isHighlightOnTop = y < screenHeight / 2.5;
  const contentStyle = isHighlightOnTop
    ? { top: y + height + 20 } // en dessous du highlight
    : { bottom: screenHeight - y + 20 }; // au-dessus du highlight

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Overlay avec trou */}
      <Svg height={screenHeight} width={screenWidth} style={StyleSheet.absoluteFill}>
        <Mask id="mask">
          <Rect width="100%" height="100%" fill="white" />
          <Rect x={x} y={y} width={width} height={height} rx={8} ry={8} fill="black" />
        </Mask>
        <Rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#mask)" />
      </Svg>

      {/* Bloc message + boutons */}
      <View style={[styles.contentContainer, contentStyle]}>
        <Text style={styles.messageText}>{message}</Text>

        <View style={styles.buttonsRow}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.prevButton} onPress={onPrevious}>
              <Text style={styles.prevButtonText}>Précédent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Passer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  contentContainer: {
    position: "absolute",
    left: 40,
    right: 40,
    minHeight: 100,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 12,
    color: "#000",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skipButton: {
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  prevButton: {
    backgroundColor: "#aaa",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  prevButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  skipButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
