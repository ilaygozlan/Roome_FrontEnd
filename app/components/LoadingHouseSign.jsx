import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Path, Defs, Mask, Rect } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export default function HouseLoading() {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopAnimation = () => {
      Animated.sequence([
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 0, // ← reset מיידי
          useNativeDriver: false,
        }),
      ]).start(() => {
        loopAnimation(); // ריקורסיה להמשך הלולאה
      });
    };

    loopAnimation(); // הפעלה ראשונה
  }, []);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0], // ממלא מלמטה למעלה
  });

  return (
    <View style={styles.loadingContainer}>
      <Svg width={60} height={60} viewBox="0 0 512 512">
        <Defs>
          <Mask id="mask">
            <Path
              fill="white"
              d="M256 0L0 192h64v320h128V320h128v192h128V192h64z"
            />
          </Mask>
        </Defs>

        {/* רקע אפור של הבית */}
        <Path
          fill="#ccc"
          d="M256 0L0 192h64v320h128V320h128v192h128V192h64z"
        />

        {/* שכבת המילוי הכתומה שמתמלאת */}
        <AnimatedRect
          x="0"
          y={fillHeight}
          width="512"
          height="512"
          fill="#E3965A"
          mask="url(#mask)"
        />
      </Svg>

      <Text style={{ marginTop: 20, fontSize: 16 }}>מעלה את הדירה והתמונות...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
