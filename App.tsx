import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { WorkProvider } from '@/context/WorkContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { paperTheme } from '@/theme/paper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <WorkProvider>
              <StatusBar style="dark" />
              <RootNavigator />
            </WorkProvider>
          </AuthProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
