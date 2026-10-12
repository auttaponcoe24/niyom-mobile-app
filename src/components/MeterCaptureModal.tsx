import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { recognizeMeterReading } from '@/utils/meter-ocr';

type Props = {
  visible: boolean;
  onClose: () => void;
  onReading: (digits: string) => void;
};

/** Crop ratios matching the on-screen focus frame (center band). */
const CROP = {
  originXRatio: 0.12,
  originYRatio: 0.38,
  widthRatio: 0.76,
  heightRatio: 0.2,
} as const;

export function MeterCaptureModal({ visible, onClose, onReading }: Props) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  // Meter boxes are often dark; off again every time the camera closes.
  const [torch, setTorch] = useState(false);

  const close = () => {
    setTorch(false);
    onClose();
  };

  const ensurePermission = async () => {
    if (permission?.granted) return true;
    const next = await requestPermission();
    return next.granted;
  };

  const onCapture = async () => {
    if (busy) return;
    const ok = await ensurePermission();
    if (!ok) {
      Alert.alert('ต้องการกล้อง', 'อนุญาตการใช้กล้องเพื่อถ่ายหน้าปัดมิเตอร์');
      return;
    }
    if (!cameraRef.current) return;

    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (!photo?.uri || !photo.width || !photo.height) {
        Alert.alert('ถ่ายไม่สำเร็จ', 'ลองใหม่อีกครั้ง');
        return;
      }

      const cropped = await manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX: Math.round(photo.width * CROP.originXRatio),
              originY: Math.round(photo.height * CROP.originYRatio),
              width: Math.round(photo.width * CROP.widthRatio),
              height: Math.round(photo.height * CROP.heightRatio),
            },
          },
        ],
        { compress: 0.92, format: SaveFormat.JPEG }
      );

      const { digits, available } = await recognizeMeterReading(cropped.uri);

      if (!available) {
        Alert.alert(
          'ยังอ่านเลขอัตโนมัติไม่ได้',
          'ฟีเจอร์ OCR ใช้ได้บน development build เท่านั้น (ไม่รองรับ Expo Go) — กรอกเลขด้วยมือชั่วคราวได้'
        );
        return;
      }

      if (!digits) {
        Alert.alert(
          'อ่านเลขไม่สำเร็จ',
          'จัดกรอบให้ครอบตัวเลขหน้าปัดแล้วถ่ายใหม่ หรือกรอกมือ'
        );
        return;
      }

      onReading(digits);
      close();
    } catch {
      Alert.alert('ผิดพลาด', 'ถ่ายหรืออ่านรูปไม่สำเร็จ ลองใหม่');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={close}
            hitSlop={12}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="ปิดกล้อง"
          >
            <Ionicons name="close" size={22} color="#FFF" />
          </Pressable>
          <Text variant="titleMedium" style={styles.topTitle}>
            ถ่ายเลขมิเตอร์
          </Text>
          <Pressable
            onPress={() => setTorch((on) => !on)}
            hitSlop={12}
            style={[styles.closeBtn, torch && styles.torchOn]}
            accessibilityRole="button"
            accessibilityLabel={torch ? 'ปิดไฟฉาย' : 'เปิดไฟฉาย'}
            accessibilityState={{ selected: torch }}
          >
            <Ionicons
              name={torch ? 'flashlight' : 'flashlight-outline'}
              size={20}
              color={torch ? '#134734' : '#FFF'}
            />
          </Pressable>
        </View>

        <View style={styles.cameraWrap}>
          {permission && !permission.granted ? (
            <View style={styles.permissionBox}>
              <Text variant="titleMedium" style={styles.permissionTitle}>
                ต้องการสิทธิ์กล้อง
              </Text>
              <Text variant="bodyMedium" style={styles.permissionHint}>
                เพื่อถ่ายหน้าปัดแล้วอ่านตัวเลขอัตโนมัติ
              </Text>
              <Pressable
                style={styles.permissionBtn}
                onPress={requestPermission}
              >
                <Text style={styles.permissionBtnText}>อนุญาตกล้อง</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
                mode="picture"
                enableTorch={torch}
              />
              <View pointerEvents="none" style={styles.overlay}>
                <View style={styles.maskTop} />
                <View style={styles.frameRow}>
                  <View style={styles.maskSide} />
                  <View style={styles.frame}>
                    <View style={[styles.corner, styles.tl]} />
                    <View style={[styles.corner, styles.tr]} />
                    <View style={[styles.corner, styles.bl]} />
                    <View style={[styles.corner, styles.br]} />
                  </View>
                  <View style={styles.maskSide} />
                </View>
                <View style={styles.maskBottom}>
                  <Text variant="bodyMedium" style={styles.guide}>
                    จัดตัวเลขหน้าปัดให้อยู่ในกรอบ
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <Pressable
            onPress={onCapture}
            disabled={busy || !permission?.granted}
            style={[styles.shutter, busy && styles.shutterDisabled]}
            accessibilityRole="button"
            accessibilityLabel="ถ่ายภาพ"
          >
            {busy ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </Pressable>
          <Text variant="labelLarge" style={styles.footerHint}>
            {busy ? 'กำลังอ่านเลข…' : 'กดถ่ายเมื่อเห็นตัวเลขชัด'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const FRAME_H = 88;

const styles = StyleSheet.create({
  torchOn: {
    backgroundColor: '#FFE08A',
  },
  root: {
    flex: 1,
    backgroundColor: '#0A1510',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  topTitle: {
    color: '#FFF',
    fontWeight: '700',
  },
  cameraWrap: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  maskTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  frameRow: {
    height: FRAME_H,
    flexDirection: 'row',
  },
  maskSide: {
    width: '12%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  frame: {
    flex: 1,
    borderColor: 'rgba(228,242,235,0.95)',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: colors.primaryMuted,
  },
  tl: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  tr: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bl: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  br: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  maskBottom: {
    flex: 1.35,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: 16,
  },
  guide: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  permissionTitle: {
    color: '#FFF',
    fontWeight: '700',
  },
  permissionHint: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 18,
    gap: 10,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  shutterDisabled: {
    opacity: 0.55,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF',
  },
  footerHint: {
    color: 'rgba(255,255,255,0.75)',
  },
});
