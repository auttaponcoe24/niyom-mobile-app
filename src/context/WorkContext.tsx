import dayjs from 'dayjs';
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
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

  const value = useMemo(
    () => ({ zone, setZone, month, setMonth, unitType, setUnitType }),
    [zone, month, unitType]
  );

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
}

export function useWork() {
  const ctx = useContext(WorkContext);
  if (!ctx) {
    throw new Error('useWork must be used within WorkProvider');
  }
  return ctx;
}
