import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Authority } from "../../typechain-types";

export const createValidator = async (
  endorser: HardhatEthersSigner,
  authorityContract: Authority,
  validator: HardhatEthersSigner,
) => {
  const mockIdentity = ethers.encodeBytes32String("vechain-validator");
  await authorityContract.add(validator.address, endorser.address, mockIdentity);
};
