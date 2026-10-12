import { useCallback, useRef, useState } from 'react';
import { Platform, StatusBar, type View } from 'react-native';

/**
 * Distance from the top of the window to a KeyboardAvoidingView, which it needs
 * as `keyboardVerticalOffset` to lift its content fully above the keyboard.
 * Measured rather than hardcoded: the header height differs per device.
 */
export function useKeyboardOffset() {
  const ref = useRef<View>(null);
  const [offset, setOffset] = useState(0);

  const onLayout = useCallback(() => {
    ref.current?.measureInWindow((_x, y) => {
      if (!Number.isFinite(y)) return;
      // Android measures below the status bar, but keyboard positions are
      // from the top of the screen.
      const statusBar =
        Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
      setOffset(y + statusBar);
    });
  }, []);

  return { ref, onLayout, offset };
}
