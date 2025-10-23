import { ABIContract, Address, Clause } from "@vechain/sdk-core";
import { SeedAccount } from "./seedAccounts";
import { VeVote, VeVote__factory } from "../../typechain-types";
import { TransactionUtils } from "@repo/utils";
import { getConfig } from "@repo/config";
import { ThorClient } from "@vechain/sdk-network";
import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";
const thorClient = ThorClient.at(getConfig().nodeUrl);

/**
 *  Mint Stargate NFTs for a list of accounts
 */
export const vote = async (
  vevoteAddress: string,
  accounts: SeedAccount[],
  proposalId: bigint,
  support: number, // e.g., 0 = Against, 1 = For, 2 = Abstain
) => {
  console.log(`Casting votes for proposal ID: ${proposalId}...`);

  const abi = ABIContract.ofAbi(VeVote__factory.abi);
  const voteFunction = abi.getFunction("castVote");

  for (const account of accounts) {
    console.log(
      `Account ${account.key.address} voting ${support === 1 ? "FOR" : support === 0 ? "AGAINST" : "ABSTAIN"}`,
    );

    const clause = Clause.callFunction(Address.of(vevoteAddress), voteFunction, [proposalId, support, ZeroAddress]);

    // Send transaction signed by this account's private key
    await TransactionUtils.sendTx(thorClient, [clause], account.key.pk);
  }
};

export const createProposal = async (vevote: VeVote) => {
  console.log("updating max voting duration...");
  const tx1 = await vevote.setMaxVotingDuration(3000); // Set max voting duration to 1000 blocks
  await tx1.wait();
  console.log("max voting duration updated");
  const latestBlock = await ethers.provider.getBlock("latest");
  const snapshot = (latestBlock?.number ?? 0) + 5;

  const tx = await vevote.propose("QmPaAAXwS2kGyr63q6iakVT8ybqeYeRLqwqUCYu64mNLME", snapshot, 2000n);

  const proposeReceipt = await tx.wait();
  const event = proposeReceipt?.logs[0];

  const decodedLogs = vevote.interface.parseLog({
    topics: [...(event?.topics as string[])],
    data: event ? event.data : "",
  });

  // wait for the proposal to be active
  let proposalId = decodedLogs?.args[0];
  while (true) {
    const state = await vevote.state(proposalId);
    if (state === 1n) {
      // 1 means ProposalState.Active
      break;
    }
    console.log(`Waiting for proposal ${proposalId} to become active...`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
  }

  return decodedLogs?.args[0];
};
