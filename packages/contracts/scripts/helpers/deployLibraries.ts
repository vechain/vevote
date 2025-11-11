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

export async function deployLibrariesV1() {
  // ---------------------- Version 1 ----------------------
  const VeVoteConfiguratorV1 = await ethers.getContractFactory("VeVoteConfiguratorV1");
  const veVoteConfiguratorV1 = await VeVoteConfiguratorV1.deploy();
  await veVoteConfiguratorV1.waitForDeployment();

  const VeVoteProposalLogicV1 = await ethers.getContractFactory("VeVoteProposalLogicV1");
  const veVoteProposalLogicV1 = await VeVoteProposalLogicV1.deploy();
  await veVoteProposalLogicV1.waitForDeployment();

  const VeVoteQuoromLogicV1 = await ethers.getContractFactory("VeVoteQuorumLogicV1");
  const veVoteQuoromLogicV1 = await VeVoteQuoromLogicV1.deploy();
  await veVoteQuoromLogicV1.waitForDeployment();

  const VeVoteStateLogicV1 = await ethers.getContractFactory("VeVoteStateLogicV1");
  const veVoteStateLogicV1 = await VeVoteStateLogicV1.deploy();
  await veVoteStateLogicV1.waitForDeployment();

  const VeVoteVoteLogicV1 = await ethers.getContractFactory("VeVoteVoteLogicV1");
  const veVoteVoteLogicV1 = await VeVoteVoteLogicV1.deploy();
  await veVoteVoteLogicV1.waitForDeployment();

  return {
    veVoteConfiguratorV1,
    veVoteProposalLogicV1,
    veVoteQuoromLogicV1,
    veVoteStateLogicV1,
    veVoteVoteLogicV1,
  };
}
