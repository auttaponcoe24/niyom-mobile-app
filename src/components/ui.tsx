import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import {
  Button,
  Checkbox,
  Chip,
  HelperText,
  Card as PaperCard,
  Text,
  TextInput,
  type TextInputProps,
} from 'react-native-paper';

import { colors } from '@/theme/colors';

export function Card({
  children,
  style,
  onPress,
  selected,
}: {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  selected?: boolean;
}) {
  return (
    <PaperCard
      mode="elevated"
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected, style]}
    >
      <PaperCard.Content style={styles.cardContent}>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text variant="labelLarge" style={styles.label}>
      {children}
    </Text>
  );
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      mode="outlined"
      dense={false}
      {...props}
      style={[styles.field, props.style]}
    />
  );
}

export function SearchField(props: TextInputProps) {
  return (
    <TextInput
      mode="outlined"
      dense
      left={<TextInput.Icon icon="magnify" />}
      returnKeyType="search"
      {...props}
      style={[styles.search, props.style]}
    />
  );
}

export function ContextChip({ label }: { label: string }) {
  return (
    <Chip
      compact
      icon="map-marker"
      style={styles.contextChip}
      textStyle={styles.contextChipText}
    >
      {label}
    </Chip>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      disabled={disabled}
      contentStyle={styles.buttonContent}
      style={styles.button}
      labelStyle={styles.buttonLabel}
    >
      {label}
    </Button>
  );
}

export function SecondaryButton({
  label,
  onPress,
  tone = 'neutral',
}: {
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <Button
      mode="outlined"
      onPress={onPress}
      textColor={tone === 'danger' ? colors.danger : colors.text}
      style={[
        styles.secondaryButton,
        tone === 'danger' && styles.secondaryDanger,
      ]}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
    >
      {label}
    </Button>
  );
}

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning';
}) {
  return (
    <Chip
      compact
      style={[
        styles.badge,
        tone === 'success' && styles.badgeSuccess,
        tone === 'warning' && styles.badgeWarning,
      ]}
      textStyle={[
        styles.badgeText,
        tone === 'success' && styles.badgeTextSuccess,
        tone === 'warning' && styles.badgeTextWarning,
      ]}
    >
      {label}
    </Chip>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>∅</Text>
      </View>
      <HelperText type="info" style={styles.emptyText}>
        {message}
      </HelperText>
    </View>
  );
}

export function InfoPanel({ children }: { children: ReactNode }) {
  return (
    <PaperCard mode="elevated" style={styles.infoPanel}>
      <PaperCard.Content style={styles.infoContent}>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
}

export function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.checkRow}>
      <Checkbox.Android
        status={checked ? 'checked' : 'unchecked'}
        onPress={onToggle}
        color={colors.primary}
      />
      <Text variant="bodyLarge" style={styles.checkLabel} onPress={onToggle}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    backgroundColor: colors.primaryMuted,
  },
  cardContent: {
    gap: 2,
  },
  label: {
    color: colors.textMuted,
    marginBottom: 8,
  },
  field: {
    marginBottom: 14,
    backgroundColor: colors.surface,
  },
  search: {
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  contextChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    marginBottom: 12,
    backgroundColor: colors.primaryMuted,
  },
  contextChipText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  button: {
    borderRadius: 16,
  },
  secondaryButton: {
    borderRadius: 16,
    borderColor: colors.border,
  },
  secondaryDanger: {
    borderColor: '#F3B0A8',
    backgroundColor: colors.dangerMuted,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.primaryMuted,
  },
  badgeSuccess: {
    backgroundColor: colors.successMuted,
  },
  badgeWarning: {
    backgroundColor: colors.warningMuted,
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeTextWarning: {
    color: colors.warning,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIconText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  infoPanel: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  infoContent: {
    gap: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  checkLabel: {
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
});
