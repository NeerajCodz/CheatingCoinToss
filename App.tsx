import { Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

type Result = 'heads' | 'tails' | null;

const TILT_THRESHOLD = 5; // Magnetometer X threshold (± 5)
const FLIP_DURATION_MS = 1800; // 1.8s for complete animation

export default function App() {
  const [result, setResult] = useState<Result>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [cheatEnabled, setCheatEnabled] = useState(true);
  const [showText, setShowText] = useState(false);

  // Keep latest magnetometer X value
  const latestMagnetometerXRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);

  // Animation shared values for 3D coin flip
  const rotateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Text animation values
  const textScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener((data) => {
      // Use X-axis for left/right tilt detection
      latestMagnetometerXRef.current = data.x;
      console.log('Magnetometer X:', data.x.toFixed(2), 'Y:', data.y.toFixed(2), 'Z:', data.z.toFixed(2));
    });
    return () => {
      sub.remove();
    };
  }, []);

  const coinStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { translateY: translateY.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateZ: `${rotateZ.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  }, []);

  // Determine coin face to show based on result
  const CoinFace = ({ side }: { side: 'heads' | 'tails' }) => {
    const isHeads = side === 'heads';
    return (
      <View style={styles.coinContainer}>
        <View style={[styles.coin, isHeads ? styles.headsOuter : styles.tailsOuter]}>
          <View style={[styles.coinInner, isHeads ? styles.headsInner : styles.tailsInner]}>
            {isHeads ? (
              <View style={styles.headsCenter} />
            ) : (
              <View style={styles.tailsCenter}>
                <View style={styles.tailsCross1} />
                <View style={styles.tailsCross2} />
              </View>
            )}
          </View>
        </View>
        {/* Shadow effect */}
        <View style={styles.coinShadow} />
      </View>
    );
  };

  const handleBackgroundPress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      setCheatEnabled((prev) => !prev);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const decideOutcome = (magnetometerX: number): Result => {
    console.log('Deciding outcome - Magnetometer X:', magnetometerX.toFixed(2), 'Threshold:', TILT_THRESHOLD, 'Cheat enabled:', cheatEnabled);
    
    if (!cheatEnabled) {
      console.log('Cheat mode OFF - Random result');
      return Math.random() < 0.5 ? 'heads' : 'tails';
    }
    
    // Left tilt (negative X, -5 to -25) -> Heads
    if (magnetometerX < -TILT_THRESHOLD) {
      console.log('Left tilt detected (X < -5) - HEADS');
      return 'heads';
    }
    // Right tilt (positive X, 5 to 25) -> Tails
    if (magnetometerX > TILT_THRESHOLD) {
      console.log('Right tilt detected (X > 5) - TAILS');
      return 'tails';
    }
    console.log('Flat position (X between -5 and 5) - Random result');
    return Math.random() < 0.5 ? 'heads' : 'tails';
  };

  const triggerHaptics = (magnetometerX: number, cheat: boolean) => {
    if (!cheat) return; // Stealth mode disables all haptics
    if (magnetometerX < -TILT_THRESHOLD) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (magnetometerX > TILT_THRESHOLD) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const onFlipPress = async () => {
    if (isFlipping) return;

    const magnetometerX = latestMagnetometerXRef.current || 0;
    triggerHaptics(magnetometerX, cheatEnabled);

    const outcome = decideOutcome(magnetometerX);

    // Start hero-style 3D coin flip animation
    setIsFlipping(true);
    
    // Initial state
    rotateX.value = 0;
    rotateZ.value = 0;
    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;

    // Calculate final rotation based on outcome
    // Heads = even number of flips (0, 360, 720...), Tails = odd (180, 540, 900...)
    const spins = 4; // 4 full rotations
    const finalRotation = outcome === 'heads' ? spins * 360 : (spins * 360) + 180;

    // Animate coin toss with multiple stages
    // Stage 1: Toss up
    translateY.value = withTiming(-150, { duration: 400, easing: Easing.out(Easing.quad) });
    scale.value = withSequence(
      withTiming(1.15, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 200 })
    );
    
    // Stage 2: Spin while airborne
    setTimeout(() => {
      rotateX.value = withTiming(finalRotation, {
        duration: FLIP_DURATION_MS - 400,
        easing: Easing.out(Easing.cubic),
      });
      rotateZ.value = withTiming(360 * 2, {
        duration: FLIP_DURATION_MS - 400,
        easing: Easing.inOut(Easing.quad),
      });
    }, 100);

    // Stage 3: Fall down
    setTimeout(() => {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    }, 600);

    // Reveal result after animation
    await new Promise((r) => setTimeout(r, FLIP_DURATION_MS));
    setResult(outcome);
    
    // Final bounce effect
    scale.value = withSequence(
      withTiming(1.1, { duration: 150, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    
    // Show text animation
    setShowText(true);
    textScale.value = 0;
    textOpacity.value = 0;
    
    // Zoom in and fade in
    textScale.value = withSequence(
      withTiming(1.3, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 150 })
    );
    textOpacity.value = withTiming(1, { duration: 200 });
    
    // Fade out after 1.5 seconds
    setTimeout(() => {
      textOpacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => setShowText(false), 500);
    }, 1500);
    
    setIsFlipping(false);
  };

  const textStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: textScale.value }],
      opacity: textOpacity.value,
    };
  });

  return (
    <Pressable style={styles.container} onPress={handleBackgroundPress}>
      <Animated.View style={coinStyle}>
        <CoinFace side={result === 'tails' ? 'tails' : 'heads'} />
      </Animated.View>

      {showText && result && (
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={[
            styles.resultText,
            result === 'tails' && styles.tailsText
          ]}>
            {result === 'heads' ? 'HEADS!' : 'TAILS!'}
          </Text>
        </Animated.View>
      )}

      <Pressable
        onPress={onFlipPress}
        style={styles.button}
        android_ripple={{ color: '#ddd' }}
      >
        <Text style={styles.buttonText}>Flip Coin</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  headsOuter: {
    backgroundColor: '#FFD700',
  },
  tailsOuter: {
    backgroundColor: '#C0C0C0',
  },
  coinInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  headsInner: {
    backgroundColor: '#FFC700',
  },
  tailsInner: {
    backgroundColor: '#B0B0B0',
  },
  headsCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFB000',
    borderWidth: 4,
    borderColor: '#FF8C00',
  },
  tailsCenter: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tailsCross1: {
    position: 'absolute',
    width: 100,
    height: 8,
    backgroundColor: '#909090',
    borderRadius: 4,
  },
  tailsCross2: {
    position: 'absolute',
    width: 8,
    height: 100,
    backgroundColor: '#909090',
    borderRadius: 4,
  },
  coinShadow: {
    position: 'absolute',
    bottom: -20,
    width: 180,
    height: 30,
    borderRadius: 90,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: -1,
  },
  button: {
    marginTop: 60,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  textContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: '#FF6B00',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 4,
  },
  tailsText: {
    color: '#C0C0C0',
    textShadowColor: '#707070',
  },
});

