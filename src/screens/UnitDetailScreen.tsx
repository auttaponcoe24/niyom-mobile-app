import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Snackbar } from 'react-native-paper';

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

function isRecorded(unit: UnitRow) {
  return unit.unitNumber !== null && unit.unitNumber !== undefined;
}

/** Forms are only built for the visible page and this many neighbours each side. */
const WINDOW = 1;

/** Next page still missing a reading: forward from `from`, then wrap to the start. */
function findNextPending(units: UnitRow[], from: number, savedKey: string) {
  for (let step = 1; step < units.length; step += 1) {
    const index = (from + step) % units.length;
    const unit = units[index];
    if (unitKey(unit) !== savedKey && !isRecorded(unit)) return index;
  }
  return -1;
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
  // Page being jumped to after a save, mounted ahead so it is ready on arrival.
  const [target, setTarget] = useState<number | null>(null);

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

  const [savedName, setSavedName] = useState<string | null>(null);

  const onSaved = useCallback(
    (saved: UnitRow, queued: boolean) => {
      const savedKey = unitKey(saved);
      const from = units.findIndex((row) => unitKey(row) === savedKey);
      const next = findNextPending(units, Math.max(from, 0), savedKey);
      if (next < 0) {
        Alert.alert(
          'จดครบแล้ว',
          queued
            ? 'จดครบทุกรายการแล้ว — รายการที่ยังไม่ได้ส่งจะส่งเองเมื่อมีสัญญาณ'
            : 'จดเลขมิเตอร์ครบทุกรายการในโซนนี้แล้ว',
          [{ text: 'กลับรายการ', onPress: () => navigation.goBack() }]
        );
        return;
      }
      const name =
        `${saved.firstName ?? ''} ${saved.lastName ?? ''}`.trim() ||
        `#${saved.no ?? '-'}`;
      setSavedName(
        queued ? `ไม่มีสัญญาณ เก็บไว้ในเครื่อง: ${name}` : `บันทึกแล้ว: ${name}`
      );
      setTarget(next);
      // A far jump would scroll past every house in between — go straight there.
      if (Math.abs(next - from) > 1) {
        pagerRef.current?.setPageWithoutAnimation(next);
      } else {
        pagerRef.current?.setPage(next);
      }
    },
    [navigation, units]
  );

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
          setTarget(null);
        }}
        overdrag
      >
        {units.map((unit, index) => (
          <View key={unitKey(unit)} collapsable={false} style={styles.page}>
            {/* A zone can hold hundreds of houses: off-screen pages stay empty. */}
            {Math.abs(index - page) <= WINDOW ||
            (target !== null && Math.abs(index - target) <= WINDOW) ? (
              <UnitMeterForm
                unit={unit}
                pageLabel={`${index + 1}/${units.length}`}
                active={index === page}
                onSaved={onSaved}
              />
            ) : null}
          </View>
        ))}
      </PagerView>
      <Snackbar
        visible={savedName !== null}
        onDismiss={() => setSavedName(null)}
        duration={2200}
        wrapperStyle={styles.snackbar}
      >
        {savedName ?? ''}
      </Snackbar>
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
  // Top of the screen: the bottom is taken by the save button.
  snackbar: {
    top: 0,
    bottom: undefined,
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
