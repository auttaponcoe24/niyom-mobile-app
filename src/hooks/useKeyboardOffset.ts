import { useCallback, useRef, useState } from 'react';
import type { View } from 'react-native';

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
      if (Number.isFinite(y)) setOffset(y);
    });
  }, []);

  return { ref, onLayout, offset };
}
