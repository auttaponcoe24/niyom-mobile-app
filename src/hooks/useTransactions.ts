import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mobileGetTransactions, mobilePayTransaction } from '@/api/mobile';
import {
  type TransactionListParams,
  transactionKeys,
} from '@/utils/query-keys';

export function useGetTransactions(
  params: TransactionListParams,
  options?: { enabled?: boolean }
) {
  const queryParams = { page: 1, limit: 100, ...params };
  const enabled = options?.enabled ?? Boolean(params.zoneId && params.date);

  return useQuery({
    queryKey: transactionKeys.list(queryParams),
    queryFn: () => mobileGetTransactions(queryParams),
    enabled,
  });
}

export function usePayTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['pay-transaction'],
    mutationFn: ({
      transactionId,
      pay,
    }: {
      transactionId: string | number;
      pay: number;
    }) => mobilePayTransaction(transactionId, pay),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: transactionKeys.all(),
      });
    },
  });
}
