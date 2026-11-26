import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeightRatio?: number;
  headerRight?: React.ReactNode;
}

const H = Dimensions.get('window').height;

/** Lightweight animated bottom sheet used for Sort, Filter, pickers. */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  maxHeightRatio = 0.85,
  headerRight,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translate = useRef(new Animated.Value(H)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translate, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 2,
          speed: 14,
        }),
      ]).start();
    } else {
      translate.setValue(H);
      fade.setValue(0);
    }
  }, [visible, fade, translate]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: colors.overlay, opacity: fade },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close"
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            maxHeight: H * maxHeightRatio,
            paddingBottom: insets.bottom,
            transform: [{ translateY: translate }],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        {title ? (
          <View style={[styles.head, { borderBottomColor: colors.border }]}>
            <AppText variant="h2" style={styles.title}>
              {title}
            </AppText>
            {headerRight}
            <IconButton
              name="close"
              accessibilityLabel="Close"
              onPress={onClose}
            />
          </View>
        ) : null}
        <View style={styles.body}>{children}</View>
        {footer ? (
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            {footer}
          </View>
        ) : null}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { flex: 1 },
  body: { flexShrink: 1 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
  },
});
