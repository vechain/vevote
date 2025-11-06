import { getConfig } from "@repo/config";
import { EnvConfig, getContractsConfig } from "@repo/config/contracts";
import { VeVote } from "../../../typechain-types";
import { upgradeProxy } from "../../helpers";
import { deployLibraries } from "../../helpers/deployLibraries";
import { AddressLike } from "ethers";
async function main() {
  if (!process.env.VITE_APP_ENV) {
    throw new Error("Missing NEXT_PUBLIC_APP_ENV");
  }

  const config = getConfig(process.env.VITE_APP_ENV as EnvConfig);
  const contractsConfig = getContractsConfig(process.env.VITE_APP_ENV as EnvConfig);

  console.log(
    `Upgrading VeVote contract at address: ${config.vevoteContractAddress} on network: ${config.network.name}`,
  );

  /// --------------- Deploy Libraries --------------- ///
  console.log("Deploying libraries...");

  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries();

  const vevote = (await upgradeProxy("VeVoteV1", "VeVote", config.vevoteContractAddress, [], {
    version: 2,
    libraries: {
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteQuorumLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
    },
  })) as VeVote;

  console.log(`VeVote upgraded`);

  console.log(
    `Setting Staker contract as Validator contract ${contractsConfig.STAKER_CONTRACT_ADDRESS as AddressLike}`,
  );
  await vevote.setValidatorContract(contractsConfig.STAKER_CONTRACT_ADDRESS as AddressLike);
  const validatorContract = await vevote.getValidatorContract();
  console.log(`Validator contract: ${validatorContract}`);

  // check that upgrade was successful
  const version = await vevote.version();
  console.log(`New VeVote version: ${version}`);

  if (version !== 2n) {
    throw new Error(`VeVote version is not 2: ${version}`);
  }

  console.log("Execution completed");
  process.exit(0);
}

// Execute the main function
main();
