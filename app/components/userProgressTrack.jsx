import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

/**
 * @component UserProgressTrack
 * @description Progress tracking component that displays a step-by-step progress indicator
 * for user onboarding or multi-step processes.
 * 
 * Features:
 * - Visual step progress tracking
 * - Interactive step navigation
 * - RTL (Right-to-Left) layout support
 * - Progress line visualization
 * - Current and completed step indicators
 * 
 * Steps:
 * 1. User Settings
 * 2. Looking For
 * 3. Profile Picture
 * 
 * @param {Object} props
 * @param {string} props.currentStep - Key of the current active step
 * @param {Array<string>} props.completedSteps - Array of completed step keys
 * @param {Function} props.onStepPress - Callback function when a step is pressed
 */

/**
 * Configuration constants
 * @constant
 */
const CIRCLE_SIZE = 50;
const LINE_COLOR = "#2F74FF";
const BG_COLOR = "#F0F0F0";

/**
 * Step definitions
 * @constant
 * @type {Array<Object>}
 */
const steps = [
  { key: "userSettings", label: "הגדרות משתמש" },
  { key: "lookingFor", label: "מה אני מחפש?" },
  { key: "profilePicture", label: "תמונת פרופיל" },
];

/**
 * Styles for the progress tracker
 * @constant
 * @type {Object}
 */
const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    backgroundColor: BG_COLOR,
  },
  stepsRow: {
    flexDirection: "row-reverse", // RTL layout
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  circleWrapper: {
    alignItems: "center",
    width: CIRCLE_SIZE + 10,
    zIndex: 2,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  completedCircle: {
    backgroundColor: LINE_COLOR,
  },
  currentCircle: {
    borderWidth: 3,
    borderColor: LINE_COLOR,
  },
  circleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  label: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    color: "#333",
    maxWidth: 70,
  },
  lineWrapper: {
    position: "absolute",
    top: CIRCLE_SIZE / 2 - 2, // center line vertically
    right: CIRCLE_SIZE / 2, // start from center of first (rightmost) circle
    left: CIRCLE_SIZE / 2, // end at center of last (leftmost) circle
    height: 4,
    zIndex: 1,
  },
  baseLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
  },
  progressLine: {
    position: "absolute",
    right: 0,
    height: 4,
    backgroundColor: LINE_COLOR,
    borderRadius: 2,
  },
  currentCircleText: {
    fontWeight: 'bold',
    color: LINE_COLOR,
  },
});

export default function UserProgressTrack({
  currentStep,
  completedSteps,
  onStepPress,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {/* Line behind the circles */}
        <View style={styles.lineWrapper}>
          <View style={styles.baseLine} />
          <View
            style={[
              styles.progressLine,
              {
                width: `${(completedSteps.length / (steps.length - 1)) * 100}%`,
              },
            ]}
          />
        </View>

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = currentStep === step.key;

          return (
            <TouchableOpacity
              key={step.key}
              style={styles.circleWrapper}
              onPress={() => onStepPress(step.key)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.completedCircle,
                  isCurrent && styles.currentCircle,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    isCurrent && styles.currentCircleText,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.label, isCurrent && styles.currentCircleText]}>{step.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
