import { ThorClient } from "@vechain/vechain-kit";
import { TransactionReceipt } from "@vechain/sdk-network";

/**
 * Poll the chain for a transaction receipt until it is found (or timeout after 3 blocks)
 * @param thor ThorClient instance
 * @param id Transaction id
 * @param blocksTimeout Number of blocks to wait before timeout
 * @returns  Transaction receipt
 */
export const pollForReceipt = async (
  thor: ThorClient,
  id?: string,
  blocksTimeout = 3,
): Promise<TransactionReceipt> => {
  // uncomment to debug unknown status modal
  // throw new Error("debug unknown modal")

  if (!id) throw new Error("No transaction id provided");

  let receipt: TransactionReceipt | null = null;

  //Query the transaction until it has a receipt
  //Timeout after blocksTimeout attempts
  for (let i = 0; i < blocksTimeout; i++) {
    try {
      receipt = await thor.transactions.getTransactionReceipt(id);
      if (receipt) {
        break;
      }
    } catch (error) {
      // Transaction might not be mined yet, continue polling
    }
    
    // Wait for next block - simple delay instead of ticker
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
  }

  if (!receipt) {
    throw new Error("Transaction receipt not found after timeout");
  }

  return receipt;
};