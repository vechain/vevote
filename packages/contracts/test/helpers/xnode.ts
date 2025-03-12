import { TokenAuction } from "../../typechain-types"
import { getOrDeployContractInstances } from "./deploy"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"

export const createNodeHolder = async (level: number, endorser: HardhatEthersSigner, vechainNodes?: TokenAuction) => {
  const vechainNodesMock = vechainNodes ?? (await getOrDeployContractInstances({})).vechainNodesMock

  await vechainNodesMock.addToken(endorser.address, level, false, 0, 0)

  return await vechainNodesMock.ownerToId(endorser.address)
}
