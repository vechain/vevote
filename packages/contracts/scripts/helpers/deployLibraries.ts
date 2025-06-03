import { ethers } from "hardhat";

export async function deployLibraries() {
  // ---------------------- Version 1 ----------------------
  const VeVoteConfigurator = await ethers.getContractFactory("VeVoteConfigurator");
  const veVoteConfigurator = await VeVoteConfigurator.deploy();
  await veVoteConfigurator.waitForDeployment();

  const VeVoteProposalLogic = await ethers.getContractFactory("VeVoteProposalLogic");
  const veVoteProposalLogic = await VeVoteProposalLogic.deploy();
  await veVoteProposalLogic.waitForDeployment();

  const VeVoteQuoromLogic = await ethers.getContractFactory("VeVoteQuorumLogic");
  const veVoteQuoromLogic = await VeVoteQuoromLogic.deploy();
  await veVoteQuoromLogic.waitForDeployment();

  const VeVoteStateLogic = await ethers.getContractFactory("VeVoteStateLogic");
  const veVoteStateLogic = await VeVoteStateLogic.deploy();
  await veVoteStateLogic.waitForDeployment();

  const VeVoteVoteLogic = await ethers.getContractFactory("VeVoteVoteLogic");
  const veVoteVoteLogic = await VeVoteVoteLogic.deploy();
  await veVoteVoteLogic.waitForDeployment();

  return {
    veVoteConfigurator,
    veVoteProposalLogic,
    veVoteQuoromLogic,
    veVoteStateLogic,
    veVoteVoteLogic,
  };
}
