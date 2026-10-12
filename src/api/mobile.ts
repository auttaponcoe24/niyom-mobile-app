import { httpClient } from '@/api/httpClient';
import { getRefreshToken } from '@/lib/token-storage';
import type {
  ApiEnvelope,
  ApiPaginated,
  Customer,
  MobileAuthData,
  MobileOtpRequestData,
  ReceiptRef,
  TransactionRow,
  UnitRow,
  UnitType,
  User,
  Zone,
} from '@/types/api';

export async function mobileRequestOtp(phoneNumber: string) {
  const { data } = await httpClient.post<ApiEnvelope<MobileOtpRequestData>>(
    '/api/mobile/auth/otp/request',
    { phoneNumber }
  );
  return data.data;
}

export async function mobileVerifyOtp(
  phoneNumber: string,
  code: string,
  deviceName?: string
) {
  const { data } = await httpClient.post<ApiEnvelope<MobileAuthData>>(
    '/api/mobile/auth/otp/verify',
    { phoneNumber, code, deviceName }
  );
  return data.data;
}

export async function mobileRefreshSession(refreshToken: string) {
  const { data } = await httpClient.post<ApiEnvelope<MobileAuthData>>(
    '/api/mobile/auth/refresh',
    { refreshToken }
  );
  return data.data;
}

export async function mobileLogout() {
  const refreshToken = await getRefreshToken();
  await httpClient.post('/api/mobile/auth/logout', {
    refreshToken: refreshToken ?? undefined,
  });
}

export async function mobileGetProfile() {
  const { data } = await httpClient.get<ApiEnvelope<User>>(
    '/api/mobile/auth/profile'
  );
  return data.data;
}

export async function mobileChangePassword(
  password: string,
  newPassword: string
) {
  const { data } = await httpClient.patch<ApiEnvelope<unknown>>(
    '/api/mobile/auth/change-password',
    { password, newPassword }
  );
  return data;
}

export async function mobileGetZones(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { data } = await httpClient.get<ApiPaginated<Zone>>(
    '/api/mobile/zones',
    {
      params: { page: 1, limit: 100, ...params },
    }
  );
  return data;
}

export async function mobileGetCustomers(params: {
  page?: number;
  limit?: number;
  search?: string;
  zoneId?: number;
}) {
  const { data } = await httpClient.get<ApiPaginated<Customer>>(
    '/api/mobile/customers',
    { params: { page: 1, limit: 20, ...params } }
  );
  return data;
}

export async function mobileGetCustomer(uuid: string) {
  const { data } = await httpClient.get<ApiEnvelope<Customer>>(
    `/api/mobile/customers/${uuid}`
  );
  return data.data;
}

export async function mobileGetUnits(params: {
  page?: number;
  limit?: number;
  search?: string;
  date: string;
  zoneId: number;
  type: UnitType | UnitType[];
}) {
  const { data } = await httpClient.get<ApiPaginated<UnitRow>>(
    '/api/mobile/units',
    { params: { page: 1, limit: 50, ...params } }
  );
  return data;
}

export async function mobileSaveUnit(body: {
  date: string;
  type: UnitType;
  unitNumber: number;
  customerId: string;
  zoneId: number;
  previousMeterReading?: number;
  isMeterReplaced?: boolean;
  isMeterRolledOver?: boolean;
}) {
  // Short timeout: with weak signal the reading goes to the outbox instead of
  // leaving the worker waiting. Re-sending the same reading later is harmless.
  const { data } = await httpClient.post<ApiEnvelope<unknown>>(
    '/api/mobile/units',
    body,
    { timeout: 12000 }
  );
  return data;
}

export async function mobileGetTransactions(params: {
  page?: number;
  limit?: number;
  search?: string;
  date: string;
  zoneId: number;
  type: UnitType | UnitType[];
  customerId?: string;
}) {
  const { data } = await httpClient.get<ApiPaginated<TransactionRow>>(
    '/api/mobile/transactions',
    { params: { page: 1, limit: 50, ...params } }
  );
  return data;
}

export async function mobilePayTransaction(
  transactionId: string | number,
  pay: number
) {
  const { data } = await httpClient.post<ApiEnvelope<TransactionRow>>(
    `/api/mobile/transactions/${transactionId}/pay`,
    { pay }
  );
  return data.data;
}

export async function mobileGetReceipt(transactionId: number) {
  const { data } = await httpClient.get<ApiEnvelope<ReceiptRef | null>>(
    `/api/mobile/transactions/${transactionId}/receipt`
  );
  return data.data;
}
