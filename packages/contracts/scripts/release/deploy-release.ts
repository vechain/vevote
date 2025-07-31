import { ethers, network } from "hardhat";
import { ContractsConfig } from "@repo/config/contracts/type";
import { HttpNetworkConfig } from "hardhat/types";
import { deployProxy, saveContractsToFile } from "../helpers";
import { VeVote } from "../../typechain-types";
import { deployLibraries } from "../helpers/deployLibraries";

export async function deployAll(config: ContractsConfig) {
  const start = performance.now();
  const networkConfig = network.config as HttpNetworkConfig;
  console.log(
    `================  Deploying VeVote SC on ${networkConfig.url} with ${config.VITE_APP_ENV} configurations `,
  );
  // Contracts are deployed using the first signer/account by default
  const [deployer] = await ethers.getSigners();

  const TEMP_ADMIN = network.name === "vechain_solo" ? config.CONTRACTS_ADMIN_ADDRESS : deployer.address;
  console.log("================================================================================");
  console.log("Temporary admin set to ", TEMP_ADMIN);
  console.log("Final admin will be set to ", config.CONTRACTS_ADMIN_ADDRESS);

  console.log(`================  Address used to deploy: ${deployer.address}`);

  // ---------------------- Deploy Contracts ----------------------
  console.log("================================================================================");
  console.log("Smart Contract Configuration:");
  console.log(`- Quorum Percentage           : ${config.QUORUM_PERCENTAGE}%`);
  console.log(`- Min Voting Delay            : ${config.INITIAL_MIN_VOTING_DELAY} blocks`);
  console.log(`- Min Voting Duration         : ${config.INITIAL_MIN_VOTING_DURATION} blocks`);
  console.log(`- Max Voting Duration         : ${config.INITIAL_MAX_VOTING_DURATION} blocks`);
  console.log(`- Initial Min Staked Amount   : ${ethers.formatEther(config.MIN_VET_STAKE)} VET`);
  console.log(`- Node Management Address     : ${config.NODE_MANAGEMENT_CONTRACT_ADDRESS}`);
  console.log(`- Stargate NFT Address        : ${config.STARGATE_CONTRACT_ADDRESS}`);
  console.log(`- Authority Contract Address  : ${config.AUTHORITY_CONTRACT_ADDRESS}`);
  console.log("--------------------------------------------------------------------------------");
  console.log("Role Configuration:");
  console.log(`- Admin                       : ${TEMP_ADMIN}`);
  console.log(`- Upgrader                    : ${TEMP_ADMIN}`);
  console.log(`- Whitelist Admin             : ${TEMP_ADMIN}`);
  console.log(`- Whitelisted Addresses       : ${[TEMP_ADMIN]}`);
  console.log(`- Settings Manager            : ${TEMP_ADMIN}`);
  console.log(`- Node Weight Manager         : ${TEMP_ADMIN}`);
  console.log(`- Executor                    : ${TEMP_ADMIN}`);
  console.log("================================================================================");

  // ---------------------- Deploy Libraries ----------------------
  console.log("Deploying VeVote libaries...");
  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries();

  console.log("VeVote libaries deployed");
  console.log("Library Addresses:");
  console.log(`- VeVoteConfigurator:     ${await veVoteConfigurator.getAddress()}`);
  console.log(`- VeVoteProposalLogic:    ${await veVoteProposalLogic.getAddress()}`);
  console.log(`- VeVoteQuorumLogic:      ${await veVoteQuoromLogic.getAddress()}`);
  console.log(`- VeVoteStateLogic:       ${await veVoteStateLogic.getAddress()}`);
  console.log(`- VeVoteVoteLogic:        ${await veVoteVoteLogic.getAddress()}`);
  console.log("================================================================================");

  console.log("Deploying VeVote Smart Contract...");
  // Deploy the vevote contract
  const vevote = (await deployProxy(
    "VeVote",
    [
      {
        quorumPercentage: config.QUORUM_PERCENTAGE,
        initialMinVotingDelay: config.INITIAL_MIN_VOTING_DELAY,
        initialMaxVotingDuration: config.INITIAL_MAX_VOTING_DURATION,
        initialMinVotingDuration: config.INITIAL_MIN_VOTING_DURATION,
        nodeManagement: config.NODE_MANAGEMENT_CONTRACT_ADDRESS,
        stargateNFT: config.STARGATE_CONTRACT_ADDRESS,
        authorityContract: config.AUTHORITY_CONTRACT_ADDRESS,
        initialMinStakedAmount: config.MIN_VET_STAKE,
      },
      {
        admin: TEMP_ADMIN,
        upgrader: TEMP_ADMIN,
        whitelist: [TEMP_ADMIN],
        settingsManager: TEMP_ADMIN,
        nodeWeightManager: TEMP_ADMIN,
        executor: TEMP_ADMIN,
        whitelistAdmin: TEMP_ADMIN,
      },
    ],
    {
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteQuorumLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
    },
    true,
  )) as VeVote;

  const date = new Date(performance.now() - start);
  console.log(`================  Contracts deployed in ${date.getMinutes()}m ${date.getSeconds()}s `);

  const contractAddresses: Record<string, string> = {
    vevote: await vevote.getAddress(),
  };

  const libraries: {
    VeVote: Record<string, string>;
  } = {
    VeVote: {
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteQuoromLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
    },
  };
  console.log(`🚀 Deployed VeVote Smart Contract: ${await vevote.getAddress()} 🚀`);
  console.log("================================================================================");
  await saveContractsToFile(contractAddresses, libraries);

  const end = new Date(performance.now() - start);
  console.log(`Total execution time: ${end.getMinutes()}m ${end.getSeconds()}s`);

  console.log("Deployment completed successfully!");
  console.log("================================================================================");

  return {
    vevote,
  };
}
