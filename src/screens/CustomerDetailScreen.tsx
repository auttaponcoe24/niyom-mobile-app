import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatMoney } from '@/components/list-rows';
import { Screen } from '@/components/Screen';
import { Badge } from '@/components/ui';
import { useWork } from '@/context/WorkContext';
import { useGetCustomer, useGetTransactions } from '@/hooks';
import type { CustomersStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import type { TransactionRow, UnitType } from '@/types/api';
import { formatThaiMonth } from '@/utils/thai-date';

type Props = NativeStackScreenProps<CustomersStackParamList, 'CustomerDetail'>;

export function CustomerDetailScreen({ route, navigation }: Props) {
  const { customerId } = route.params;
  const query = useGetCustomer(customerId);
  const c = query.data;

  const { month } = useWork();

  const types: UnitType[] = [];
  if (c?.isServiceWater) types.push('W');
  if (c?.isServiceElectric) types.push('E');

  // This customer's bills for the working month (one per meter type).
  const billsQuery = useGetTransactions(
    {
      zoneId: c?.zoneId ?? 0,
      date: month,
      type: types,
      customerId,
    },
    { enabled: Boolean(c?.zoneId) && types.length > 0 }
  );
  const bills = (billsQuery.data?.data ?? []).filter(
    (bill) => bill.customerId === customerId
  );

  const onCall = () => {
    const digits = (c?.phoneNumber ?? '').replace(/[^\d+]/g, '');
    if (!digits) return;
    Linking.openURL(`tel:${digits}`).catch(() =>
      Alert.alert('โทรออกไม่ได้', 'เครื่องนี้ไม่รองรับการโทรออก')
    );
  };

  const onOpenBill = (transaction: TransactionRow) => {
    navigation.getParent()?.navigate('Pay', {
      screen: 'PayDetail',
      params: { transaction },
      initial: false,
    });
  };

  const name = c
    ? `${c.prefix?.prefixName ?? ''} ${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()
    : '';

  return (
    <Screen edges={['left', 'right', 'bottom']} loading={query.isLoading}>
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
              actionLabel={c.phoneNumber ? 'โทร' : undefined}
              onPress={c.phoneNumber ? onCall : undefined}
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

          <Text variant="labelLarge" style={styles.sectionTitle}>
            บิล {formatThaiMonth(month)}
          </Text>
          <View style={styles.card}>
            {billsQuery.isLoading ? (
              <Text style={styles.billEmpty}>กำลังโหลด...</Text>
            ) : billsQuery.isError ? (
              <Text style={styles.billEmpty}>โหลดบิลไม่สำเร็จ ลองใหม่อีกครั้ง</Text>
            ) : bills.length === 0 ? (
              <Text style={styles.billEmpty}>ไม่มีบิลในเดือนนี้</Text>
            ) : (
              bills.map((bill, index) => {
                const created = bill.id > 0;
                const paid = bill.status === 'PAY';
                return (
                  <View key={`${bill.type}-${bill.id}`}>
                    {index > 0 ? <View style={styles.billDivider} /> : null}
                    <Pressable
                      onPress={created ? () => onOpenBill(bill) : undefined}
                      disabled={!created}
                      style={styles.billRow}
                      accessibilityRole="button"
                    >
                      <View style={styles.metaIcon}>
                        <Ionicons
                          name={bill.type === 'W' ? 'water' : 'flash'}
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.metaText}>
                        <Text style={styles.metaLabel}>
                          {bill.type === 'W' ? 'ค่าน้ำ' : 'ค่าไฟ'}
                        </Text>
                        <Text style={styles.metaValue}>
                          {created
                            ? `${formatMoney(bill.total)} บาท`
                            : 'ยังไม่ออกบิล'}
                        </Text>
                      </View>
                      {created ? (
                        <Badge
                          label={paid ? 'ชำระแล้ว' : 'รอชำระ'}
                          tone={paid ? 'success' : 'warning'}
                        />
                      ) : null}
                      {created ? (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={colors.textMuted}
                        />
                      ) : null}
                    </Pressable>
                  </View>
                );
              })
            )}
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
  actionLabel,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  actionLabel?: string;
  onPress?: () => void;
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
      {onPress && actionLabel ? (
        <Pressable
          onPress={onPress}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} ${value}`}
        >
          <Ionicons name={icon} size={16} color="#FFF" />
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
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
    alignItems: 'center',
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
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    color: colors.textMuted,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  billDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
  billEmpty: {
    color: colors.textMuted,
    paddingVertical: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
});
