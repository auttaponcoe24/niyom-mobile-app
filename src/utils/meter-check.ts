export type ReadingCheck = {
  /** Units used this round (new − previous); null when it cannot be worked out. */
  used: number | null;
  /** Thai message when the reading looks wrong; the worker may still save it. */
  warning: string | null;
};

/** Usage this many times last round's (and at least MIN_HIGH_USAGE units) is flagged. */
const HIGH_USAGE_FACTOR = 3;
const MIN_HIGH_USAGE = 20;

/**
 * Sanity-check a meter reading against last round's reading. The API accepts
 * any number, so this is the only guard against a mistyped dial.
 */
export function checkReading(input: {
  reading: number;
  previous: number | null | undefined;
  previousUsed: number | null | undefined;
  isMeterReplaced: boolean;
  isMeterRolledOver: boolean;
}): ReadingCheck {
  const { reading, previous, previousUsed } = input;
  if (previous == null || Number.isNaN(reading)) {
    return { used: null, warning: null };
  }
  // A new or rolled-over dial legitimately restarts below the old reading.
  if (input.isMeterReplaced || input.isMeterRolledOver) {
    return { used: null, warning: null };
  }

  const used = reading - previous;
  if (used < 0) {
    return {
      used,
      warning: `เลขน้อยกว่าเดือนก่อน (${previous.toLocaleString()}) — ถ้าเปลี่ยนมิเตอร์หรือมิเตอร์หมุนครบรอบ ให้เปิดตัวเลือกด้านล่าง`,
    };
  }
  if (
    previousUsed != null &&
    previousUsed > 0 &&
    used >= MIN_HIGH_USAGE &&
    used > previousUsed * HIGH_USAGE_FACTOR
  ) {
    return {
      used,
      warning: `ใช้ ${used.toLocaleString()} หน่วย สูงกว่าเดือนก่อนมาก (${previousUsed.toLocaleString()} หน่วย) — ตรวจเลขอีกครั้ง`,
    };
  }
  return { used, warning: null };
}
