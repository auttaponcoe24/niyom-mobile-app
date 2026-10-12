import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';

import { ZoneRow } from '@/components/list-rows';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useWork } from '@/context/WorkContext';
import { useGetZones } from '@/hooks';
import { colors } from '@/theme/colors';
import type { UnitType, Zone } from '@/types/api';
import { formatThaiMonth, isCurrentMonth } from '@/utils/thai-date';

function zoneKeyExtractor(item: Zone) {
  return String(item.id);
}

export function HomeScreen() {
  const { user } = useAuth();
  const { zone, setZone, month, setMonth, unitType, setUnitType } = useWork();

  const zonesQuery = useGetZones({ limit: 100 });

  const zones = useMemo(
    () => zonesQuery.data?.data ?? [],
    [zonesQuery.data?.data]
  );

  const zonesById = useMemo(() => {
    const map = new Map<number, Zone>();
    for (const item of zones) map.set(item.id, item);
    return map;
  }, [zones]);

  // A remembered zone that no longer exists (deleted on the web) is dropped.
  useEffect(() => {
    if (zone && zonesQuery.isSuccess && !zonesById.has(zone.id)) setZone(null);
  }, [zone, zonesById, zonesQuery.isSuccess, setZone]);

  const shiftMonth = useCallback(
    (delta: number) => {
      setMonth(
        dayjs(month).add(delta, 'month').startOf('month').format('YYYY-MM-DD')
      );
    },
    [month, setMonth]
  );

  const onPrevMonth = useCallback(() => shiftMonth(-1), [shiftMonth]);
  const onNextMonth = useCallback(() => shiftMonth(1), [shiftMonth]);

  const onPressZone = useCallback(
    (id: number) => {
      const next = zonesById.get(id);
      if (next) setZone(next);
    },
    [setZone, zonesById]
  );

  const renderItem = useCallback(
    ({ item }: { item: Zone }) => (
      <ZoneRow
        id={item.id}
        zoneName={item.zoneName}
        selected={zone?.id === item.id}
        onPress={onPressZone}
      />
    ),
    [onPressZone, zone?.id]
  );

  const displayName =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
    user?.email ||
    'พนักงานสนาม';

  const listHeader = (
    <View>
      <LinearGradient
        colors={['#1F6B4A', '#134734']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>Niyom Field</Text>
        <Text style={styles.heroTitle}>สวัสดี, {displayName}</Text>
        <Text style={styles.heroSub}>
          เลือกเดือน ประเภท และโซน แล้วเริ่มงานสนามได้เลย
        </Text>
        {zone ? (
          <View style={styles.activePill}>
            <Ionicons name="checkmark-circle" size={16} color="#E8F8F0" />
            <Text style={styles.activePillText}>
              {zone.zoneName} · {unitType === 'W' ? 'น้ำ' : 'ไฟ'} ·{' '}
              {formatThaiMonth(month)}
            </Text>
          </View>
        ) : null}
      </LinearGradient>

      <View style={styles.panel}>
        <Text variant="labelLarge" style={styles.section}>
          เดือนทำงาน
        </Text>
        <View style={styles.monthRow}>
          <Pressable
            onPress={onPrevMonth}
            style={styles.monthNav}
            accessibilityLabel="เดือนก่อน"
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </Pressable>
          <View style={styles.monthBox}>
            <Text style={styles.monthLabel}>{formatThaiMonth(month)}</Text>
            <Text style={styles.monthSub}>
              {isCurrentMonth(month) ? 'รอบบิลเดือนนี้' : 'ไม่ใช่เดือนปัจจุบัน'}
            </Text>
          </View>
          <Pressable
            onPress={onNextMonth}
            style={styles.monthNav}
            accessibilityLabel="เดือนถัดไป"
          >
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>

        <Text
          variant="labelLarge"
          style={[styles.section, styles.sectionSpaced]}
        >
          ประเภทมิเตอร์
        </Text>
        <SegmentedButtons
          value={unitType}
          onValueChange={(value) => setUnitType(value as UnitType)}
          buttons={[
            { value: 'W', label: 'น้ำ', icon: 'water' },
            { value: 'E', label: 'ไฟ', icon: 'flash' },
          ]}
        />
      </View>

      <Text variant="labelLarge" style={styles.listTitle}>
        เลือกโซน ({zones.length})
      </Text>
    </View>
  );

  const listFooter = !zone ? (
    <Text variant="bodyMedium" style={styles.hint}>
      เลือกโซนก่อน แล้วไปแท็บจดมิเตอร์หรือรับชำระ
    </Text>
  ) : (
    <View style={styles.readyBox}>
      <Ionicons name="arrow-down" size={16} color={colors.success} />
      <Text variant="bodyMedium" style={styles.hintReady}>
        พร้อมทำงาน — สลับแท็บด้านล่างได้เลย
      </Text>
    </View>
  );

  return (
    <Screen loading={zonesQuery.isLoading} scroll={false}>
      <FlashList
        style={styles.flex}
        data={zones}
        keyExtractor={zoneKeyExtractor}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          zonesQuery.isLoading ? null : <EmptyState message="ไม่พบโซน" />
        }
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        extraData={zone?.id}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    paddingBottom: 28,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroSub: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
  },
  activePill: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  activePillText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  section: {
    marginBottom: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  sectionSpaced: {
    marginTop: 18,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNav: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBox: {
    flex: 1,
    alignItems: 'center',
  },
  monthLabel: {
    fontWeight: '800',
    color: colors.text,
    fontSize: 18,
  },
  monthSub: {
    marginTop: 2,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  listTitle: {
    marginBottom: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  hint: {
    marginTop: 8,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  readyBox: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  hintReady: {
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
});
