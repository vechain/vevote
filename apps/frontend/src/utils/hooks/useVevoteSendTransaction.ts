import { useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EnhancedClause, useSendTransaction, useWallet } from "@vechain/vechain-kit";

export type VevoteTransactionResult = {
  txId: string;
  receipt: Connex.Thor.Transaction.Receipt;
};

export type VevoteTransactionError = {
  error: Error;
  txId?: string;
};

export type VevoteSendTransactionProps<ClausesParams> = {
  clauseBuilder: (props: ClausesParams) => EnhancedClause[];
  refetchQueryKeys?: (string | undefined)[][];
  onSuccess?: (result: VevoteTransactionResult) => void;
  invalidateCache?: boolean;
  onError?: (error: VevoteTransactionError) => void;
};

/**
 * Enhanced hook for building and sending transactions with async result handling.
 * Returns transaction ID and receipt directly from sendTransaction function.
 *
 * @param clauseBuilder - A function that builds an array of enhanced clauses based on the provided parameters.
 * @param refetchQueryKeys - An optional array of query keys to refetch after the transaction is confirmed.
 * @param invalidateCache - A flag indicating whether to invalidate the cache and refetch queries after the transaction is confirmed.
 * @param onSuccess - An optional callback function to be called after the transaction is successfully confirmed.
 * @param onError - An optional callback function to be called if the transaction fails.
 * @returns An object containing transaction state and an async sendTransaction function.
 */
export const useVevoteSendTransaction = <ClausesParams>({
  clauseBuilder,
  refetchQueryKeys,
  invalidateCache = true,
  onSuccess,
  onError,
}: VevoteSendTransactionProps<ClausesParams>) => {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const resolveRef = useRef<((result: VevoteTransactionResult) => void) | null>(null);
  const rejectRef = useRef<((error: VevoteTransactionError) => void) | null>(null);
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCallbackHandledRef = useRef(false);

  const handleCacheInvalidation = useCallback(async () => {
    if (invalidateCache && refetchQueryKeys) {
      await Promise.all(
        refetchQueryKeys.map(async queryKey => {
          await queryClient.cancelQueries({ queryKey });
          await queryClient.refetchQueries({ queryKey });
        }),
      );
    }
  }, [invalidateCache, queryClient, refetchQueryKeys]);

  const cleanupRefs = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    resolveRef.current = null;
    rejectRef.current = null;
    isProcessingRef.current = false;
    hasCallbackHandledRef.current = false;
  }, []);

  const {
    sendTransaction: originalSendTransaction,
    txReceipt,
    status,
    error,
    ...rest
  } = useSendTransaction({
    signerAccountAddress: account?.address,
    onTxFailedOrCancelled: async callbackError => {
      if (!isProcessingRef.current || hasCallbackHandledRef.current) {
        return;
      }

      hasCallbackHandledRef.current = true;

      const vevoteError: VevoteTransactionError = {
        error: callbackError instanceof Error ? callbackError : new Error(String(callbackError)),
        txId: txReceipt?.meta.txID,
      };

      onError?.(vevoteError);

      if (rejectRef.current) {
        rejectRef.current(vevoteError);
      }

      cleanupRefs();
    },
  });

  useEffect(() => {
    if (!isProcessingRef.current || !resolveRef.current || !rejectRef.current || hasCallbackHandledRef.current) {
      return;
    }

    if (status === "success" && txReceipt?.meta.txID) {
      hasCallbackHandledRef.current = true;

      if (txReceipt.reverted) {
        const vevoteError: VevoteTransactionError = {
          error: new Error("Transaction was reverted"),
          txId: txReceipt.meta.txID,
        };

        onError?.(vevoteError);
        rejectRef.current?.(vevoteError);
        cleanupRefs();
      } else {
        const result: VevoteTransactionResult = {
          txId: txReceipt.meta.txID,
          receipt: txReceipt,
        };

        handleCacheInvalidation()
          .then(() => {
            onSuccess?.(result);
            resolveRef.current?.(result);
            cleanupRefs();
          })
          .catch(cacheError => {
            console.warn("Cache invalidation failed:", cacheError);
            onSuccess?.(result);
            resolveRef.current?.(result);
            cleanupRefs();
          });
      }
    } else if (status === "error") {
      hasCallbackHandledRef.current = true;

      const vevoteError: VevoteTransactionError = {
        error: error instanceof Error ? error : new Error(error?.reason || "Transaction failed"),
        txId: txReceipt?.meta.txID,
      };

      onError?.(vevoteError);
      rejectRef.current?.(vevoteError);

      cleanupRefs();
    }
  }, [status, txReceipt, error, handleCacheInvalidation, onSuccess, onError, cleanupRefs]);

  useEffect(() => {
    return () => {
      if (isProcessingRef.current && rejectRef.current) {
        rejectRef.current({
          error: new Error("Component unmounted during transaction"),
        });
      }
      cleanupRefs();
    };
  }, [cleanupRefs]);

  const sendTransaction = useCallback(
    async (props: ClausesParams): Promise<VevoteTransactionResult> => {
      if (isProcessingRef.current) {
        throw new Error("Transaction already in progress");
      }

      return new Promise<VevoteTransactionResult>((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
        isProcessingRef.current = true;
        hasCallbackHandledRef.current = false;

        const minutes = 3;

        timeoutRef.current = setTimeout(
          () => {
            if (isProcessingRef.current && rejectRef.current && !hasCallbackHandledRef.current) {
              const vevoteError: VevoteTransactionError = {
                error: new Error(`Transaction timed out after ${minutes} minutes`),
              };

              onError?.(vevoteError);
              rejectRef.current(vevoteError);
              cleanupRefs();
            }
          },
          minutes * 60 * 1000,
        );

        try {
          const clauses = clauseBuilder(props);

          originalSendTransaction(clauses).catch(sendError => {
            if (!hasCallbackHandledRef.current) {
              hasCallbackHandledRef.current = true;

              const vevoteError: VevoteTransactionError = {
                error: sendError instanceof Error ? sendError : new Error(String(sendError)),
              };

              onError?.(vevoteError);
              reject(vevoteError);
              cleanupRefs();
            }
          });
        } catch (error) {
          const vevoteError: VevoteTransactionError = {
            error: error instanceof Error ? error : new Error(String(error)),
          };

          onError?.(vevoteError);
          reject(vevoteError);
          cleanupRefs();
        }
      });
    },
    [clauseBuilder, originalSendTransaction, onError, cleanupRefs],
  );

  return {
    txReceipt,
    status,
    ...rest,
    sendTransaction,
  };
};
