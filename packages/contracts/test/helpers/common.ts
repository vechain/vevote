import { ethers, network } from "hardhat"
import { getOrDeployContractInstances } from "./deploy"
import { ContractTransactionResponse } from "ethers"
import { clauseBuilder, TransactionBody, TransactionClause } from "@vechain/sdk-core"
import { mine, time } from "@nomicfoundation/hardhat-network-helpers"
import { buildTxBody, signAndSendTx } from "../../scripts/helpers/txHelper"
import { getTestKeys } from "../../scripts/helpers/seedAccounts"
import { CreateProposalParams } from "./types"

export const getCurrentBlockTimestamp = async () => {
  const block = await ethers.provider.getBlock("latest")
  if (block === null) {
    throw new Error("Block is null")
  }
  return block.timestamp
}

export const waitForNextBlock = async () => {
  if (network.name === "hardhat") {
    await mine(1)
    return
  }

  // since we do not support ethers' evm_mine yet, do a vet transaction to force a block
  const clauses: TransactionClause[] = []
  clauses.push(clauseBuilder.transferVET(ethers.zero, BigInt(1)))

  const accounts = getTestKeys(3)
  const signer = accounts[2]

  const body: TransactionBody = await buildTxBody(clauses, signer.address, 32, 10_000_000)

  if (!signer.pk) throw new Error("No private key")

  return await signAndSendTx(body, signer.pk)
}

export const moveBlocks = async (blocks: number) => {
  for (let i = 0; i < blocks; i++) {
    await waitForNextBlock()
  }
}

export const getProposalIdFromTx = async (tx: ContractTransactionResponse) => {
  const { vevote } = await getOrDeployContractInstances({})
  const proposeReceipt = await tx.wait()
  const event = proposeReceipt?.logs[0]

  const decodedLogs = vevote.interface.parseLog({
    topics: [...(event?.topics as string[])],
    data: event ? event.data : "",
  })

  return decodedLogs?.args[0]
}

export const waitForProposalToStart = async (proposalId: string) => {
  const { vevote } = await getOrDeployContractInstances({})
  const snapshot = parseInt((await vevote.proposalSnapshot(proposalId)).toString()) + 1
  await time.setNextBlockTimestamp(snapshot)
  await waitForNextBlock()
}

export const waitForProposalToEnd = async (proposalId: string) => {
  const { vevote } = await getOrDeployContractInstances({})
  const deadline = parseInt((await vevote.proposalDeadline(proposalId)).toString()) + 1
  await time.setNextBlockTimestamp(deadline)
  await waitForNextBlock()
}

export const createProposal = async ({
  minChoices = 1,
  maxChoices = 2,
  votingPeriod = 30,
  startIn = 100,
  choices = [
    ethers.encodeBytes32String("FOR"),
    ethers.encodeBytes32String("AGAINST"),
    ethers.encodeBytes32String("ABSTAIN"),
  ],
  description = "QmPaAAXwS2kGyr63q6iakVT8ybqeYeRLqwqUCYu64mNLME",
  proposer,
  startTime,
}: CreateProposalParams = {}) => {
  const { vevote, whitelistedAccount } = await getOrDeployContractInstances({})

  const snapshot = startTime ?? (await getCurrentBlockTimestamp()) + startIn
  const proposalCreator = proposer ?? whitelistedAccount

  return vevote.connect(proposalCreator).propose(description, snapshot, votingPeriod, choices, maxChoices, minChoices)
}
