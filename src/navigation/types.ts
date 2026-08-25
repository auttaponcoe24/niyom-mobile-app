import type { NavigatorScreenParams } from '@react-navigation/native';

import type { TransactionRow, UnitRow } from '@/types/api';

export type UnitsStackParamList = {
  UnitRoute: undefined;
  UnitDetail: { unit: UnitRow };
};

export type PayStackParamList = {
  TransactionList: undefined;
  PayDetail: { transaction: TransactionRow };
};

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Units: NavigatorScreenParams<UnitsStackParamList>;
  Pay: NavigatorScreenParams<PayStackParamList>;
  Customers: NavigatorScreenParams<CustomersStackParamList>;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};
