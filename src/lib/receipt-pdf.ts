import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { httpClient } from '@/api/httpClient';
import type { ReceiptRef } from '@/types/api';

/**
 * Download a receipt PDF and open the system share sheet (LINE, print, save).
 * Goes through httpClient so an expired access token is refreshed first.
 */
export async function shareReceiptPdf(receipt: ReceiptRef) {
  const { data } = await httpClient.get<ArrayBuffer>(
    `/api/receipts/${receipt.id}/pdf`,
    { responseType: 'arraybuffer' }
  );

  const file = new File(Paths.cache, `${receipt.receiptNo}.pdf`);
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
