import dayjs from 'dayjs';

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

/** Billing month the way the web app shows it: Thai month + Buddhist year, e.g. "ต.ค. 2569". */
export function formatThaiMonth(date: string | Date) {
  const d = dayjs(date);
  return `${THAI_MONTHS_SHORT[d.month()]} ${d.year() + 543}`;
}

export function isCurrentMonth(date: string | Date) {
  return dayjs(date).isSame(dayjs(), 'month');
}
