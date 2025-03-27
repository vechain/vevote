import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"

export interface CreateProposalParams {
  minChoices?: number
  maxChoices?: number
  votingPeriod?: number
  startIn?: number
  choices?: string[]
  description?: string
  proposer?: HardhatEthersSigner
  startTime?: number
}
