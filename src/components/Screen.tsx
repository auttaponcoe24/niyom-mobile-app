import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  right?: ReactNode;
  /** Override safe-area edges (e.g. detail under native stack header). */
  edges?: readonly Edge[];
};

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  loading = false,
  style,
  right,
  edges = ['top', 'left', 'right'],
}: Props) {
  const body = loading ? (
    <View style={styles.loading}>
      <ActivityIndicator animating color={colors.primary} size="large" />
    </View>
  ) : (
    children
  );

  const showHeader = Boolean(title || right);

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {showHeader ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? (
              <Text variant="headlineMedium" style={styles.title}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text variant="bodyMedium" style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right}
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, style]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, style]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.4,
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    color: colors.textMuted,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  loading: {
    paddingVertical: 56,
    alignItems: 'center',
  },
});
