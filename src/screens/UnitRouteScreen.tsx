import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, SegmentedButtons, Text } from 'react-native-paper';

import { UnitListRow } from '@/components/list-rows';
import { Screen } from '@/components/Screen';
import { ContextChip, EmptyState, SearchField } from '@/components/ui';
import { useWork } from '@/context/WorkContext';
import { useGetUnits } from '@/hooks';
import type { UnitsStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import type { UnitRow } from '@/types/api';

type Props = NativeStackScreenProps<UnitsStackParamList, 'UnitRoute'>;
type Filter = 'all' | 'pending' | 'done';

function unitKeyExtractor(item: UnitRow) {
  return `${item.customerId}-${item.type}`;
}

function isRecorded(item: UnitRow) {
  return item.unitNumber !== null && item.unitNumber !== undefined;
}

export function UnitRouteScreen({ navigation }: Props) {
  const { zone, month, unitType } = useWork();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const unitsQuery = useGetUnits(
    {
      zoneId: zone?.id ?? 0,
      date: month,
      type: unitType,
      search: search || undefined,
      limit: 100,
    },
    { enabled: Boolean(zone?.id) }
  );

  const rows = useMemo(
    () => unitsQuery.data?.data ?? [],
    [unitsQuery.data?.data]
  );

  const stats = useMemo(() => {
    let done = 0;
    for (const row of rows) {
      if (isRecorded(row)) done += 1;
    }
    return { total: rows.length, done, pending: rows.length - done };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === 'pending') return rows.filter((row) => !isRecorded(row));
    if (filter === 'done') return rows.filter(isRecorded);
    return rows;
  }, [filter, rows]);

  const unitsByKey = useMemo(() => {
    const map = new Map<string, UnitRow>();
    for (const row of rows) {
      map.set(`${row.customerId}-${row.type}`, row);
    }
    return map;
  }, [rows]);

  const onPressUnit = useCallback(
    (customerId: string, type: string) => {
      const unit = unitsByKey.get(`${customerId}-${type}`);
      if (unit) navigation.navigate('UnitDetail', { unit });
    },
    [navigation, unitsByKey]
  );

  const onRefresh = useCallback(() => {
    void unitsQuery.refetch();
  }, [unitsQuery]);

  const renderItem = useCallback(
    ({ item }: { item: UnitRow }) => {
      const recorded = isRecorded(item);
      const name =
        `${item.prefix} ${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
      const meta = recorded
        ? `บ้านเลขที่ ${item.houseNumber || '-'} · เลขมิเตอร์ ${item.unitNumber}`
        : `บ้านเลขที่ ${item.houseNumber || '-'}`;

      return (
        <UnitListRow
          customerId={item.customerId}
          type={item.type}
          noLabel={`#${item.no ?? '-'}`}
          name={name}
          meta={meta}
          recorded={recorded}
          onPress={onPressUnit}
        />
      );
    },
    [onPressUnit]
  );

  if (!zone) {
    return (
      <Screen title="จดมิเตอร์" subtitle="เลือกโซนที่แท็บหน้าหลักก่อน">
        <EmptyState message="ยังไม่ได้เลือกโซน" />
      </Screen>
    );
  }

  const progress = stats.total > 0 ? stats.done / stats.total : 0;

  return (
    <Screen title="จดมิเตอร์" subtitle="แตะรายการเพื่อจดเลขมิเตอร์" scroll={false}>
      <ContextChip
        label={`${zone.zoneName} · ${unitType === 'W' ? 'น้ำ' : 'ไฟ'}`}
      />

      <View style={styles.progressCard}>
        <View style={styles.progressHead}>
          <Text variant="titleSmall" style={styles.progressTitle}>
            ความคืบหน้าวันนี้
          </Text>
          <Text variant="labelLarge" style={styles.progressCount}>
            {stats.done}/{stats.total}
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color={colors.primary}
          style={styles.progressBar}
        />
        <Text variant="bodySmall" style={styles.progressHint}>
          เหลือ {stats.pending} รายการที่ยังไม่จด
        </Text>
      </View>

      <SearchField
        placeholder="ค้นหา ชื่อ / บ้านเลขที่"
        value={search}
        onChangeText={setSearch}
      />

      <SegmentedButtons
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        style={styles.filters}
        buttons={[
          { value: 'all', label: 'ทั้งหมด' },
          { value: 'pending', label: `ยังไม่จด (${stats.pending})` },
          { value: 'done', label: `จดแล้ว (${stats.done})` },
        ]}
      />

      <FlashList
        style={styles.flex}
        data={filteredRows}
        keyExtractor={unitKeyExtractor}
        contentContainerStyle={styles.list}
        refreshing={unitsQuery.isFetching}
        onRefresh={onRefresh}
        ListEmptyComponent={
          unitsQuery.isLoading ? null : (
            <EmptyState
              message={
                filter === 'pending'
                  ? 'จดครบแล้วในรอบนี้'
                  : filter === 'done'
                    ? 'ยังไม่มีรายการที่จดแล้ว'
                    : 'ไม่พบรายการในโซนนี้'
              }
            />
          )
        }
        renderItem={renderItem}
        extraData={`${filter}-${stats.done}`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    paddingBottom: 24,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  progressCount: {
    fontWeight: '800',
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  progressHint: {
    marginTop: 8,
    color: colors.textMuted,
  },
  filters: {
    marginBottom: 12,
  },
});
