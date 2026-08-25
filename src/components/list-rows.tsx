import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Badge } from '@/components/ui';
import { colors } from '@/theme/colors';

const moneyFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return '-';
  return moneyFormatter.format(value);
}

type CustomerRowProps = {
  id: string;
  noLabel: string;
  name: string;
  meta: string;
  onPress: (id: string) => void;
};

export const CustomerRow = memo(function CustomerRow({
  id,
  noLabel,
  name,
  meta,
  onPress,
}: CustomerRowProps) {
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.row}>
        <View style={styles.indexPill}>
          <Text variant="labelLarge" style={styles.indexText}>
            {noLabel.replace('#', '')}
          </Text>
        </View>
        <View style={styles.body}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text variant="bodySmall" style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
});

type UnitRowProps = {
  customerId: string;
  type: string;
  noLabel: string;
  name: string;
  meta: string;
  recorded: boolean;
  onPress: (customerId: string, type: string) => void;
};

export const UnitListRow = memo(function UnitListRow({
  customerId,
  type,
  noLabel,
  name,
  meta,
  recorded,
  onPress,
}: UnitRowProps) {
  const handlePress = useCallback(
    () => onPress(customerId, type),
    [customerId, onPress, type]
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        recorded && styles.cardDone,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.indexPill, recorded && styles.indexPillDone]}>
          <Text
            variant="labelLarge"
            style={[styles.indexText, recorded && styles.indexTextDone]}
          >
            {noLabel.replace('#', '')}
          </Text>
        </View>
        <View style={styles.body}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text variant="bodySmall" style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        </View>
        <View style={styles.end}>
          <Badge
            label={recorded ? 'จดแล้ว' : 'ยังไม่จด'}
            tone={recorded ? 'success' : 'warning'}
          />
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
});

type TransactionRowProps = {
  customerId: string;
  type: string;
  noLabel: string;
  name: string;
  meta: string;
  paid: boolean;
  onPress: (customerId: string, type: string) => void;
};

export const TransactionListRow = memo(function TransactionListRow({
  customerId,
  type,
  noLabel,
  name,
  meta,
  paid,
  onPress,
}: TransactionRowProps) {
  const handlePress = useCallback(
    () => onPress(customerId, type),
    [customerId, onPress, type]
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        paid && styles.cardDone,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.indexPill, paid && styles.indexPillDone]}>
          <Text
            variant="labelLarge"
            style={[styles.indexText, paid && styles.indexTextDone]}
          >
            {noLabel.replace('#', '')}
          </Text>
        </View>
        <View style={styles.body}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text variant="bodySmall" style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        </View>
        <View style={styles.end}>
          <Badge
            label={paid ? 'ชำระแล้ว' : 'รอชำระ'}
            tone={paid ? 'success' : 'warning'}
          />
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
});

type ZoneRowProps = {
  id: number;
  zoneName: string;
  selected: boolean;
  onPress: (id: number) => void;
};

export const ZoneRow = memo(function ZoneRow({
  id,
  zoneName,
  selected,
  onPress,
}: ZoneRowProps) {
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.zoneIcon, selected && styles.zoneIconSelected]}>
          <Ionicons
            name="map"
            size={18}
            color={selected ? colors.primary : colors.textMuted}
          />
        </View>
        <View style={styles.body}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
            {zoneName}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {selected ? 'กำลังใช้งานอยู่' : 'แตะเพื่อเลือกโซนนี้'}
          </Text>
        </View>
        {selected ? (
          <Badge label="เลือกอยู่" tone="success" />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardDone: {
    backgroundColor: '#F3FAF6',
  },
  cardSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: '#B7D9C8',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  end: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  indexPill: {
    minWidth: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 8,
  },
  indexPillDone: {
    backgroundColor: colors.successMuted,
  },
  indexText: {
    fontWeight: '800',
    color: colors.primary,
  },
  indexTextDone: {
    color: colors.success,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    marginTop: 2,
    color: colors.textMuted,
  },
  zoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  zoneIconSelected: {
    backgroundColor: colors.surface,
  },
});
