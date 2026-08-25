export type Role = 'ADMIN' | 'USER';
export type UnitType = 'W' | 'E';
export type BillStatus = 'WAITING' | 'PAY';

export type ApiEnvelope<T> = {
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  data: T;
};

export type ApiMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

export type ApiPaginated<T> = ApiEnvelope<T[]> & {
  meta: ApiMeta;
};

export type User = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  cardId: string | null;
  email: string;
  phoneNumber?: string | null;
  role: Role;
  customerId: string | null;
  provinceId: number | null;
  districtId: number | null;
  subDistrictId: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthExpiresAt = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type MobileAuthData = {
  user: User;
  tokens: AuthTokens;
  expiresAt: AuthExpiresAt;
};

export type MobileOtpRequestData = {
  phoneNumber: string;
  expiresAt: string;
  debugOtp?: string;
};

export type Zone = {
  id: number;
  zoneName: string;
  createdAt?: string;
  updatedAt?: string | null;
  isUsed?: boolean;
};

export type UnitRow = {
  id: number;
  date: string;
  type: UnitType;
  unitNumber: number | null;
  isMeterReplaced: boolean;
  isMeterRolledOver: boolean;
  previousMeterReading: number | null;
  customerId: string;
  zoneId: number | null;
  no: number | null;
  prefix: string;
  firstName: string | null;
  lastName: string | null;
  houseNumber: string | null;
};

export type Customer = {
  id: string;
  no: number | null;
  firstName: string | null;
  lastName: string | null;
  cardId: string | null;
  phoneNumber: string | null;
  houseNumber: string | null;
  address: string | null;
  zoneId: number | null;
  isServiceWater: boolean;
  isServiceElectric: boolean;
  isActive: boolean;
  prefix?: { id: number; prefixName: string } | null;
  zone?: { id: number; zoneName: string } | null;
};

export type TransactionRow = {
  id: number;
  date: string;
  type: UnitType;
  status: BillStatus;
  unitUsed?: number | null;
  amount?: number | null;
  overDue?: number | null;
  total?: number | null;
  pay?: number | null;
  remain?: number | null;
  customerId: string;
  zoneId: number | null;
  no?: number | null;
  prefix?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  houseNumber?: string | null;
  unitOld?: { unitNumber: number | null } | null;
  unitNew?: { unitNumber: number | null } | null;
};
