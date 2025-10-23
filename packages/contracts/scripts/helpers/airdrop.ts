import { type TransactionClause, Clause, Address, VTHO } from "@vechain/sdk-core";
import { TransactionUtils } from "@repo/utils";
import { TestPk } from "./seedAccounts";
import { chunk } from "./chunk";
import { ThorClient } from "@vechain/sdk-network";
import { getConfig } from "@repo/config";
const thorClient = ThorClient.at(getConfig().nodeUrl);

export const airdropVTHO = async (accounts: Address[], amount: bigint, sourceAccount: TestPk) => {
  console.log(`Airdropping VTHO...`);

  const accountChunks = chunk(accounts, 200);

  for (const accountChunk of accountChunks) {
    const clauses: TransactionClause[] = [];

    accountChunk.forEach(address => {
      clauses.push(Clause.transferVTHOToken(address, VTHO.of(amount)));
    });

    await TransactionUtils.sendTx(thorClient, clauses, sourceAccount.pk);
  }
};
