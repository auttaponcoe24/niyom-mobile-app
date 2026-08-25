const LOOKALIKES: Record<string, string> = {
  O: '0',
  o: '0',
  I: '1',
  l: '1',
  S: '5',
  B: '8',
  Z: '2',
};

/** Pull the most likely meter dial digits from OCR text. */
export function extractMeterDigits(raw: string): string | null {
  const normalized = raw
    .split('')
    .map((ch) => LOOKALIKES[ch] ?? ch)
    .join('');

  const runs = normalized.match(/\d(?:[\d\s.,]*\d)?/g);
  if (!runs?.length) {
    const loose = normalized.replace(/\D/g, '');
    return loose.length > 0 ? loose : null;
  }

  let best = '';
  for (const run of runs) {
    const digits = run.replace(/\D/g, '');
    if (digits.length > best.length) best = digits;
  }

  if (!best) return null;
  // Dial readings are usually 4–8 digits; keep the trailing window if OCR glued extras.
  if (best.length > 8) return best.slice(-8);
  return best;
}

export async function recognizeMeterReading(
  imageUri: string
): Promise<{ digits: string | null; available: boolean }> {
  try {
    const mlkit = await import('expo-mlkit-ocr');
    if (!mlkit.isSupported()) {
      return { digits: null, available: false };
    }
    const result = await mlkit.recognizeText(imageUri);
    return { digits: extractMeterDigits(result.text), available: true };
  } catch {
    return { digits: null, available: false };
  }
}
