// Core contracts
import VeVoteContractJson from "./artifacts/contracts/VeVote.sol/VeVote.json";
import VeVoteProxyContractJson from "./artifacts/contracts/VeVoteProxy.sol/VeVoteProxy.json";

// Governance logic & storage
import VeVoteConfiguratorJson from "./artifacts/contracts/governance/libraries/VeVoteConfigurator.sol/VeVoteConfigurator.json";
import VeVoteProposalLogicJson from "./artifacts/contracts/governance/libraries/VeVoteProposalLogic.sol/VeVoteProposalLogic.json";
import VeVoteQuorumLogicJson from "./artifacts/contracts/governance/libraries/VeVoteQuorumLogic.sol/VeVoteQuorumLogic.json";
import VeVoteStateLogicJson from "./artifacts/contracts/governance/libraries/VeVoteStateLogic.sol/VeVoteStateLogic.json";
import VeVoteVoteLogicJson from "./artifacts/contracts/governance/libraries/VeVoteVoteLogic.sol/VeVoteVoteLogic.json";
import VeVoteConstantsJson from "./artifacts/contracts/governance/libraries/VeVoteConstants.sol/VeVoteConstants.json";
import VeVoteTypesJson from "./artifacts/contracts/governance/libraries/VeVoteTypes.sol/VeVoteTypes.json";

// Governance sub-libraries
import VeVoteClockLogicJson from "./artifacts/contracts/governance/libraries/VeVoteClockLogic.sol/VeVoteClockLogic.json";

// TypeChain factories
export {
  VeVote__factory,
  VeVoteProxy__factory,
  VeVoteConfigurator__factory,
  VeVoteProposalLogic__factory,
  VeVoteQuorumLogic__factory,
  VeVoteStateLogic__factory,
  VeVoteVoteLogic__factory,
  VeVoteStorage__factory,
} from "./typechain-types";

// Export ABIs + bytecode JSON
export {
  VeVoteContractJson,
  VeVoteProxyContractJson,
  VeVoteConfiguratorJson,
  VeVoteProposalLogicJson,
  VeVoteQuorumLogicJson,
  VeVoteStateLogicJson,
  VeVoteVoteLogicJson,
  VeVoteConstantsJson,
  VeVoteTypesJson,
  VeVoteClockLogicJson,
};
