import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() ||
    'N';
  const roleLabel =
    user?.role === 'ADMIN' ? 'เจ้าหน้าที่' : user?.role === 'USER' ? 'ผู้ใช้งาน' : '-';

  const confirmSignOut = () => {
    Alert.alert('ออกจากระบบ?', 'ครั้งต่อไปต้องขอรหัส OTP ทางมือถือเพื่อเข้าสู่ระบบใหม่', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: () => void signOut(),
      },
    ]);
  };

  const fullName =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'ผู้ใช้งาน';

  return (
    <Screen title="โปรไฟล์" subtitle="บัญชีที่ใช้งานอยู่บนเครื่องนี้">
      <LinearGradient
        colors={['#1F6B4A', '#134734']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <View style={styles.rolePill}>
          <Ionicons name="shield-checkmark" size={14} color="#E8F8F0" />
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </LinearGradient>

      <View style={styles.card}>
        <InfoRow
          icon="call-outline"
          label="เบอร์โทร"
          value={user?.phoneNumber || '-'}
        />
        <View style={styles.divider} />
        <InfoRow icon="mail-outline" label="อีเมล" value={user?.email || '-'} />
        <View style={styles.divider} />
        <InfoRow icon="shield-outline" label="บทบาท" value={roleLabel} />
      </View>

      <View style={styles.hintCard}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.hint}>
          เครื่องนี้จะจำการเข้าสู่ระบบไว้ประมาณ 90 วัน หรือจนกว่าจะกดออกจากระบบ
        </Text>
      </View>

      <SecondaryButton
        label="ออกจากระบบ"
        tone="danger"
        onPress={confirmSignOut}
      />
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 14,
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  rolePill: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  infoValue: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.primaryMuted,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  hint: {
    flex: 1,
    color: colors.primaryDark,
    lineHeight: 20,
    fontSize: 13,
  },
});
