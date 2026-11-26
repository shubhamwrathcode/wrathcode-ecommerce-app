import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients, linear, useTheme } from '@/theme';
import { Icon } from './Icon';

interface Point {
  x: number;
  y: number;
}
type Fly = (from: Point, to?: Point) => void;

const Ctx = createContext<Fly>(() => undefined);
export const useFlyToCart = () => useContext(Ctx);

/** Add-to-cart "fly" micro-animation (section 9). */
export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [visible, setVisible] = useState(false);

  const fly = useCallback<Fly>(
    (from, to) => {
      const target = to ?? { x: width * 0.7, y: height - insets.bottom - 28 };
      x.setValue(from.x - 18);
      y.setValue(from.y - 18);
      scale.setValue(1);
      setVisible(true);
      Animated.parallel([
        Animated.timing(x, {
          toValue: target.x - 18,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: target.y - 18,
          duration: 650,
          easing: Easing.in(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false));
    },
    [height, insets.bottom, scale, width, x, y],
  );

  return (
    <Ctx.Provider value={fly}>
      {children}
      {visible ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ball,
            {
              backgroundColor: colors.accent,
              transform: [{ translateX: x }, { translateY: y }, { scale }],
            },
            linear(gradients.brand, 135),
          ]}
        >
          <Icon name="bag-handle" size={18} color="#FFFFFF" />
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
