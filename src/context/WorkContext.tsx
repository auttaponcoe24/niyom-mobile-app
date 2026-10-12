import dayjs from 'dayjs';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadWorkSelection, saveWorkSelection } from '@/lib/work-storage';
import type { UnitType, Zone } from '@/types/api';

type WorkContextValue = {
  zone: Zone | null;
  setZone: (zone: Zone | null) => void;
  month: string;
  setMonth: (month: string) => void;
  unitType: UnitType;
  setUnitType: (type: UnitType) => void;
};

const WorkContext = createContext<WorkContextValue | null>(null);

export function WorkProvider({ children }: { children: ReactNode }) {
  const [zone, setZone] = useState<Zone | null>(null);
  const [month, setMonth] = useState(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );
  const [unitType, setUnitType] = useState<UnitType>('W');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadWorkSelection().then((saved) => {
      if (cancelled) return;
      if (saved.zone) setZone(saved.zone);
      if (saved.unitType) setUnitType(saved.unitType);
      if (saved.month) setMonth(saved.month);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveWorkSelection({ zone, unitType, month });
  }, [hydrated, zone, unitType, month]);

  const value = useMemo(
    () => ({ zone, setZone, month, setMonth, unitType, setUnitType }),
    [zone, month, unitType]
  );

  // Wait for the saved selection so screens never flash "no zone selected".
  if (!hydrated) return null;

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
}

export function useWork() {
  const ctx = useContext(WorkContext);
  if (!ctx) {
    throw new Error('useWork must be used within WorkProvider');
  }
  return ctx;
}
