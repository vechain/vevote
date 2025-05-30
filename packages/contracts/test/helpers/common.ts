import { ethers, network } from "hardhat";
import { getOrDeployContractInstances } from "./deploy";
import { ContractTransactionResponse } from "ethers";
import { TransactionBody, TransactionClause, ZERO_ADDRESS } from "@vechain/sdk-core";
import { mine, time } from "@nomicfoundation/hardhat-network-helpers";
import { buildTxBody, signAndSendTx } from "../../scripts/helpers/txHelper";
import { getTestKeys } from "../../scripts/helpers/seedAccounts";
import { CreateProposalParams } from "./types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Authority } from "../../typechain-types";

export const getCurrentBlockNumber = async () => {
  const block = await ethers.provider.getBlock("latest");
  if (block === null) {
    throw new Error("Block is null");
  }
  return block.number;
};

export const waitForNextBlock = async () => {
  if (network.name === "hardhat") {
    await mine(1);
    return;
  }

  // since we do not support ethers' evm_mine yet, do a vet transaction to force a block
  const clauses: TransactionClause[] = [];
  clauses.push(clauseBuilder.transferVET(ZERO_ADDRESS, BigInt(1)));

  const accounts = getTestKeys(3);
  const signer = accounts[2];

  const body: TransactionBody = await buildTxBody(clauses, signer.address, 32, 10_000_000);

  if (!signer.pk) throw new Error("No private key");

  return await signAndSendTx(body, signer.pk);
};

export const moveBlocks = async (blocks: number) => {
  for (let i = 0; i < blocks; i++) {
    await waitForNextBlock();
  }
};

export const getProposalIdFromTx = async (tx: ContractTransactionResponse) => {
  const { vevote } = await getOrDeployContractInstances({});
  const proposeReceipt = await tx.wait();
  const event = proposeReceipt?.logs[0];

  const decodedLogs = vevote.interface.parseLog({
    topics: [...(event?.topics as string[])],
    data: event ? event.data : "",
  });

  return decodedLogs?.args[0];
};

export const waitForProposalToStart = async (proposalId: string) => {
  const { vevote } = await getOrDeployContractInstances({});
  const snapshot = parseInt((await vevote.proposalSnapshot(proposalId)).toString()) + 1;
  const currentBlockNumber = await getCurrentBlockNumber();
  await moveBlocks(snapshot - currentBlockNumber);
};

export const waitForProposalToEnd = async (proposalId: string) => {
  const { vevote } = await getOrDeployContractInstances({});
  const deadline = parseInt((await vevote.proposalDeadline(proposalId)).toString()) + 1;
  const currentBlockNumber = await getCurrentBlockNumber();
  await moveBlocks(deadline - currentBlockNumber);
};

export const createProposal = async ({
  minChoices = 1,
  maxChoices = 2,
  votingPeriod = 3,
  startIn = 10,
  choices = [
    ethers.encodeBytes32String("FOR"),
    ethers.encodeBytes32String("AGAINST"),
    ethers.encodeBytes32String("ABSTAIN"),
  ],
  description = "QmPaAAXwS2kGyr63q6iakVT8ybqeYeRLqwqUCYu64mNLME",
  proposer,
  startBlock,
}: CreateProposalParams = {}) => {
  const { vevote, whitelistedAccount } = await getOrDeployContractInstances({});

  const snapshot = startBlock ?? (await getCurrentBlockNumber()) + startIn;
  const proposalCreator = proposer ?? whitelistedAccount;

  return vevote.connect(proposalCreator).propose(description, snapshot, votingPeriod, choices, maxChoices, minChoices);
};

export const createValidator = async (
  endorser: HardhatEthersSigner,
  authorityContract: Authority,
  validator: HardhatEthersSigner,
) => {
  const mockIdentity = ethers.encodeBytes32String("vechain-validator");
  await authorityContract.setValidator(validator.address, true, endorser.address, mockIdentity, true);
};
