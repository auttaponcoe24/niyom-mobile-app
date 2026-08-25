import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Screen } from '@/components/Screen';
import { Badge } from '@/components/ui';
import { useGetCustomer } from '@/hooks';
import type { CustomersStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<CustomersStackParamList, 'CustomerDetail'>;

export function CustomerDetailScreen({ route }: Props) {
  const { customerId } = route.params;
  const query = useGetCustomer(customerId);
  const c = query.data;

  const name = c
    ? `${c.prefix?.prefixName ?? ''} ${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()
    : '';

  return (
    <Screen
      title="รายละเอียดลูกค้า"
      subtitle="อ่านอย่างเดียว"
      loading={query.isLoading}
    >
      {c ? (
        <>
          <LinearGradient
            colors={['#1F6B4A', '#134734']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View style={styles.indexPill}>
                <Text style={styles.indexText}>#{c.no ?? '-'}</Text>
              </View>
              <Badge
                label={c.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                tone={c.isActive ? 'success' : 'warning'}
              />
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.heroMeta}>โซน {c.zone?.zoneName || '-'}</Text>
            <View style={styles.serviceRow}>
              {c.isServiceWater ? (
                <View style={styles.serviceChip}>
                  <Ionicons name="water" size={14} color="#FFF" />
                  <Text style={styles.serviceText}>น้ำ</Text>
                </View>
              ) : null}
              {c.isServiceElectric ? (
                <View style={styles.serviceChip}>
                  <Ionicons name="flash" size={14} color="#FFF" />
                  <Text style={styles.serviceText}>ไฟ</Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <MetaRow
              icon="home-outline"
              label="บ้านเลขที่"
              value={c.houseNumber || '-'}
            />
            <View style={styles.divider} />
            <MetaRow
              icon="call-outline"
              label="โทร"
              value={c.phoneNumber || '-'}
            />
            <View style={styles.divider} />
            <MetaRow
              icon="location-outline"
              label="ที่อยู่"
              value={c.address || '-'}
            />
            <View style={styles.divider} />
            <MetaRow
              icon="map-outline"
              label="โซน"
              value={c.zone?.zoneName || '-'}
            />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.metaText}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  indexPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  indexText: {
    fontWeight: '800',
    color: '#FFF',
    fontSize: 15,
  },
  name: {
    fontWeight: '800',
    color: '#FFF',
    fontSize: 24,
    letterSpacing: -0.3,
  },
  heroMeta: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  serviceText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  metaValue: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
});
