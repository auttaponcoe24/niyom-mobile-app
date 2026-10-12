import { StyleSheet, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

import { ContextChip } from '@/components/ui';
import { useWork } from '@/context/WorkContext';
import type { UnitType } from '@/types/api';
import { formatThaiMonth } from '@/utils/thai-date';

/**
 * Zone + month the worker is in, with the water/electric switch right there —
 * most houses have both meters, so going back to Home to switch was a detour.
 */
export function WorkContextBar({ showType = true }: { showType?: boolean }) {
  const { zone, month, unitType, setUnitType } = useWork();
  if (!zone) return null;

  return (
    <View style={styles.row}>
      <View style={styles.chip}>
        <ContextChip
          label={
            showType
              ? `${zone.zoneName} · ${formatThaiMonth(month)}`
              : zone.zoneName
          }
        />
      </View>
      {showType ? (
        <SegmentedButtons
          density="small"
          value={unitType}
          onValueChange={(value) => setUnitType(value as UnitType)}
          style={styles.switch}
          buttons={[
            { value: 'W', label: 'น้ำ' },
            { value: 'E', label: 'ไฟ' },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  // Takes the remaining width and clips a long zone name instead of sliding
  // under the switch.
  chip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  switch: {
    width: 156,
    flexShrink: 0,
  },
});
