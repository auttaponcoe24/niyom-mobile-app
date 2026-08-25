import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Switch, Text, TextInput } from 'react-native-paper';

import { MeterCaptureModal } from '@/components/MeterCaptureModal';
import { PrimaryButton } from '@/components/ui';
import { useWork } from '@/context/WorkContext';
import { useSaveUnit } from '@/hooks';
import { colors } from '@/theme/colors';
import type { UnitRow } from '@/types/api';

type Props = {
  unit: UnitRow;
  pageLabel: string;
  onSaved: () => void;
};

function isRecorded(unit: UnitRow) {
  return unit.unitNumber !== null && unit.unitNumber !== undefined;
}

export function UnitMeterForm({ unit, pageLabel, onSaved }: Props) {
  const { month } = useWork();
  const saveUnit = useSaveUnit();
  const alreadyRecorded = isRecorded(unit);

  const [unitNumber, setUnitNumber] = useState(
    alreadyRecorded ? String(unit.unitNumber) : ''
  );
  const [isMeterReplaced, setIsMeterReplaced] = useState(
    unit.isMeterReplaced ?? false
  );
  const [isMeterRolledOver, setIsMeterRolledOver] = useState(
    unit.isMeterRolledOver ?? false
  );
  const [previousMeterReading, setPreviousMeterReading] = useState(
    unit.previousMeterReading != null ? String(unit.previousMeterReading) : ''
  );
  const [cameraOpen, setCameraOpen] = useState(false);

  const customerName =
    `${unit.prefix} ${unit.firstName ?? ''} ${unit.lastName ?? ''}`.trim();

  const onSave = async () => {
    const parsed = Number(unitNumber);
    if (Number.isNaN(parsed)) {
      Alert.alert('กรุณากรอกเลขมิเตอร์', 'ต้องเป็นตัวเลข');
      return;
    }
    if (!unit.zoneId) {
      Alert.alert('ข้อมูลไม่ครบ', 'ไม่พบ zoneId');
      return;
    }

    try {
      await saveUnit.mutateAsync({
        date: month,
        type: unit.type,
        unitNumber: parsed,
        customerId: unit.customerId,
        zoneId: unit.zoneId,
        isMeterReplaced,
        isMeterRolledOver,
        previousMeterReading: isMeterReplaced
          ? Number(previousMeterReading) || 0
          : undefined,
      });
      Alert.alert('บันทึกแล้ว', 'บันทึกเลขมิเตอร์สำเร็จ', [
        { text: 'ตกลง', onPress: onSaved },
      ]);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'บันทึกไม่สำเร็จ';
      Alert.alert('ผิดพลาด', message);
    }
  };

  return (
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
          colors={['#1F6B4A', '#134734']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View style={styles.indexPill}>
              <Text style={styles.indexText}>#{unit.no ?? '-'}</Text>
            </View>
            <View
              style={[
                styles.statusPill,
                alreadyRecorded ? styles.statusDone : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  alreadyRecorded
                    ? styles.statusTextDone
                    : styles.statusTextPending,
                ]}
              >
                {alreadyRecorded ? 'เคยจดแล้ว' : 'ยังไม่จด'}
              </Text>
            </View>
          </View>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.metaLine}>
            บ้านเลขที่ {unit.houseNumber || '-'} ·{' '}
            {unit.type === 'W' ? 'มิเตอร์น้ำ' : 'มิเตอร์ไฟ'}
          </Text>
          <View style={styles.swipeHint}>
            <Ionicons
              name="chevron-back"
              size={14}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.swipeHintText}>
              ปัดซ้าย/ขวาเปลี่ยนคน · {pageLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color="rgba(255,255,255,0.7)"
            />
          </View>
        </LinearGradient>

        <View style={styles.meterCard}>
          <View style={styles.meterHeader}>
            <Text variant="labelLarge" style={styles.meterLabel}>
              เลขมิเตอร์เดือนนี้
            </Text>
            <Pressable
              onPress={() => setCameraOpen(true)}
              style={styles.cameraBtn}
              accessibilityRole="button"
              accessibilityLabel="ถ่ายภาพอ่านเลขมิเตอร์"
            >
              <Ionicons name="camera" size={18} color={colors.primary} />
              <Text style={styles.cameraBtnText}>ถ่ายภาพ</Text>
            </Pressable>
          </View>
          <TextInput
            mode="flat"
            value={unitNumber}
            onChangeText={setUnitNumber}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={styles.meterInput}
            contentStyle={styles.meterInputContent}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            autoFocus={!alreadyRecorded}
          />
          <Text variant="bodySmall" style={styles.meterHint}>
            กรอกเอง หรือถ่ายหน้าปัดให้อยู่ในกรอบเพื่ออ่านเลขอัตโนมัติ
          </Text>
        </View>

        <View style={styles.optionsCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Ionicons
                name="swap-horizontal"
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={styles.optionText}>
              <Text variant="titleSmall" style={styles.optionTitle}>
                เปลี่ยนมิเตอร์
              </Text>
              <Text variant="bodySmall" style={styles.optionHint}>
                มีการเปลี่ยนเครื่องใหม่ในรอบนี้
              </Text>
            </View>
            <Switch
              value={isMeterReplaced}
              onValueChange={setIsMeterReplaced}
              color={colors.primary}
            />
          </View>

          {isMeterReplaced ? (
            <View style={styles.previousWrap}>
              <TextInput
                mode="outlined"
                label="เลขมิเตอร์เครื่องเก่า"
                value={previousMeterReading}
                onChangeText={setPreviousMeterReading}
                keyboardType="number-pad"
                style={styles.previousInput}
              />
            </View>
          ) : null}

          <View style={styles.optionDivider} />

          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text variant="titleSmall" style={styles.optionTitle}>
                มิเตอร์หมุนครบรอบ
              </Text>
              <Text variant="bodySmall" style={styles.optionHint}>
                หน้าปัดหมุนกลับไปเริ่มต้นใหม่
              </Text>
            </View>
            <Switch
              value={isMeterRolledOver}
              onValueChange={setIsMeterRolledOver}
              color={colors.primary}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={saveUnit.isPending ? 'กำลังบันทึก...' : 'บันทึกแล้วกลับรายการ'}
          onPress={onSave}
          disabled={saveUnit.isPending || unitNumber.trim().length === 0}
        />
      </View>

      <MeterCaptureModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onReading={setUnitNumber}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  swipeHint: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  meterCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  meterLabel: {
    color: colors.textMuted,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  cameraBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  meterInput: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 18,
    fontSize: 44,
    marginBottom: 8,
  },
  meterInputContent: {
    textAlign: 'center',
    fontSize: 44,
    fontWeight: '800',
    paddingVertical: 20,
    letterSpacing: 3,
    color: colors.text,
  },
  meterHint: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  optionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  optionHint: {
    marginTop: 2,
    color: colors.textMuted,
  },
  previousWrap: {
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 48,
  },
  previousInput: {
    backgroundColor: colors.surface,
  },
  optionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 8,
    marginLeft: 48,
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
