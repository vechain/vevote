import { getConfig } from "@repo/config";
import { EnvConfig } from "@repo/config/contracts";
import { VeVote } from "../../../typechain-types";
import { upgradeProxy } from "../../helpers";
import { deployLibraries } from "../../helpers/deployLibraries";
async function main() {
  if (!process.env.VITE_APP_ENV) {
    throw new Error("Missing NEXT_PUBLIC_APP_ENV");
  }

  const config = getConfig(process.env.VITE_APP_ENV as EnvConfig);

  console.log(
    `Upgrading VoterRewards contract at address: ${config.vevoteContractAddress} on network: ${config.network.name}`,
  );

  /// --------------- Deploy Libraries --------------- ///
  console.log("Deploying libraries...");

  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries();

  const vevote = (await upgradeProxy("VeVote", "VeVote", config.vevoteContractAddress, [], {
    version: 1,
    libraries: {
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteQuorumLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
    },
  })) as VeVote;

  console.log(`VoterRewards upgraded`);

  // check that upgrade was successful
  const version = await vevote.version();
  console.log(`New VoterRewards version: ${version}`);

  if (version !== 1n) {
    throw new Error(`VoterRewards version is not 1: ${version}`);
  }

  console.log("Execution completed");
  process.exit(0);
}

// Execute the main function
main();
