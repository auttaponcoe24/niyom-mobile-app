import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';

import { useAuth } from '@/context/AuthContext';
import { CustomerDetailScreen } from '@/screens/CustomerDetailScreen';
import { CustomerListScreen } from '@/screens/CustomerListScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { PayDetailScreen } from '@/screens/PayDetailScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { TransactionListScreen } from '@/screens/TransactionListScreen';
import { UnitDetailScreen } from '@/screens/UnitDetailScreen';
import { UnitRouteScreen } from '@/screens/UnitRouteScreen';
import { colors } from '@/theme/colors';
import { navigationTheme } from '@/theme/paper';
import type {
  CustomersStackParamList,
  MainTabParamList,
  PayStackParamList,
  RootStackParamList,
  UnitsStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const UnitsStack = createNativeStackNavigator<UnitsStackParamList>();
const PayStack = createNativeStackNavigator<PayStackParamList>();
const CustomersStack = createNativeStackNavigator<CustomersStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  headerTitleStyle: {
    fontWeight: '700' as const,
    color: colors.text,
  },
  contentStyle: { backgroundColor: colors.background },
};

function UnitsNavigator() {
  return (
    <UnitsStack.Navigator screenOptions={stackScreenOptions}>
      <UnitsStack.Screen
        name="UnitRoute"
        component={UnitRouteScreen}
        options={{ headerShown: false }}
      />
      <UnitsStack.Screen
        name="UnitDetail"
        component={UnitDetailScreen}
        getId={({ params }) => `${params.unit.customerId}-${params.unit.type}`}
        options={{ title: 'จดมิเตอร์', headerBackTitle: 'รายการ' }}
      />
    </UnitsStack.Navigator>
  );
}

function PayNavigator() {
  return (
    <PayStack.Navigator screenOptions={stackScreenOptions}>
      <PayStack.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{ headerShown: false }}
      />
      <PayStack.Screen
        name="PayDetail"
        component={PayDetailScreen}
        getId={({ params }) =>
          `${params.transaction.customerId}-${params.transaction.type}-${params.transaction.id}`
        }
        options={{ title: 'รับชำระ', headerBackTitle: 'รายการ' }}
      />
    </PayStack.Navigator>
  );
}

function CustomersNavigator() {
  return (
    <CustomersStack.Navigator screenOptions={stackScreenOptions}>
      <CustomersStack.Screen
        name="CustomerList"
        component={CustomerListScreen}
        options={{ headerShown: false }}
      />
      <CustomersStack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ title: 'ลูกค้า', headerBackTitle: 'รายชื่อ' }}
      />
    </CustomersStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'หน้าหลัก',
          tabBarIcon: ({ color, size }) => (
            <Icon source="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Units"
        component={UnitsNavigator}
        options={{
          title: 'จดมิเตอร์',
          tabBarIcon: ({ color, size }) => (
            <Icon source="counter" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Pay"
        component={PayNavigator}
        options={{
          title: 'รับชำระ',
          tabBarIcon: ({ color, size }) => (
            <Icon source="cash" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersNavigator}
        options={{
          title: 'ลูกค้า',
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color, size }) => (
            <Icon source="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator animating color={colors.primary} size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          กำลังโหลด...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
  },
  tabBar: {
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
