import dayjs from 'dayjs';
import * as SecureStore from 'expo-secure-store';

import type { UnitType, Zone } from '@/types/api';

const KEY = 'niyom.workSelection';

export type WorkSelection = {
  zone: Zone | null;
  unitType: UnitType;
  month: string;
};

type Stored = WorkSelection & { savedAt: string };

/**
 * Last zone / meter type / month the worker picked, so reopening the app does
 * not start from scratch. The month is only restored within the calendar month
 * it was saved in — next month the app opens on the new billing round.
 */
export async function loadWorkSelection(): Promise<Partial<WorkSelection>> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return {};
    const stored = JSON.parse(raw) as Partial<Stored>;
    const sameMonth =
      Boolean(stored.savedAt) && dayjs(stored.savedAt).isSame(dayjs(), 'month');
    return {
      zone: stored.zone?.id ? stored.zone : null,
      unitType: stored.unitType === 'E' ? 'E' : 'W',
      month: sameMonth && stored.month ? stored.month : undefined,
    };
  } catch {
    return {};
  }
}

export async function saveWorkSelection(selection: WorkSelection) {
  try {
    const stored: Stored = { ...selection, savedAt: dayjs().toISOString() };
    await SecureStore.setItemAsync(KEY, JSON.stringify(stored));
  } catch {
    // A convenience only — never block the worker over it.
  }
}
