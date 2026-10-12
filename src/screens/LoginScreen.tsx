import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  ProgressBar,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mobileRequestOtp } from '@/api/mobile';
import { OtpInput } from '@/components/OtpInput';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

type Step = 'phone' | 'otp';

export function LoginScreen() {
  const { signInWithOtp } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onRequestOtp = async () => {
    const phone = phoneNumber.trim();
    if (phone.length < 9) {
      Alert.alert('กรุณากรอกเบอร์', 'ใส่เบอร์มือถือ 10 หลัก');
      return;
    }
    setSubmitting(true);
    try {
      const result = await mobileRequestOtp(phone);
      setPhoneNumber(result.phoneNumber);
      setDebugOtp(result.debugOtp ?? null);
      setCode('');
      setStep('otp');
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'ขอรหัส OTP ไม่สำเร็จ';
      Alert.alert('ขอรหัสไม่สำเร็จ', message);
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      Alert.alert('รหัสไม่ถูกต้อง', 'ใส่รหัส OTP 6 หลัก');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithOtp(
        phoneNumber.trim(),
        code.trim(),
        Platform.OS === 'ios'
          ? 'iOS'
          : Platform.OS === 'android'
            ? 'Android'
            : 'Mobile'
      );
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'ยืนยัน OTP ไม่สำเร็จ';
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', message);
    } finally {
      setSubmitting(false);
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setCode('');
    setDebugOtp(null);
  };

  const canVerify = /^\d{6}$/.test(code);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#134734', '#1F6B4A', colors.background]}
        locations={[0, 0.32, 0.62]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbSide} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandBlock}>
              <Text variant="displaySmall" style={styles.brandMark}>
                Niyom
              </Text>
              <View style={styles.brandTagWrap}>
                <Text variant="labelMedium" style={styles.brandTag}>
                  งานสนาม
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.brandLine}>
                {step === 'phone'
                  ? 'เข้าสู่ระบบด้วยเบอร์โทรพนักงาน'
                  : 'กรอกรหัสที่ส่งไปยังมือถือของคุณ'}
              </Text>
            </View>

            <Surface style={styles.sheet} elevation={3}>
              <ProgressBar
                progress={step === 'otp' ? 1 : 0.5}
                color={colors.primary}
                style={styles.progress}
              />
              <View style={styles.steps}>
                <Text
                  variant="labelMedium"
                  style={[
                    styles.stepText,
                    step === 'phone' && styles.stepTextOn,
                  ]}
                >
                  เบอร์โทร
                </Text>
                <Text
                  variant="labelMedium"
                  style={[styles.stepText, step === 'otp' && styles.stepTextOn]}
                >
                  รหัส OTP
                </Text>
              </View>

              {step === 'phone' ? (
                <>
                  <Text variant="bodyMedium" style={styles.help}>
                    ระบบจะส่งรหัส 6 หลักไปยังเบอร์ที่ลงทะเบียนไว้
                    สำหรับจดมิเตอร์และรับชำระในสนาม
                  </Text>

                  <TextInput
                    mode="outlined"
                    label="เบอร์โทรศัพท์มือถือ"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="08xxxxxxxx"
                    maxLength={15}
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    style={styles.input}
                  />

                  <Button
                    mode="contained"
                    onPress={onRequestOtp}
                    loading={submitting}
                    disabled={submitting}
                    contentStyle={styles.buttonContent}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                  >
                    ขอรหัส OTP
                  </Button>
                </>
              ) : (
                <>
                  <Text variant="bodySmall" style={styles.sentLabel}>
                    ส่งรหัสไปที่
                  </Text>
                  <Text variant="headlineSmall" style={styles.phoneDisplay}>
                    {phoneNumber}
                  </Text>

                  {debugOtp ? (
                    <Surface style={styles.devHint} elevation={0}>
                      <Text variant="bodySmall" style={styles.devHintText}>
                        Dev เท่านั้น · รหัสอ้างอิง {debugOtp} (กรอกเองด้านล่าง)
                      </Text>
                    </Surface>
                  ) : null}

                  <Text variant="labelLarge" style={styles.otpLabel}>
                    รหัส OTP 6 หลัก
                  </Text>
                  <OtpInput value={code} onChange={setCode} autoFocus />

                  <Button
                    mode="contained"
                    onPress={onVerify}
                    loading={submitting}
                    disabled={submitting || !canVerify}
                    contentStyle={styles.buttonContent}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                  >
                    ยืนยันเข้าสู่ระบบ
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={goBackToPhone}
                    style={styles.ghostBtn}
                    contentStyle={styles.buttonContent}
                  >
                    เปลี่ยนเบอร์ / ขอรหัสใหม่
                  </Button>
                </>
              )}
            </Surface>

            <Text variant="bodySmall" style={styles.footnote}>
              ใช้ได้เฉพาะบัญชีเจ้าหน้าที่ที่ลงทะเบียนเบอร์โทรไว้
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 36,
  },
  orbTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orbSide: {
    position: 'absolute',
    top: 120,
    left: -70,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(228,242,235,0.18)',
  },
  brandBlock: {
    marginBottom: 24,
    paddingTop: 8,
  },
  brandMark: {
    fontWeight: '800',
    letterSpacing: -1.2,
    color: '#FFFFFF',
  },
  brandTagWrap: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  brandTag: {
    color: '#E8F6EF',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  brandLine: {
    marginTop: 14,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '500',
    maxWidth: 300,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  progress: {
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.background,
    marginBottom: 10,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  stepText: {
    fontWeight: '600',
    color: colors.textMuted,
  },
  stepTextOn: {
    color: colors.primary,
    fontWeight: '700',
  },
  help: {
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: 20,
  },
  sentLabel: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  phoneDisplay: {
    fontWeight: '800',
    letterSpacing: 0.4,
    color: colors.text,
    marginBottom: 12,
  },
  devHint: {
    marginBottom: 14,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  devHintText: {
    lineHeight: 18,
    color: colors.warning,
  },
  otpLabel: {
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    marginBottom: 18,
    backgroundColor: colors.background,
  },
  button: {
    borderRadius: 16,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  ghostBtn: {
    marginTop: 12,
    borderRadius: 16,
    borderColor: colors.border,
  },
  footnote: {
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 18,
    color: colors.textMuted,
    paddingHorizontal: 12,
  },
});
