import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { Screen } from '@/components/Screen';
import { UnitMeterForm } from '@/components/UnitMeterForm';
import { useWork } from '@/context/WorkContext';
import { useGetUnits } from '@/hooks';
import type { UnitsStackParamList } from '@/navigation/types';
import type { UnitRow } from '@/types/api';

type Props = NativeStackScreenProps<UnitsStackParamList, 'UnitDetail'>;

function unitKey(unit: UnitRow) {
  return `${unit.customerId}-${unit.type}`;
}

export function UnitDetailScreen({ route, navigation }: Props) {
  const initialUnit = route.params.unit;
  const { zone, month, unitType } = useWork();
  const pagerRef = useRef<PagerView>(null);
  const didSyncPage = useRef(false);

  const unitsQuery = useGetUnits(
    {
      zoneId: zone?.id ?? initialUnit.zoneId ?? 0,
      date: month,
      type: unitType,
      limit: 100,
    },
    { enabled: Boolean(zone?.id || initialUnit.zoneId) }
  );

  const units = useMemo(() => {
    const list = unitsQuery.data?.data ?? [];
    if (list.length === 0) return [initialUnit];
    return list;
  }, [unitsQuery.data?.data, initialUnit]);

  const initialIndex = useMemo(() => {
    const index = units.findIndex(
      (row) => unitKey(row) === unitKey(initialUnit)
    );
    return index >= 0 ? index : 0;
  }, [units, initialUnit]);

  const [page, setPage] = useState(initialIndex);

  useEffect(() => {
    setPage(initialIndex);
    if (!didSyncPage.current && units.length > 1) {
      didSyncPage.current = true;
      requestAnimationFrame(() => {
        pagerRef.current?.setPageWithoutAnimation(initialIndex);
      });
    }
  }, [initialIndex, units.length]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'จดมิเตอร์',
      headerBackTitle: 'รายการ',
      headerRight: () => null,
    });
  }, [navigation]);

  useLayoutEffect(() => {
    const total = units.length;
    const current = Math.min(page + 1, total);
    navigation.setOptions({
      headerTitle: total > 1 ? `จดมิเตอร์ · ${current}/${total}` : 'จดมิเตอร์',
    });
  }, [navigation, page, units.length]);

  return (
    <Screen
      edges={['left', 'right', 'bottom']}
      scroll={false}
      style={styles.screen}
    >
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={initialIndex}
        onPageSelected={(event) => {
          setPage(event.nativeEvent.position);
        }}
        overdrag
      >
        {units.map((unit, index) => (
          <View key={unitKey(unit)} collapsable={false} style={styles.page}>
            <UnitMeterForm
              unit={unit}
              pageLabel={`${index + 1}/${units.length}`}
              onSaved={() => navigation.goBack()}
            />
          </View>
        ))}
      </PagerView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
