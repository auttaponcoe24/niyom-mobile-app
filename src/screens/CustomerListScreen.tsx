import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { CustomerRow } from '@/components/list-rows';
import { Screen } from '@/components/Screen';
import { ContextChip, EmptyState, SearchField } from '@/components/ui';
import { useWork } from '@/context/WorkContext';
import { useGetCustomers } from '@/hooks';
import type { CustomersStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import type { Customer } from '@/types/api';
import { matchesSearch } from '@/utils/search';

type Props = NativeStackScreenProps<CustomersStackParamList, 'CustomerList'>;

function customerKeyExtractor(item: Customer) {
  return item.id;
}

export function CustomerListScreen({ navigation }: Props) {
  const { zone } = useWork();
  const [search, setSearch] = useState('');

  const customersQuery = useGetCustomers(
    {
      zoneId: zone?.id,
    },
    { enabled: Boolean(zone?.id) }
  );

  const allRows = useMemo(
    () => customersQuery.data?.data ?? [],
    [customersQuery.data?.data]
  );

  const rows = useMemo(
    () =>
      allRows.filter((row) =>
        matchesSearch(search, [
          row.firstName,
          row.lastName,
          row.houseNumber,
          row.phoneNumber,
          row.no,
        ])
      ),
    [allRows, search]
  );

  const onPressCustomer = useCallback(
    (id: string) => {
      navigation.navigate('CustomerDetail', { customerId: id });
    },
    [navigation]
  );

  const onRefresh = useCallback(() => {
    void customersQuery.refetch();
  }, [customersQuery]);

  const renderItem = useCallback(
    ({ item }: { item: Customer }) => {
      const name =
        `${item.prefix?.prefixName ?? ''} ${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
      const meta = `บ้านเลขที่ ${item.houseNumber || '-'}${
        item.phoneNumber ? ` · ${item.phoneNumber}` : ''
      }`;

      return (
        <CustomerRow
          id={item.id}
          noLabel={`#${item.no ?? '-'}`}
          name={name}
          meta={meta}
          onPress={onPressCustomer}
        />
      );
    },
    [onPressCustomer]
  );

  if (!zone) {
    return (
      <Screen title="ลูกค้า" subtitle="เลือกโซนที่แท็บหน้าหลักก่อน">
        <EmptyState message="ยังไม่ได้เลือกโซน" />
      </Screen>
    );
  }

  return (
    <Screen title="ลูกค้า" subtitle="ข้อมูลลูกค้าในโซน (อ่านอย่างเดียว)" scroll={false}>
      <ContextChip label={zone.zoneName} />

      <View style={styles.statsCard}>
        <Text variant="titleSmall" style={styles.statsTitle}>
          ลูกค้าในโซนนี้
        </Text>
        <Text variant="headlineSmall" style={styles.statsCount}>
          {allRows.length}
        </Text>
        <Text variant="bodySmall" style={styles.statsHint}>
          แตะรายชื่อเพื่อดูรายละเอียด
        </Text>
      </View>

      <SearchField
        placeholder="ค้นหา ชื่อ / เบอร์ / บ้านเลขที่"
        value={search}
        onChangeText={setSearch}
      />
      <FlashList
        style={styles.flex}
        data={rows}
        keyExtractor={customerKeyExtractor}
        contentContainerStyle={styles.list}
        refreshing={customersQuery.isFetching}
        onRefresh={onRefresh}
        ListEmptyComponent={
          customersQuery.isLoading ? null : <EmptyState message="ไม่พบลูกค้า" />
        }
        renderItem={renderItem}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingBottom: 24 },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statsTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  statsCount: {
    marginTop: 4,
    fontWeight: '800',
    color: colors.primary,
  },
  statsHint: {
    marginTop: 4,
    color: colors.textMuted,
  },
});
