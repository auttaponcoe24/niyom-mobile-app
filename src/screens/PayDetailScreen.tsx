import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { formatMoney } from '@/components/list-rows';
import { Screen } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui';
import { usePayTransaction } from '@/hooks';
import type { PayStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<PayStackParamList, 'PayDetail'>;

export function PayDetailScreen({ route, navigation }: Props) {
  const { transaction } = route.params;
  const payMutation = usePayTransaction();
  const defaultPay =
    transaction.remain != null && transaction.remain > 0
      ? transaction.remain
      : (transaction.total ?? 0);

  const [pay, setPay] = useState(String(defaultPay ?? 0));
  const paid = transaction.status === 'PAY';
  const customerName =
    `${transaction.prefix ?? ''} ${transaction.firstName ?? ''} ${transaction.lastName ?? ''}`.trim();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'รับชำระ',
      headerBackTitle: 'รายการ',
    });
  }, [navigation]);

  const due = transaction.total ?? 0;
  const amount = Number(pay);
  // The API marks the bill paid with whatever amount it is sent, so a short or
  // over payment is called out before it is confirmed.
  const diffNote =
    Number.isNaN(amount) || amount <= 0 || amount === due
      ? null
      : amount < due
        ? `น้อยกว่ายอดบิล ${formatMoney(due - amount)} บาท — ส่วนที่เหลือจะยกไปรวมในบิลเดือนถัดไป`
        : `มากกว่ายอดบิล ${formatMoney(amount - due)} บาท — ตรวจยอดอีกครั้ง`;

  const onPay = () => {
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert('ยอดไม่ถูกต้อง', 'กรุณากรอกจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!transaction.id || transaction.id <= 0) {
      Alert.alert(
        'ยังไม่มีบิลในระบบ',
        'รายการนี้ยังไม่ได้สร้างธุรกรรม — ให้สร้างบิลจากเว็บก่อน หรือรอเฟสถัดไป'
      );
      return;
    }
    const lines = [
      customerName,
      `บ้านเลขที่ ${transaction.houseNumber || '-'} · ${
        transaction.type === 'W' ? 'ค่าน้ำ' : 'ค่าไฟ'
      }`,
      `รับเงิน ${formatMoney(amount)} บาท`,
    ];
    if (diffNote) lines.push('', diffNote);
    Alert.alert('ยืนยันรับชำระ?', lines.join('\n'), [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ยืนยัน', onPress: () => void submit() },
    ]);
  };

  const submit = async () => {
    try {
      await payMutation.mutateAsync({
        transactionId: transaction.id,
        pay: amount,
      });
      Alert.alert('รับชำระแล้ว', 'บันทึกการชำระสำเร็จ', [
        { text: 'กลับรายการ', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'รับชำระไม่สำเร็จ';
      Alert.alert('ผิดพลาด', message);
    }
  };

  return (
    <Screen
      edges={['left', 'right', 'bottom']}
      scroll={false}
      style={styles.screen}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={paid ? ['#027A48', '#134734'] : ['#1F6B4A', '#134734']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View style={styles.indexPill}>
                <Text style={styles.indexText}>#{transaction.no ?? '-'}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  paid ? styles.statusDone : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    paid ? styles.statusTextDone : styles.statusTextPending,
                  ]}
                >
                  {paid ? 'ชำระแล้ว' : 'รอชำระ'}
                </Text>
              </View>
            </View>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.metaLine}>
              บ้านเลขที่ {transaction.houseNumber || '-'} ·{' '}
              {transaction.type === 'W' ? 'มิเตอร์น้ำ' : 'มิเตอร์ไฟ'}
            </Text>
            <Text style={styles.totalHero}>
              รวม {formatMoney(transaction.total)} บาท
            </Text>
          </LinearGradient>

          <View style={styles.summaryCard}>
            <MetaRow
              icon="receipt-outline"
              label="ค่าใช้จ่าย"
              value={formatMoney(transaction.amount)}
            />
            <View style={styles.divider} />
            <MetaRow
              icon="time-outline"
              label="ค้างชำระ"
              value={formatMoney(transaction.overDue)}
            />
            <View style={styles.divider} />
            <MetaRow
              icon="wallet-outline"
              label="คงเหลือ"
              value={formatMoney(transaction.remain)}
              emphasize
            />
          </View>

          <View style={styles.payCard}>
            <Text variant="labelLarge" style={styles.payLabel}>
              ยอดที่รับชำระ
            </Text>
            <TextInput
              mode="flat"
              value={pay}
              onChangeText={setPay}
              keyboardType="decimal-pad"
              editable={!paid}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              style={styles.payInput}
              contentStyle={styles.payInputContent}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
            <Text
              variant="bodySmall"
              style={[
                styles.payHint,
                !paid && diffNote ? styles.payHintWarn : null,
              ]}
            >
              {paid
                ? 'รายการนี้ชำระครบแล้ว'
                : (diffNote ?? 'กรอกยอดที่รับจริงจากลูกค้า')}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={
              paid
                ? 'ชำระแล้ว'
                : payMutation.isPending
                  ? 'กำลังบันทึก...'
                  : 'ยืนยันรับชำระ'
            }
            onPress={onPay}
            disabled={payMutation.isPending || paid}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function MetaRow({
  icon,
  label,
  value,
  emphasize,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaLeft}>
        <View style={styles.metaIcon}>
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={styles.metaLabel}>{label}</Text>
      </View>
      <Text style={[styles.metaValue, emphasize && styles.metaEmphasize]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  flex: { flex: 1 },
  body: {
    paddingBottom: 16,
    flexGrow: 1,
  },
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
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPending: {
    backgroundColor: 'rgba(254,244,230,0.95)',
  },
  statusDone: {
    backgroundColor: 'rgba(232,248,240,0.95)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextDone: {
    color: colors.success,
  },
  customerName: {
    fontWeight: '800',
    color: '#FFF',
    fontSize: 24,
    letterSpacing: -0.3,
  },
  metaLine: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
  },
  totalHero: {
    marginTop: 14,
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  metaValue: {
    color: colors.text,
    fontWeight: '700',
  },
  metaEmphasize: {
    color: colors.primary,
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 42,
  },
  payCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  payLabel: {
    color: colors.textMuted,
    marginBottom: 8,
  },
  payInput: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 18,
    marginBottom: 8,
  },
  payInputContent: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '800',
    paddingVertical: 18,
    letterSpacing: 1,
    color: colors.text,
  },
  payHint: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  payHintWarn: {
    color: colors.warning,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
