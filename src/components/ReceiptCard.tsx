import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { SecondaryButton } from '@/components/ui';
import { useGetReceipt } from '@/hooks';
import { shareReceiptPdf } from '@/lib/receipt-pdf';
import { colors } from '@/theme/colors';

/** Receipt of a paid bill: its number, and the PDF to show or send to the resident. */
export function ReceiptCard({ transactionId }: { transactionId: number }) {
  const receiptQuery = useGetReceipt(transactionId);
  const [sharing, setSharing] = useState(false);
  const receipt = receiptQuery.data;

  const onShare = async () => {
    if (!receipt) return;
    setSharing(true);
    try {
      await shareReceiptPdf(receipt);
    } catch {
      Alert.alert('เปิดใบเสร็จไม่สำเร็จ', 'ตรวจสัญญาณอินเทอร์เน็ตแล้วลองใหม่');
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={colors.success}
          />
        </View>
        <View style={styles.text}>
          <Text style={styles.label}>ใบเสร็จรับเงิน</Text>
          {receiptQuery.isLoading ? (
            <ActivityIndicator animating size="small" color={colors.primary} />
          ) : (
            <Text style={styles.number}>
              {receipt ? receipt.receiptNo : 'ไม่พบใบเสร็จของบิลนี้'}
            </Text>
          )}
        </View>
      </View>
      {receipt ? (
        <SecondaryButton
          label={sharing ? 'กำลังเปิด...' : 'เปิด / แชร์ใบเสร็จ (PDF)'}
          onPress={onShare}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-start',
  },
  label: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  number: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
});
