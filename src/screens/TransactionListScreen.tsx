import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, SegmentedButtons, Text } from 'react-native-paper';
import { formatMoney, TransactionListRow } from '@/components/list-rows';
import { Screen } from '@/components/Screen';
import { ContextChip, EmptyState, SearchField } from '@/components/ui';
import { useWork } from '@/context/WorkContext';
import { useGetTransactions } from '@/hooks';
import type { PayStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import type { TransactionRow } from '@/types/api';
import { formatThaiMonth } from '@/utils/thai-date';

type Props = NativeStackScreenProps<PayStackParamList, 'TransactionList'>;
type Filter = 'all' | 'waiting' | 'paid';

function transactionKeyExtractor(item: TransactionRow) {
  return `${item.customerId}-${item.type}-${item.id}`;
}

function isPaid(item: TransactionRow) {
  return item.status === 'PAY';
}

export function TransactionListScreen({ navigation }: Props) {
  const { zone, month, unitType } = useWork();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const txQuery = useGetTransactions(
    {
      zoneId: zone?.id ?? 0,
      date: month,
      type: unitType,
      search: search || undefined,
      limit: 100,
    },
    { enabled: Boolean(zone?.id) }
  );

  const rows = useMemo(() => txQuery.data?.data ?? [], [txQuery.data?.data]);

  const stats = useMemo(() => {
    let paid = 0;
    for (const row of rows) {
      if (isPaid(row)) paid += 1;
    }
    return { total: rows.length, paid, waiting: rows.length - paid };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === 'waiting') return rows.filter((row) => !isPaid(row));
    if (filter === 'paid') return rows.filter(isPaid);
    return rows;
  }, [filter, rows]);

  const transactionsByKey = useMemo(() => {
    const map = new Map<string, TransactionRow>();
    for (const row of rows) {
      map.set(`${row.customerId}-${row.type}`, row);
    }
    return map;
  }, [rows]);

  const onPressTransaction = useCallback(
    (customerId: string, type: string) => {
      const transaction = transactionsByKey.get(`${customerId}-${type}`);
      if (transaction) navigation.navigate('PayDetail', { transaction });
    },
    [navigation, transactionsByKey]
  );

  const onRefresh = useCallback(() => {
    void txQuery.refetch();
  }, [txQuery]);

  const renderItem = useCallback(
    ({ item }: { item: TransactionRow }) => {
      const paid = isPaid(item);
      const name =
        `${item.prefix ?? ''} ${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
      const meta = `รวม ${formatMoney(item.total)} บาท${
        item.remain != null ? ` · คงเหลือ ${formatMoney(item.remain)}` : ''
      }`;

      return (
        <TransactionListRow
          customerId={item.customerId}
          type={item.type}
          noLabel={`#${item.no ?? '-'}`}
          name={name}
          meta={meta}
          paid={paid}
          onPress={onPressTransaction}
        />
      );
    },
    [onPressTransaction]
  );

  if (!zone) {
    return (
      <Screen title="รับชำระ" subtitle="เลือกโซนที่แท็บหน้าหลักก่อน">
        <EmptyState message="ยังไม่ได้เลือกโซน" />
      </Screen>
    );
  }

  const progress = stats.total > 0 ? stats.paid / stats.total : 0;

  return (
    <Screen title="รับชำระ" subtitle="แตะรายการเพื่อรับชำระ" scroll={false}>
      <ContextChip
        label={`${zone.zoneName} · ${unitType === 'W' ? 'น้ำ' : 'ไฟ'} · ${formatThaiMonth(month)}`}
      />

      <View style={styles.progressCard}>
        <View style={styles.progressHead}>
          <Text variant="titleSmall" style={styles.progressTitle}>
            ความคืบหน้าการชำระ
          </Text>
          <Text variant="labelLarge" style={styles.progressCount}>
            {stats.paid}/{stats.total}
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color={colors.primary}
          style={styles.progressBar}
        />
        <Text variant="bodySmall" style={styles.progressHint}>
          เหลือ {stats.waiting} รายการที่รอชำระ
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
          { value: 'waiting', label: `รอชำระ (${stats.waiting})` },
          { value: 'paid', label: `ชำระแล้ว (${stats.paid})` },
        ]}
      />

      <FlashList
        style={styles.flex}
        data={filteredRows}
        keyExtractor={transactionKeyExtractor}
        contentContainerStyle={styles.list}
        refreshing={txQuery.isFetching}
        onRefresh={onRefresh}
        ListEmptyComponent={
          txQuery.isLoading ? null : (
            <EmptyState
              message={
                filter === 'waiting'
                  ? 'รับชำระครบแล้วในรอบนี้'
                  : filter === 'paid'
                    ? 'ยังไม่มีรายการที่ชำระแล้ว'
                    : 'ไม่พบรายการบิล'
              }
            />
          )
        }
        renderItem={renderItem}
        extraData={`${filter}-${stats.paid}`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingBottom: 24 },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
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
