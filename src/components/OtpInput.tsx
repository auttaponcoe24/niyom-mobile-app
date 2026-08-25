import { useEffect, useRef } from 'react';
import {
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputKeyPressEventData,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '@/theme/colors';

const LENGTH = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

export function OtpInput({ value, onChange, autoFocus = true }: Props) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.replace(/\D/g, '').slice(0, LENGTH).split('');

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const focusInput = () => inputRef.current?.focus();

  const onChangeText = (text: string) => {
    onChange(text.replace(/\D/g, '').slice(0, LENGTH));
  };

  const onKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (event.nativeEvent.key === 'Backspace' && value.length === 0) {
      onChange('');
    }
  };

  return (
    <Pressable onPress={focusInput} style={styles.wrap}>
      <View style={styles.row}>
        {Array.from({ length: LENGTH }, (_, index) => {
          const digit = digits[index] ?? '';
          const isActive = index === digits.length && digits.length < LENGTH;
          const isFilled = digit.length > 0;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                isFilled && styles.cellFilled,
                isActive && styles.cellActive,
              ]}
            >
              <Text variant="titleLarge" style={styles.digit}>
                {digit}
              </Text>
              {isActive ? <View style={styles.caret} /> : null}
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={onKeyPress}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={LENGTH}
        caretHidden
        style={styles.hiddenInput}
        accessibilityLabel="รหัส OTP 6 หลัก"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cell: {
    flex: 1,
    aspectRatio: 0.85,
    maxHeight: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  cellActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  digit: {
    fontWeight: '700',
    color: colors.text,
  },
  caret: {
    position: 'absolute',
    bottom: 10,
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    color: 'transparent',
  },
});
