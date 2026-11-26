import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { fontSize, HIT, radius, spacing, typography, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  leftIcon?: string;
  right?: React.ReactNode;
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TextField = forwardRef<
  React.ComponentRef<typeof TextInput>,
  TextFieldProps
>(function TextFieldInner(
  {
    label,
    error,
    hint,
    prefix,
    leftIcon,
    right,
    secure,
    containerStyle,
    style,
    editable = true,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error
    ? colors.danger
    : focused
    ? colors.primary
    : colors.border;
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.box,
          {
            borderColor,
            backgroundColor: editable ? colors.surface : colors.surfaceAlt,
          },
        ]}
      >
        {leftIcon ? (
          <Icon name={leftIcon} size={18} color={colors.textMuted} />
        ) : null}
        {prefix ? (
          <AppText color="textSecondary" style={styles.prefix}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          secureTextEntry={secure ? hidden : false}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          accessibilityLabel={label}
          style={[styles.input, { color: colors.text }, style]}
          {...rest}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden(h => !h)}
            hitSlop={10}
            accessibilityLabel="Toggle password visibility"
          >
            <Icon
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
        {right}
      </View>
      {error ? (
        <AppText variant="caption" color="danger" style={styles.helper}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textMuted" style={styles.helper}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs },
  box: {
    minHeight: HIT + 4,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  prefix: { paddingRight: spacing.xs },
  input: {
    fontFamily: typography.body.fontFamily,
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },
  helper: { marginTop: spacing.xs },
});
