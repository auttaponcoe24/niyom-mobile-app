import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { httpClient } from '@/api/httpClient';
import type { ReceiptRef } from '@/types/api';

const RECEIPT_PREFIX = 'receipt-';

export function removeOldReceipts() {
  try {
    for (const entry of new Directory(Paths.cache).list()) {
      if (entry instanceof File && entry.name.startsWith(RECEIPT_PREFIX)) {
        entry.delete();
      }
    }
  } catch {
    // Cache cleanup is best effort.
  }
}

/**
 * Download a receipt PDF and open the system share sheet (LINE, print, save).
 * Goes through httpClient so an expired access token is refreshed first.
 */
export async function shareReceiptPdf(receipt: ReceiptRef) {
  const { data } = await httpClient.get<ArrayBuffer>(
    `/api/receipts/${receipt.id}/pdf`,
    { responseType: 'arraybuffer' }
  );

  // A receipt holds a resident's name and payment: keep at most the one being
  // shared. (Not deleted right after sharing — the receiving app, e.g. LINE,
  // may still be reading it.)
  removeOldReceipts();

  const file = new File(
    Paths.cache,
    `${RECEIPT_PREFIX}${receipt.receiptNo}.pdf`
  );
  if (file.exists) file.delete();
  file.create();
  file.write(new Uint8Array(data));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('เครื่องนี้ไม่รองรับการแชร์ไฟล์');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: `ใบเสร็จ ${receipt.receiptNo}`,
  });
}
