import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAuth } from '@/context/AuthContext';
import { useOutboxSync } from '@/hooks/useOutboxSync';
import { useIsOffline } from '@/lib/offline';
import { discardOutboxEntry, useOutbox } from '@/lib/outbox';
import { colors } from '@/theme/colors';

/**
 * Tells the worker when the list is an offline copy and how many readings are
 * still on the device, with a manual "send now". Hidden when all is in sync.
 */
export function SyncBanner() {
  const { isAuthenticated } = useAuth();
  const outbox = useOutbox();
  const offline = useIsOffline();
  const { syncNow } = useOutboxSync(isAuthenticated);
  const [busy, setBusy] = useState(false);

  const rejected = outbox.filter((entry) => entry.error);
  const waiting = outbox.length - rejected.length;

  if (!offline && outbox.length === 0) return null;

  const onSync = async () => {
    setBusy(true);
    try {
      const sent = await syncNow();
      if (sent === 0) {
        Alert.alert('ยังส่งไม่ได้', 'ยังไม่มีสัญญาณ ระบบจะลองส่งให้เองอีกครั้ง');
      }
    } finally {
      setBusy(false);
    }
  };

  const onShowRejected = () => {
    const first = rejected[0];
    if (!first) return;
    Alert.alert(
      `ส่งไม่ผ่าน: ${first.label}`,
      `${first.error}\n\nเลขที่จดไว้ ${first.body.unitNumber}`,
      [
        { text: 'ปิด', style: 'cancel' },
        {
          text: 'ลบรายการนี้',
          style: 'destructive',
          onPress: () => discardOutboxEntry(first.key),
        },
      ]
    );
  };

  return (
    <View style={styles.wrap}>
      {offline || waiting > 0 ? (
        <View style={styles.row}>
          <Ionicons
            name="cloud-offline-outline"
            size={18}
            color={colors.warning}
          />
          <Text style={styles.text}>
            {waiting > 0
              ? `รอส่ง ${waiting} รายการ — จะส่งเองเมื่อมีสัญญาณ`
              : 'ไม่มีสัญญาณ — แสดงรายการที่โหลดไว้ล่าสุด'}
          </Text>
          {waiting > 0 ? (
            <Pressable
              onPress={onSync}
              disabled={busy}
              style={styles.action}
              accessibilityRole="button"
            >
              <Text style={styles.actionText}>
                {busy ? 'กำลังส่ง...' : 'ส่งตอนนี้'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {rejected.length > 0 ? (
        <Pressable
          onPress={onShowRejected}
          style={[styles.row, styles.rowDanger]}
          accessibilityRole="button"
        >
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={colors.danger}
          />
          <Text style={[styles.text, styles.textDanger]}>
            {`ส่งไม่ผ่าน ${rejected.length} รายการ — แตะเพื่อดู`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningMuted,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowDanger: {
    backgroundColor: colors.dangerMuted,
  },
  text: {
    flex: 1,
    color: colors.warning,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
  },
  textDanger: {
    color: colors.danger,
  },
  action: {
    backgroundColor: colors.warning,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
