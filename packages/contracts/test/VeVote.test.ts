import { ethers } from "hardhat";
import { expect } from "chai";
import { getOrDeployContractInstances } from "./helpers";
import { describe, it } from "mocha";
import { createLocalConfig } from "@repo/config/contracts/envs/local";
import {
  createProposal,
  createValidator,
  getCurrentBlockNumber,
  getProposalIdFromTx,
  waitForNextBlock,
  waitForProposalToEnd,
  waitForProposalToStart,
} from "./helpers/common";
import { createNodeHolder, TokenLevelId } from "../scripts/helpers";
import { ZeroAddress, zeroPadBytes } from "ethers";

describe("VeVote", function () {
  describe("Deployment", function () {
    it("should deploy the contract", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      expect(await vevote.getAddress()).to.be.a("string");
    });

    it("correct contract version should be set", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      expect(await vevote.version()).to.equal(1);
    });

    it("should set the correct admin address", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({});
      expect(await vevote.hasRole(await vevote.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("should set the correct initilization parameters", async function () {
      const config = createLocalConfig();
      const { vevote, nodeManagement, stargateNFT } = await getOrDeployContractInstances({});
      expect(await vevote["quorumNumerator()"]()).to.equal(config.QUORUM_PERCENTAGE);
      expect(await vevote.getMinVotingDelay()).to.equal(config.INITIAL_MIN_VOTING_DELAY);
      expect(await vevote.getMaxVotingDuration()).to.equal(config.INITIAL_MAX_VOTING_DURATION);
      expect(await vevote.getMinVotingDuration()).to.equal(config.INITIAL_MIN_VOTING_DURATION);
      expect(await vevote.getMaxChoices()).to.equal(config.INITIAL_MAX_CHOICES);
      expect(await vevote.getNodeManagementContract()).to.equal(await nodeManagement.getAddress());
      expect(await vevote.getStargateNFTContract()).to.equal(await stargateNFT.getAddress());
      expect(await vevote.getMinStakedAmount()).to.equal(config.MIN_VET_STAKE);
      expect(await vevote.levelIdMultiplier(1)).to.equal(100);
      expect(await vevote.levelIdMultiplier(2)).to.equal(100);
      expect(await vevote.levelIdMultiplier(3)).to.equal(100);
      expect(await vevote.levelIdMultiplier(4)).to.equal(150);
      expect(await vevote.levelIdMultiplier(5)).to.equal(150);
      expect(await vevote.levelIdMultiplier(6)).to.equal(150);
      expect(await vevote.levelIdMultiplier(7)).to.equal(150);
    });

    it("should should not be able to initlized again", async function () {
      const config = createLocalConfig();
      const { vevote, admin, nodeManagement, stargateNFT } = await getOrDeployContractInstances({});
      await expect(
        vevote.initialize(
          {
            quorumPercentage: config.QUORUM_PERCENTAGE,
            initialMinVotingDelay: config.INITIAL_MIN_VOTING_DELAY,
            initialMaxVotingDuration: config.INITIAL_MAX_VOTING_DURATION,
            initialMinVotingDuration: config.INITIAL_MIN_VOTING_DURATION,
            initialMaxChoices: config.INITIAL_MAX_CHOICES,
            nodeManagement: await nodeManagement.getAddress(),
            stargateNFT: await stargateNFT.getAddress(),
            authorityContract: config.AUTHORITY_CONTRACT_ADDRESS,
            initialMinStakedAmount: config.MIN_VET_STAKE,
          },
          {
            admin: admin.address,
            upgrader: admin.address,
            whitelist: [admin.address],
            settingsManager: admin.address,
            nodeWeightManager: admin.address,
            executor: admin.address,
          },
        ),
      ).to.be.revertedWithCustomError(vevote, "InvalidInitialization");
    });

    it("Should support ERC 165 interface", async () => {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });

      expect(await vevote.supportsInterface("0x01ffc9a7")).to.equal(true); // ERC165
    });
  });

  describe("Proposal Creation", function () {
    it("Only whitelisted addresses can create proposals", async function () {
      const { vevote, otherAccount } = await getOrDeployContractInstances({});

      await expect(createProposal({ proposer: otherAccount })).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );
    });

    it("Exact same proposal cannot be created twice", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      // Proposal gets created with default values
      await createProposal({
        startBlock: 2741687368,
      });
      // Proposal with same values cannot be created again
      await expect(
        createProposal({
          startBlock: 2741687368,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteUnexpectedProposalState");
    });

    it("Proposal start time must be in the future and at least threshold voting delay in the future", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          startBlock: 0,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidStartBlock");
    });

    it("Voting period must be greater than min voting duration", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          votingPeriod: 0,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidVoteDuration");
    });

    it("Voting period must be less than max voting duration", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          votingPeriod: 100000000000,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidVoteDuration");
    });

    it("Description must be a valid IPFS hash (CID v0)", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          description: "ABCDEDFGHIJ",
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidProposalDescription");

      await expect(
        createProposal({
          description: "QmPaAAXwS2kGyr63q6iakVT8ybqeYeRLqwqUCYu64mNLME",
        }),
      ).to.not.be.reverted;
    });

    it("Maximum choices a user can vote for must be less than or equal to the number of choices", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          maxChoices: 4,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidChoiceCount");
    });

    it("Minimum choices a user can vote for must be greater than maximum", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          minChoices: 3,
          maxChoices: 2,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidSelectionRange");
    });

    it("Minimum choices a user can vote for must be greater than zero", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          minChoices: 0,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidSelectionRange");
    });

    it("Number of choices must be less that max choices threshold", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          maxChoices: 100,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidChoiceCount");
    });

    it("Should revert if max choices a user can select is greater than max choices threshold", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      await expect(
        createProposal({
          maxChoices: 33,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidChoiceCount");
    });

    it("Should store the proposer address correctly", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({});
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      expect(await vevote.proposalProposer(proposalId)).to.equal(whitelistedAccount.address);
    });

    it("Should store the proposal snapshot correctly", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({
        startBlock: 2741687368,
      });
      const proposalId = await getProposalIdFromTx(tx);
      expect(await vevote.proposalSnapshot(proposalId)).to.equal(2741687368);
    });

    it("Should store the proposal deadline duration correctly", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({
        startBlock: 200000000,
        votingPeriod: 10,
      });
      const proposalId = await getProposalIdFromTx(tx);
      expect(await vevote.proposalDeadline(proposalId)).to.equal(200000000 + 10);
    });

    it("Should store the proposal choices correctly", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({
        choices: [
          ethers.encodeBytes32String("FOR"),
          ethers.encodeBytes32String("AGAINST"),
          ethers.encodeBytes32String("ABSTAIN"),
        ],
      });
      const proposalId = await getProposalIdFromTx(tx);
      const choices = await vevote.proposalChoices(proposalId);

      expect(choices.length).to.equal(3);
      expect(ethers.decodeBytes32String(choices[0])).to.equal("FOR");
      expect(ethers.decodeBytes32String(choices[1])).to.equal("AGAINST");
      expect(ethers.decodeBytes32String(choices[2])).to.equal("ABSTAIN");
    });

    it("Should store the minimum and maximum choices correctly", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({
        minChoices: 1,
        maxChoices: 2,
      });
      const proposalId = await getProposalIdFromTx(tx);
      const selectionInfo = await vevote.proposalSelectionRange(proposalId);
      expect(selectionInfo[0]).to.equal(1);
      expect(selectionInfo[1]).to.equal;
    });

    it("Should emit the ProposalCreated event with correct info", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      const choices = [
        ethers.encodeBytes32String("FOR"),
        ethers.encodeBytes32String("AGAINST"),
        ethers.encodeBytes32String("ABSTAIN"),
      ];
      const tx = await createProposal({
        minChoices: 1,
        maxChoices: 2,
        choices,
        description: "bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte",
        startBlock: 200000000,
        votingPeriod: 10,
      });
      await expect(tx)
        .to.emit(vevote, "VeVoteProposalCreated")
        .withArgs(
          await getProposalIdFromTx(tx),
          whitelistedAccount.address,
          "bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte",
          200000000,
          10,
          choices,
          2,
          1,
        );
    });

    it("Should return the proposal id", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      const choices = [
        ethers.encodeBytes32String("FOR"),
        ethers.encodeBytes32String("AGAINST"),
        ethers.encodeBytes32String("ABSTAIN"),
      ];
      const tx = await createProposal({
        minChoices: 1,
        maxChoices: 2,
        choices,
        description: "bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte",
        startBlock: 200000000,
        votingPeriod: 10,
      });

      expect(
        await vevote.hashProposal(
          whitelistedAccount.address,
          200000000,
          10,
          choices,
          ethers.keccak256(ethers.toUtf8Bytes("bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte")),
          2,
          1,
        ),
      ).to.equal(await getProposalIdFromTx(tx));
    });

    it("Should be able to set min and max choices to same value, so user can only vote for one choice", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({
        minChoices: 1,
        maxChoices: 1,
      });
      const proposalId = await getProposalIdFromTx(tx);
      const selectionInfo = await vevote.proposalSelectionRange(proposalId);
      expect(selectionInfo[0]).to.equal(1);
      expect(selectionInfo[1]).to.equal(1);
    });
  });

  describe("Proposal Cancellation", function () {
    it("Admin addresses can cancel proposals", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      expect(await vevote.state(proposalId)).to.equal(0);
      await expect(vevote.connect(admin).cancel(proposalId)).to.not.be.reverted;
      expect(await vevote.state(proposalId)).to.equal(2);
    });

    it("proposers can cancel their own proposal", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({ proposer: whitelistedAccount });
      const proposalId = await getProposalIdFromTx(tx);
      expect(await vevote.state(proposalId)).to.equal(0);
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId)).to.not.be.reverted;
      expect(await vevote.state(proposalId)).to.equal(2);
    });

    it("Non admin or proposer cannot cancel", async function () {
      const { vevote, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      expect(await vevote.state(proposalId)).to.equal(0);
      await expect(vevote.connect(otherAccount).cancel(proposalId)).to.revertedWithCustomError(
        vevote,
        "UnauthorizedAccess",
      );
    });

    it("Only whitelisted addresses can cancel their a proposal when it is PENDING state", async function () {
      const config = createLocalConfig();
      config.QUORUM_PERCENTAGE = 0;
      const { vevote, whitelistedAccount, mjolnirXHolder, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
        config,
      });
      // PENDING -> CANCELLED
      const tx1 = await createProposal();
      const proposalId1 = await getProposalIdFromTx(tx1);
      // ACTIVE
      const tx2 = await createProposal();
      const proposalId2 = await getProposalIdFromTx(tx2);
      // SUCEEDED -> EXECUTED
      const tx4 = await createProposal();
      const proposalId4 = await getProposalIdFromTx(tx4);

      // Should be able to cancel PENDING proposal
      expect(await vevote.state(proposalId1)).to.equal(0);
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId1)).to.not.be.reverted;

      // Should be able to cancel ACTIVE proposal
      await waitForProposalToStart(proposalId2);
      expect(await vevote.state(proposalId2)).to.equal(1);
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId2)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      // Should not be able to cancel SUCEEDED proposal
      await waitForProposalToStart(proposalId4);
      await vevote.connect(mjolnirXHolder).castVote(proposalId4, 1, ZeroAddress);
      await waitForProposalToEnd(proposalId4);
      expect(await vevote.state(proposalId4)).to.equal(4);
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      // Should not be able to cancel EXECUTED proposal
      await vevote.connect(admin).execute(proposalId4);
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      // Should not be able to re-cancel a proposal
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId1)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      await vevote.connect(admin).updateQuorumNumerator(20);

      // DEFEATED
      const tx3 = await createProposal();
      const proposalId3 = await getProposalIdFromTx(tx3);

      // Should not be able to cancel DEFEATED proposal
      await waitForProposalToEnd(proposalId3);
      expect(await vevote.state(proposalId3)).to.equal(3);
      await expect(vevote.connect(admin).cancel(proposalId3)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );
    });

    it("Admins can cancel any proposal when they are in PENDING or ACTIVE state", async function () {
      const config = createLocalConfig();
      config.QUORUM_PERCENTAGE = 0;
      const { vevote, admin, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true, config });
      // PENDING -> CANCELLED
      const tx1 = await createProposal();
      const proposalId1 = await getProposalIdFromTx(tx1);
      // ACTIVE
      const tx2 = await createProposal();
      const proposalId2 = await getProposalIdFromTx(tx2);
      // SUCEEDED -> EXECUTED
      const tx4 = await createProposal();
      const proposalId4 = await getProposalIdFromTx(tx4);

      // Should be able to cancel PENDING proposal
      expect(await vevote.state(proposalId1)).to.equal(0);
      await expect(vevote.connect(admin).cancel(proposalId1)).to.not.be.reverted;

      // Admin should be able to cancel ACTIVE proposal
      await waitForProposalToStart(proposalId2);
      expect(await vevote.state(proposalId2)).to.equal(1);
      await expect(vevote.connect(admin).cancel(proposalId2)).to.not.be.reverted;

      // Should not be able to cancel SUCEEDED proposal
      await waitForProposalToStart(proposalId4);
      await vevote.connect(mjolnirXHolder).castVote(proposalId4, 1, ZeroAddress);
      await waitForProposalToEnd(proposalId4);
      expect(await vevote.state(proposalId4)).to.equal(4);
      await expect(vevote.connect(admin).cancel(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      // Should not be able to cancel EXECUTED proposal
      await vevote.connect(admin).execute(proposalId4);
      await expect(vevote.connect(admin).cancel(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      // Should not be able to re-cancel a proposal
      await expect(vevote.connect(admin).cancel(proposalId1)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      await vevote.connect(admin).updateQuorumNumerator(20);

      // DEFEATED
      const tx3 = await createProposal();
      const proposalId3 = await getProposalIdFromTx(tx3);

      // Should not be able to cancel DEFEATED proposal
      await waitForProposalToEnd(proposalId3);
      expect(await vevote.state(proposalId3)).to.equal(3);
      await expect(vevote.connect(admin).cancel(proposalId3)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );
    });

    it("Should emit the ProposalCancelled event with correct info", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await expect(vevote.connect(admin).cancel(proposalId))
        .to.emit(vevote, "ProposalCanceled")
        .withArgs(proposalId, admin.address, "");
    });

    it("Should emit the ProposalCancelled event with correct info when cancelWithReason is called", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await expect(vevote.connect(admin).cancelWithReason(proposalId, "BAD IDEA"))
        .to.emit(vevote, "ProposalCanceled")
        .withArgs(proposalId, admin.address, "BAD IDEA");
    });

    it("Should return the proposal id", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await expect(vevote.connect(admin).cancel(proposalId)).to.not.be.reverted;
      expect(proposalId).to.equal(await getProposalIdFromTx(tx));
    });
  });

  describe("Proposal Voting", function () {
    it("Should revert if proposal is not in ACTIVE state", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 1, ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "ProposalNotActive",
      );
    });

    it("Should revert if user has already voted", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await vevote.connect(mjolnirXHolder).castVote(proposalId, 1, ZeroAddress);
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 1, ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "AlreadyVoted",
      );
    });

    it("Should revert if a user selects a choice that is not in the proposal", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await expect(
        vevote.connect(mjolnirXHolder).castVote(proposalId, 10000000, ZeroAddress),
      ).to.be.revertedWithCustomError(vevote, "InvalidVoteChoice");
    });

    it("Should revert if a user selects more choices than the maximum allowed", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 7, ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "InvalidVoteChoice",
      );
    });

    it("Should revert if a user selects less choices than the minimum allowed", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 0, ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "InvalidVoteChoice",
      );
    });

    it("Should revert if a user tries to vote that does not own a node or have any delegated nodes", async function () {
      const { vevote, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await expect(vevote.connect(otherAccount).castVote(proposalId, 1, ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "VoterNotEligible",
      );
    });

    it("Should revert if a user tries to get vote weight for a node id that does not exist", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.getNodeVoteWeight(123456789)).to.be.revertedWithCustomError(vevote, "InvalidNodeId");
    });

    it("Should determine vote weight based on all nodes a user owns and has deleagted to them", async function () {
      const { vevote, strengthHolder, veThorXHolder, nodeManagement, stargateNFT } = await getOrDeployContractInstances(
        {
          forceDeploy: true,
        },
      );
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);

      // User owns 1 node with weight 100
      expect(await vevote.getVoteWeight(strengthHolder.address, ZeroAddress)).to.equal(10000);

      const tokenIds = await stargateNFT.idsOwnedBy(veThorXHolder.address);

      // Delegate veThorXHolder to mjolnirXHolder
      await nodeManagement.connect(veThorXHolder).delegateNode(strengthHolder.address, tokenIds[0]);

      // User owns 1 node with weight 100 and has 1 delegated node with weight 9
      expect(await vevote.getVoteWeight(strengthHolder.address, ZeroAddress)).to.equal(19000);

      // Total votes should be 100 + 90 = 190 (19000) scaled by 100
      await vevote.connect(strengthHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.totalVotes(proposalId)).to.equal(19000);
    });

    it("Should determine users vote weight correctly", async function () {
      const {
        vevote,
        admin,
        strengthHolder,
        thunderHolder,
        mjolnirHolder,
        veThorXHolder,
        strengthXHolder,
        thunderXHolder,
        mjolnirXHolder,
        flashHolder,
        lighteningHolder,
        dawnHolder,
        validatorHolder,
      } = await getOrDeployContractInstances({
        forceDeploy: true,
      });

      expect(await vevote.getVoteWeight(admin.address, ZeroAddress)).to.equal(0);
      expect(await vevote.getVoteWeight(validatorHolder.address, admin.address)).to.equal(500000);
      expect(await vevote.getVoteWeight(strengthHolder.address, ZeroAddress)).to.equal(10000);
      expect(await vevote.getVoteWeight(thunderHolder.address, ZeroAddress)).to.equal(50000);
      expect(await vevote.getVoteWeight(mjolnirHolder.address, ZeroAddress)).to.equal(150000);
      expect(await vevote.getVoteWeight(veThorXHolder.address, ZeroAddress)).to.equal(9000);
      expect(await vevote.getVoteWeight(strengthXHolder.address, ZeroAddress)).to.equal(24000);
      expect(await vevote.getVoteWeight(thunderXHolder.address, ZeroAddress)).to.equal(84000);
      expect(await vevote.getVoteWeight(mjolnirXHolder.address, ZeroAddress)).to.equal(234000);
      expect(await vevote.getVoteWeight(flashHolder.address, ZeroAddress)).to.equal(2000);
      expect(await vevote.getVoteWeight(lighteningHolder.address, ZeroAddress)).to.equal(500);
      expect(await vevote.getVoteWeight(dawnHolder.address, ZeroAddress)).to.equal(100);
    });

    it("Should determine vote weight based on all nodes a user owns and has deleagted to them at a certian timepoint", async function () {
      const { vevote, strengthHolder } = await getOrDeployContractInstances({
        forceDeploy: true,
      });

      const timepoint = await getCurrentBlockNumber();

      // User owns 1 node with weight 100 -> 10000 scaled by 100
      expect(await vevote.getVoteWeightAtTimepoint(strengthHolder.address, timepoint, ZeroAddress)).to.equal(10000);
    });

    it("Should not include stargate NFTs that have been minted after the proposal snapshot", async function () {
      const { vevote, otherAccount, admin, stargateNFT } = await getOrDeployContractInstances({
        forceDeploy: true,
      });

      const timepoint = await getCurrentBlockNumber();
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);

      // Mint token for user after voting has started for proposal
      await createNodeHolder(TokenLevelId.Strength, admin, otherAccount, stargateNFT);

      // User owns 1 node with weight 100 -> but minted after timepoint/proposal snapshot so weight should be 0
      expect(await vevote.getVoteWeightAtTimepoint(otherAccount.address, timepoint, ZeroAddress)).to.equal(0);
      // SHould have weight of 100 for current timepoint
      expect(await vevote.getVoteWeight(otherAccount.address, ZeroAddress)).to.equal(10000);

      // Should revert if a user votes aas they have no vote weight for proposal
      await expect(vevote.connect(otherAccount).castVote(proposalId, 1, ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "VoterNotEligible",
      );
    });

    it("Should not include validator weight in vote weight if user is not endorser of master node they passed in", async function () {
      const { vevote, otherAccount, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      });

      const timepoint = await getCurrentBlockNumber();
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);

      // User is not the endorser of the validator node they have passed in
      expect(await vevote.getVoteWeightAtTimepoint(otherAccount.address, timepoint, admin.address)).to.equal(0);

      // Should revert as user is not the endorser of the validator node they passed in
      await expect(vevote.connect(otherAccount).castVote(proposalId, 1, admin.address)).to.be.revertedWithCustomError(
        vevote,
        "VoterNotEligible",
      );
    });

    it("Same master node cannot be used twice for voting", async function () {
      const { vevote, otherAccount, admin, authorityContractMock, validatorHolder } =
        await getOrDeployContractInstances({
          forceDeploy: true,
        });

      // Create another account endorsing same validator node
      await createValidator(otherAccount, authorityContractMock, admin);

      const timepoint = await getCurrentBlockNumber();
      const tx = await createProposal({
        votingPeriod: 10,
      });
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);

      // Both accounts have a vote weight as they are both endorsers, however only one can vote as they are both endorsing same master node.
      expect(await vevote.getVoteWeightAtTimepoint(otherAccount.address, timepoint, admin.address)).to.equal(500000);
      // Set validator account endorsing same validator node
      await createValidator(validatorHolder, authorityContractMock, admin);
      expect(await vevote.getVoteWeightAtTimepoint(validatorHolder.address, timepoint, admin.address)).to.equal(500000);

      // First user casts vote.
      await expect(vevote.connect(validatorHolder).castVote(proposalId, 1, admin.address)).to.not.be.reverted;
      // Set other account endorsing now
      await createValidator(otherAccount, authorityContractMock, admin);
      // Should revert as user is not the master node was already ised for voting
      await expect(vevote.connect(otherAccount).castVote(proposalId, 1, admin.address)).to.be.revertedWithCustomError(
        vevote,
        "VoterNotEligible",
      );
    });

    it("Should normalise the vote weights when calling the getters in the contract", async function () {
      const {
        vevote,
        admin,
        strengthHolder,
        thunderHolder,
        mjolnirHolder,
        veThorXHolder,
        strengthXHolder,
        thunderXHolder,
        mjolnirXHolder,
        flashHolder,
        lighteningHolder,
        dawnHolder,
        validatorHolder,
      } = await getOrDeployContractInstances({
        forceDeploy: true,
      });

      // Normalised users vote weight
      expect(await vevote.getVoteWeight(admin.address, ZeroAddress)).to.equal(0);
      expect(await vevote.getVoteWeight(validatorHolder.address, admin.address)).to.equal(500000);
      expect(await vevote.getVoteWeight(strengthHolder.address, ZeroAddress)).to.equal(10000);
      expect(await vevote.getVoteWeight(thunderHolder.address, ZeroAddress)).to.equal(50000);
      expect(await vevote.getVoteWeight(mjolnirHolder.address, ZeroAddress)).to.equal(150000);
      expect(await vevote.getVoteWeight(veThorXHolder.address, ZeroAddress)).to.equal(9000);
      expect(await vevote.getVoteWeight(strengthXHolder.address, ZeroAddress)).to.equal(24000);
      expect(await vevote.getVoteWeight(thunderXHolder.address, ZeroAddress)).to.equal(84000);
      expect(await vevote.getVoteWeight(mjolnirXHolder.address, ZeroAddress)).to.equal(234000);
      expect(await vevote.getVoteWeight(flashHolder.address, ZeroAddress)).to.equal(2000);
      expect(await vevote.getVoteWeight(lighteningHolder.address, ZeroAddress)).to.equal(500);
      expect(await vevote.getVoteWeight(dawnHolder.address, ZeroAddress)).to.equal(100);
    });

    it("Should return 0 if a user tries to get validator weight when a master address is set to the zero address", async function () {
      const { vevote, validatorHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      expect(await vevote.getValidatorVoteWeight(validatorHolder, ZeroAddress)).to.eql(0n);
    });

    it("Should return 0 if a user tries to get validator weight when a endorser address is set to the zero address", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      expect(await vevote.getValidatorVoteWeight(ZeroAddress, admin.address)).to.eql(0n);
    });

    it("Should return correct validator vote weight=", async function () {
      const { vevote, admin, validatorHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      expect(await vevote.getValidatorVoteWeight(validatorHolder.address, admin.address)).to.eql(500000n);
    });

    it("Should split vote weight evenly between all choices when a user votes", async function () {
      const { vevote, strengthHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);

      // User owns 1 node with weight 100
      expect(await vevote.getVoteWeight(strengthHolder.address, ZeroAddress)).to.equal(10000);

      // Vote weight should be split evenly between all choices
      await vevote.connect(strengthHolder).castVote(proposalId, 3, ZeroAddress);

      // Total votes should be 100
      expect(await vevote.totalVotes(proposalId)).to.equal(10000);
      // Choice 1 should have 50 votes (scaled by 100)
      const votes = await vevote.getProposalVotes(proposalId);
      expect(votes[0].weight).to.equal(5000);
      expect(votes[1].weight).to.equal(5000);
    });

    it("Should update proposal choice tally correctly when a user votes", async function () {
      const { vevote, strengthHolder, validatorHolder, admin, dawnHolder, mjolnirHolder, nodeManagement, stargateNFT } =
        await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({
        votingPeriod: 6,
      });
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);

      // User owns 1 node with weight 100
      expect(await vevote.getVoteWeight(strengthHolder.address, ZeroAddress)).to.equal(10000);

      // Vote weight should be split evenly between all choices
      await vevote.connect(strengthHolder).castVote(proposalId, 3, ZeroAddress);

      // Total votes should be 100
      expect(await vevote.totalVotes(proposalId)).to.equal(10000);
      // Choice 1 should have 50 votes (scaled by 100)
      const votes = await vevote.getProposalVotes(proposalId);
      expect(votes[0].weight).to.equal(5000);
      expect(votes[1].weight).to.equal(5000);
      expect(votes[2].weight).to.equal(0);

      // Another voter votes
      await vevote.connect(validatorHolder).castVote(proposalId, 2, admin.address);

      // Choice 1 should have 50 votes (scaled by 100)
      const votes2 = await vevote.getProposalVotes(proposalId);
      expect(votes2[0].weight).to.equal(5000);
      expect(votes2[1].weight).to.equal(505000); // validatorHolder put all his weight here
      expect(votes2[2].weight).to.equal(0);

      const tokenIds = await stargateNFT.idsOwnedBy(dawnHolder.address);
      await nodeManagement.connect(dawnHolder).delegateNode(mjolnirHolder.address, tokenIds[0]);

      await expect(vevote.connect(dawnHolder).castVote(proposalId, 5, ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "VoterNotEligible",
      );

      // Another voter votes
      await vevote.connect(mjolnirHolder).castVote(proposalId, 5, ZeroAddress); // 150000 + 100

      const votes3 = await vevote.getProposalVotes(proposalId);
      expect(votes3[0].weight).to.equal(80050);
      expect(votes3[1].weight).to.equal(505000);
      expect(votes3[2].weight).to.equal(75050);
    });

    it("Has Voted should return true if user has voted", async function () {
      const { vevote, dawnHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await vevote.connect(dawnHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.hasVoted(proposalId, dawnHolder.address)).to.equal(true);
    });

    it("Should not allow the same node be used more than once for voting", async function () {
      const { vevote, dawnHolder, flashHolder, nodeManagement } = await getOrDeployContractInstances({
        forceDeploy: true,
      });
      const tx = await createProposal({
        votingPeriod: 5,
      });
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);

      expect(await vevote.getVoteWeight(dawnHolder.address, ZeroAddress)).to.equal(100);
      expect(await vevote.getVoteWeight(flashHolder.address, ZeroAddress)).to.equal(2000);

      const tokenId = await nodeManagement.getNodeIds(dawnHolder.address);

      await vevote.connect(dawnHolder).castVote(proposalId, 1, ZeroAddress);

      expect(await vevote.totalVotes(proposalId)).to.equal(100);

      await nodeManagement.connect(dawnHolder).delegateNode(flashHolder.address, tokenId[0]);

      await vevote.connect(flashHolder).castVote(proposalId, 1, ZeroAddress);

      expect(await vevote.getVoteWeight(dawnHolder.address, ZeroAddress)).to.equal(0);
      expect(await vevote.getVoteWeight(flashHolder.address, ZeroAddress)).to.equal(2100);

      expect(await vevote.totalVotes(proposalId)).to.equal(2100); // Doesnt include the extra 100 user got from noce delagation
    });

    it("Should emit the VoteCast event with correct info", async function () {
      const { vevote, dawnHolder, admin, validatorHolder, nodeManagement, stargateNFT, strengthHolder } =
        await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({
        votingPeriod: 10,
      });
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);

      // Delegate some nodes
      const tokenId1 = await stargateNFT.idsOwnedBy(dawnHolder.address);
      await nodeManagement.connect(dawnHolder).delegateNode(validatorHolder.address, tokenId1[0]);
      const tokenId2 = await stargateNFT.idsOwnedBy(strengthHolder.address);
      await nodeManagement.connect(strengthHolder).delegateNode(validatorHolder.address, tokenId2[0]);

      await expect(vevote.connect(validatorHolder).castVote(proposalId, 1, admin.address))
        .to.emit(vevote, "VoteCast")
        .withArgs(validatorHolder.address, proposalId, 1, 510100, "", [tokenId1[0], tokenId2[0]], admin.address);
    });

    it("Should emit the VoteCast event with correct info when castVoteWithReason is cast", async function () {
      const { vevote, dawnHolder, stargateNFT } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      const tokenId1 = await stargateNFT.idsOwnedBy(dawnHolder.address);
      await expect(vevote.connect(dawnHolder).castVoteWithReason(proposalId, 1, "Test Reason", ZeroAddress))
        .to.emit(vevote, "VoteCast")
        .withArgs(dawnHolder.address, proposalId, 1, 100, "Test Reason", [tokenId1[0]], ZeroAddress);
    });

    it("Should return the correct node vote weight", async function () {
      const {
        vevote,
        strengthHolder,
        thunderHolder,
        mjolnirHolder,
        veThorXHolder,
        strengthXHolder,
        thunderXHolder,
        mjolnirXHolder,
        flashHolder,
        lighteningHolder,
        dawnHolder,
        stargateNFT,
      } = await getOrDeployContractInstances({ forceDeploy: false });

      const strengthTokenId = await stargateNFT.idsOwnedBy(strengthHolder);
      const thunderTokenId = await stargateNFT.idsOwnedBy(thunderHolder);
      const mjolnirTokenId = await stargateNFT.idsOwnedBy(mjolnirHolder);
      const veThorXId = await stargateNFT.idsOwnedBy(veThorXHolder);
      const strengthXTokenId = await stargateNFT.idsOwnedBy(strengthXHolder);
      const thunderXTokenId = await stargateNFT.idsOwnedBy(thunderXHolder);
      const mjolnirXTokenId = await stargateNFT.idsOwnedBy(mjolnirXHolder);
      const flashTokenId = await stargateNFT.idsOwnedBy(flashHolder);
      const lighteningTokenId = await stargateNFT.idsOwnedBy(lighteningHolder);
      const dawnTokenId = await stargateNFT.idsOwnedBy(dawnHolder);

      expect(await vevote.getNodeVoteWeight(strengthTokenId[0])).to.equal(10000); // Strength node
      expect(await vevote.getNodeVoteWeight(thunderTokenId[0])).to.equal(50000); // Thunder node
      expect(await vevote.getNodeVoteWeight(mjolnirTokenId[0])).to.equal(150000); // Mjolnir node
      expect(await vevote.getNodeVoteWeight(veThorXId[0])).to.equal(9000); // VeThorX
      expect(await vevote.getNodeVoteWeight(strengthXTokenId[0])).to.equal(24000); // StrengthX
      expect(await vevote.getNodeVoteWeight(thunderXTokenId[0])).to.equal(84000); // ThunderX
      expect(await vevote.getNodeVoteWeight(mjolnirXTokenId[0])).to.equal(234000); // MjolnirX
      expect(await vevote.getNodeVoteWeight(flashTokenId[0])).to.equal(2000); // Flash
      expect(await vevote.getNodeVoteWeight(lighteningTokenId[0])).to.equal(500); // Lightning
      expect(await vevote.getNodeVoteWeight(dawnTokenId[0])).to.equal(100); // Dawn
    });
  });

  describe("Proposal Execution", function () {
    it("Only admin addresses can execute proposals", async function () {
      const config = createLocalConfig();
      config.QUORUM_PERCENTAGE = 0;
      const { vevote, admin, strengthHolder, otherAccount, whitelistedAccount } = await getOrDeployContractInstances({
        forceDeploy: true,
        config,
      });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await vevote.connect(strengthHolder).castVote(proposalId, 1, ZeroAddress);
      await waitForProposalToEnd(proposalId);

      // Should rever if creator tries to execute proposal
      await expect(vevote.connect(whitelistedAccount).execute(proposalId)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );

      // Should revert if non-admin tries to execute proposal
      await expect(vevote.connect(otherAccount).execute(proposalId)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );

      await expect(vevote.connect(admin).execute(proposalId)).to.not.be.reverted;

      expect(await vevote.state(proposalId)).to.equal(5);
    });

    it("Should be able to pass in comment when executing proposals", async function () {
      const config = createLocalConfig();
      config.QUORUM_PERCENTAGE = 0;
      const { vevote, admin, strengthHolder } = await getOrDeployContractInstances({
        forceDeploy: true,
        config,
      });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await vevote.connect(strengthHolder).castVote(proposalId, 1, ZeroAddress);
      await waitForProposalToEnd(proposalId);

      await expect(vevote.connect(admin).executeWithComment(proposalId, "It was executed by me"))
        .to.emit(vevote, "VeVoteProposalExecuted")
        .withArgs(proposalId, "It was executed by me");

      expect(await vevote.state(proposalId)).to.equal(5);
    });

    it("Proposals can only be executed when they are in SUCEEDED state", async function () {
      const config = createLocalConfig();
      config.QUORUM_PERCENTAGE = 0;
      const { vevote, whitelistedAccount, mjolnirXHolder, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
        config,
      });
      // PENDING -> CANCELLED
      const tx1 = await createProposal();
      const proposalId1 = await getProposalIdFromTx(tx1);
      // ACTIVE
      const tx2 = await createProposal();
      const proposalId2 = await getProposalIdFromTx(tx2);
      // SUCEEDED -> EXECUTED
      const tx4 = await createProposal();
      const proposalId4 = await getProposalIdFromTx(tx4);

      // Should not be able to execute PENDING proposal
      expect(await vevote.state(proposalId1)).to.equal(0);
      await expect(vevote.connect(admin).execute(proposalId1)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );
      await vevote.connect(whitelistedAccount).cancel(proposalId1); // Cancel the proposal for tests below

      // Should be able to execute ACTIVE proposal
      await waitForProposalToStart(proposalId2);
      expect(await vevote.state(proposalId2)).to.equal(1);
      await expect(vevote.connect(admin).execute(proposalId2)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      // Should be able to execute a SUCEEDED proposal
      await waitForProposalToStart(proposalId4);
      await vevote.connect(mjolnirXHolder).castVote(proposalId4, 1, ZeroAddress);
      await waitForProposalToEnd(proposalId4);
      expect(await vevote.state(proposalId4)).to.equal(4);
      await expect(vevote.connect(admin).execute(proposalId4)).to.not.be.reverted;
      expect(await vevote.state(proposalId4)).to.equal(5);

      // Should not be able to execute EXECUTED proposal
      await expect(vevote.connect(admin).execute(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      // Should not be able to execute a CANCELLED a proposal
      await expect(vevote.connect(admin).execute(proposalId1)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );

      await vevote.connect(admin).updateQuorumNumerator(20);

      // DEFEATED
      const tx3 = await createProposal();
      const proposalId3 = await getProposalIdFromTx(tx3);

      // Should not be able to cancel DEFEATED proposal
      await waitForProposalToEnd(proposalId3);
      expect(await vevote.state(proposalId3)).to.equal(3);
      await expect(vevote.connect(admin).execute(proposalId3)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      );
    });
  });

  describe("Proposal Quorom", function () {
    it("Should return the correct quorom denominator", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      expect(await vevote.quorumDenominator()).to.equal(100);
    });

    it("Should return the correct quorom numerator", async function () {
      const config = createLocalConfig();
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      expect(await vevote["quorumNumerator()"]()).to.equal(config.QUORUM_PERCENTAGE);
    });

    it("Should revert if min vet stake required is not set at given timepoint", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.quorum(0)).to.be.revertedWithCustomError(vevote, "MinimumStakeNotSetAtTimepoint");
    });

    it("Should return the correct quorom numerator at a given timepoint", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      const prevBlock = await getCurrentBlockNumber();

      expect(await vevote["quorumNumerator(uint48)"](prevBlock)).to.equal(config.QUORUM_PERCENTAGE);
      expect(await vevote["quorumNumerator()"]()).to.equal(config.QUORUM_PERCENTAGE);

      await waitForNextBlock();

      // Set quorom numerator to 50
      await vevote.connect(admin).updateQuorumNumerator(75);

      await waitForNextBlock();
      const currentBlock = await getCurrentBlockNumber();

      expect(await vevote["quorumNumerator(uint48)"](currentBlock)).to.equal(75);
      expect(await vevote["quorumNumerator()"]()).to.equal(75);

      // Time
      expect(await vevote["quorumNumerator(uint48)"](prevBlock)).to.equal(config.QUORUM_PERCENTAGE);
    });

    it("Should return the correct quorom at a given timepoint", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });

      /**
       * Quorum voting power is calculated by scaling VET per node × multiplier, then normalizing by the
       * minimum VET required to own a node (minStake = 10,000 VET).
       *
       * - Each normalized vote weight = (NodeVET × Multiplier) / 10,000
       *
       * Hardcoded 101 Validator Nodes:
       *   - VET: 25,000,000 × 2.0 = 50,000,000 per node
       *   - Normalized: 50,000,000 / 10,000 = 5,000 per node
       *   - Total: 101 × 5,000 = 505,000 normalized weight
       *
       * Additional single instance nodes (1 of each):
       *
       *   - Mjolnir X    : 15,600,000 × 1.5 = 23,400,000 / 10,000 = 2,340
       *   - Thunder X    :  5,600,000 × 1.5 =  8,400,000 / 10,000 =   840
       *   - Strength X   :  1,600,000 × 1.5 =  2,400,000 / 10,000 =   240
       *   - VeThor X     :    600,000 × 1.5 =    900,000 / 10,000 =    90
       *   - Mjolnir      : 15,000,000 × 1.0 = 15,000,000 / 10,000 = 1,500
       *   - Thunder      :  5,000,000 × 1.0 =  5,000,000 / 10,000 =   500
       *   - Strength     :  1,000,000 × 1.0 =  1,000,000 / 10,000 =   100
       *   - Flash*       :    200,000 × 1.0 =    200,000 / 10,000 =    20
       *   - Lightning*   :     50,000 × 1.0 =     50,000 / 10,000 =     5
       *   - Dawn*        :     10,000 × 1.0 =     10,000 / 10,000 =     1
       *
       * Total normalized node voting weight:
       *   = 505,000 (Validators)
       *   + 2,340 + 840 + 240 + 90 + 1,500 + 500 + 100 + 20 + 5 + 1
       *   = **510,636 total normalized voting weight**
       *
       * Quorum is calculated as:
       *   quorum = (510,636 × 20 X 100) / 100 = 10212720
       */

      const block = await getCurrentBlockNumber();
      expect(await vevote.quorum(block)).to.equal(10212720);
    });

    it("Only admin addresses can set the quorom numerator", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(otherAccount).updateQuorumNumerator(75)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );
      await expect(vevote.connect(admin).updateQuorumNumerator(75)).to.not.be.reverted;
    });

    it("Quorom denominator must be less than or equal to the quorom denominator", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).updateQuorumNumerator(101)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteInvalidQuorumFraction",
      );
    });

    it("Event should be emitted when quorom numerator is set", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).updateQuorumNumerator(75))
        .to.emit(vevote, "QuorumNumeratorUpdated")
        .withArgs(config.QUORUM_PERCENTAGE, 75);
    });

    it("Should return true if quorom is reached for a given proposal", async function () {
      const config = createLocalConfig();
      config.INITIAL_MAX_VOTING_DURATION = 100;
      const {
        vevote,
        admin,
        authorityContractMock,
        validatorHolder,
        strengthHolder,
        thunderHolder,
        mjolnirHolder,
        veThorXHolder,
        strengthXHolder,
        thunderXHolder,
        mjolnirXHolder,
        flashHolder,
        lighteningHolder,
        dawnHolder,
        otherAccounts,
      } = await getOrDeployContractInstances({ forceDeploy: true, config });
      await expect(vevote.connect(admin).updateQuorumNumerator(5)) // Quorom should be 5%
        .to.emit(vevote, "QuorumNumeratorUpdated")
        .withArgs(config.QUORUM_PERCENTAGE, 5);

      const tx = await createProposal({
        votingPeriod: 20,
      });
      const block = await getCurrentBlockNumber();
      const proposalId = await getProposalIdFromTx(tx);

      await waitForProposalToStart(proposalId);

      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(validatorHolder).castVote(proposalId, 1, admin.address);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(strengthHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(thunderHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(mjolnirHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(veThorXHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(strengthXHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(thunderXHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(mjolnirXHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(flashHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(lighteningHolder).castVote(proposalId, 1, ZeroAddress);
      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);
      await vevote.connect(dawnHolder).castVote(proposalId, 1, ZeroAddress);

      // 101 Validators hardcoded in contract need to add more to reach quorum
      await createValidator(otherAccounts[0], authorityContractMock, otherAccounts[1]);
      await vevote.connect(otherAccounts[0]).castVote(proposalId, 1, otherAccounts[1].address);

      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);

      await createValidator(otherAccounts[2], authorityContractMock, otherAccounts[3]);
      await vevote.connect(otherAccounts[2]).castVote(proposalId, 1, otherAccounts[3].address);

      expect(await vevote.isQuorumReached(proposalId)).to.eql(false);

      const quorom = await vevote.quorum(block);
      const votes = await vevote.totalVotes(proposalId);

      expect(quorom - votes < 500000n);

      // 101 Validators hardcoded in contract
      await createValidator(otherAccounts[4], authorityContractMock, otherAccounts[5]);
      await vevote.connect(otherAccounts[4]).castVote(proposalId, 1, otherAccounts[5].address);

      expect(await vevote.isQuorumReached(proposalId)).to.eql(true);
    });
  });

  describe("Proposal State", function () {
    it("Should return EXECUTED if contract has been marked as executed", async function () {
      const config = createLocalConfig();
      config.QUORUM_PERCENTAGE = 0;
      const { vevote, admin, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true, config });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await vevote.connect(mjolnirXHolder).castVote(proposalId, 1, ZeroAddress);
      await waitForProposalToEnd(proposalId);
      expect(await vevote.state(proposalId)).to.equal(4);
      await vevote.connect(admin).execute(proposalId);
      expect(await vevote.state(proposalId)).to.equal(5); // EXECUTED
    });

    it("Should return CANCELLED if contract has been marked as cancelled by whitelisted account", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await vevote.connect(whitelistedAccount).cancel(proposalId);
      expect(await vevote.state(proposalId)).to.equal(2); // CANCELLED
    });

    it("Should return CANCELLED if contract has been marked as cancelled by proposer", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({ proposer: whitelistedAccount });
      const proposalId = await getProposalIdFromTx(tx);
      await vevote.connect(whitelistedAccount).cancel(proposalId);
      expect(await vevote.state(proposalId)).to.equal(2); // CANCELLED
    });

    it("Should return PENDING if proposal snapshot is after current timepoint", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      const time = await getCurrentBlockNumber();
      const tx = await createProposal({
        startBlock: time + 1000,
      });
      const proposalId = await getProposalIdFromTx(tx);
      expect(await vevote.state(proposalId)).to.equal(0); // PENDING
    });

    it("Should return ACTIVE if proposal snapshot is before current timepoint but deadline is after", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal({});
      const proposalId = await getProposalIdFromTx(tx);

      await waitForProposalToStart(proposalId);
      expect(await vevote.state(proposalId)).to.equal(1); // ACTIVE
    });

    it("Should return DEFEATED if proposal deadline is before current timepoint and quorom is not reached", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await vevote.connect(mjolnirXHolder).castVote(proposalId, 1, ZeroAddress);
      await waitForProposalToEnd(proposalId);
      // Should not have reachded quorom
      expect(await vevote.state(proposalId)).to.equal(3);
    });

    it("Should return SUCEEDED if proposal deadline is before current timepoint and quorom is reached", async function () {
      const config = createLocalConfig();
      config.QUORUM_PERCENTAGE = 0;
      const { vevote, validatorHolder, admin } = await getOrDeployContractInstances({ forceDeploy: true, config });
      const tx = await createProposal();
      const proposalId = await getProposalIdFromTx(tx);
      await waitForProposalToStart(proposalId);
      await vevote.connect(validatorHolder).castVote(proposalId, 1, admin.address);
      await waitForProposalToEnd(proposalId);
      expect(await vevote.state(proposalId)).to.equal(4); // SUCEEDED
    });

    it("Should throw error if getting state of non existent proposal", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.state(100000)).to.be.revertedWithCustomError(vevote, "VeVoteNonexistentProposal");
    });
  });

  describe("Proposal Configuration", function () {
    it("Only admin addresses ca nset min voting delay", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(otherAccount).setMinVotingDelay(100)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );
      await expect(vevote.connect(admin).setMinVotingDelay(100)).to.not.be.reverted;

      expect(await vevote.getMinVotingDelay()).to.equal(100);
    });

    it("Cannot set min voting delay to 0", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMinVotingDelay(0)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMinVotingDelay",
      );
    });

    it("Should emit an event when min voting delay is set", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMinVotingDelay(1234))
        .to.emit(vevote, "MinVotingDelaySet")
        .withArgs(config.INITIAL_MIN_VOTING_DELAY, 1234);
    });

    it("Only admin addresses can set min voting duration", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(otherAccount).setMinVotingDuration(6)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );
      await expect(vevote.connect(admin).setMinVotingDuration(6)).to.not.be.reverted;

      expect(await vevote.getMinVotingDuration()).to.equal(6);
    });

    it("Cannot set min voting duration to 0", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMinVotingDuration(0)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMinVotingDuration",
      );
    });

    it("Cannot set min voting duration greater or equal than max", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(
        vevote.connect(admin).setMinVotingDuration(config.INITIAL_MAX_VOTING_DURATION),
      ).to.be.revertedWithCustomError(vevote, "InvalidMinVotingDuration");
    });

    it("Should emit an event when min voting duration is set", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMinVotingDuration(6))
        .to.emit(vevote, "MinVotingDurationSet")
        .withArgs(config.INITIAL_MIN_VOTING_DURATION, 6);
    });

    it("Only admin addresses can set max voting duration", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(otherAccount).setMaxVotingDuration(100)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );
      await expect(vevote.connect(admin).setMaxVotingDuration(100)).to.not.be.reverted;

      expect(await vevote.getMaxVotingDuration()).to.equal(100);
    });

    it("Cannot set max voting duration to less than equal min", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(
        vevote.connect(admin).setMaxVotingDuration(config.INITIAL_MIN_VOTING_DURATION),
      ).to.be.revertedWithCustomError(vevote, "InvalidMaxVotingDuration");
    });

    it("Should emit an event when max voting duration is set", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMaxVotingDuration(1234))
        .to.emit(vevote, "MaxVotingDurationSet")
        .withArgs(config.INITIAL_MAX_VOTING_DURATION, 1234);
    });

    it("Only admin addresses can set max choices", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(otherAccount).setMaxVotingDuration(10)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );
      await expect(vevote.connect(admin).setMaxChoices(10)).to.not.be.reverted;

      expect(await vevote.getMaxChoices()).to.equal(10);
    });

    it("Max choices cannot be 0", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMaxChoices(0)).to.be.revertedWithCustomError(vevote, "InvalidMaxChoices");
    });

    it("Max choices cannot be greater than 32", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMaxChoices(33)).to.be.revertedWithCustomError(vevote, "InvalidMaxChoices");
    });

    it("Should emit an event when max choices is set", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMaxChoices(10))
        .to.emit(vevote, "MaxChoicesSet")
        .withArgs(config.INITIAL_MAX_CHOICES, 10);
    });

    it("Only admin addresses can set min vet stake amount", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(otherAccount).setMinStakedVetAmount(1)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      );
      await expect(vevote.connect(admin).setMinStakedVetAmount(1)).to.not.be.reverted;

      expect(await vevote.getMinStakedAmount()).to.equal(1);
    });

    it("Min vet stake amount cannot be 0", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMinStakedVetAmount(0)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMinimumStake",
      );
    });

    it("Should emit an event when base level node is set", async function () {
      const config = createLocalConfig();
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.connect(admin).setMinStakedVetAmount(1))
        .to.emit(vevote, "MinStakedAmountUpdated")
        .withArgs(config.MIN_VET_STAKE, 1);
    });

    it("Should revert if trying to get min staked amount at a time when it wasnt set", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(vevote.getMinStakedAmountAtTimepoint(1)).to.be.revertedWithCustomError(
        vevote,
        "MinimumStakeNotSetAtTimepoint",
      );
    });

    it("Should be able to get min staked amount at timepoint", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true });
      const currentBlock = await getCurrentBlockNumber();
      expect(await vevote.getMinStakedAmountAtTimepoint(currentBlock)).to.eql(10000000000000000000000n);
    });

    it("Only admin address can update node management contract", async function () {
      const { vevote, admin, otherAccount, vechainNodesMock } = await getOrDeployContractInstances({
        forceDeploy: true,
      });
      await expect(
        vevote.connect(otherAccount).setNodeManagementContract(await vechainNodesMock.getAddress()),
      ).to.be.revertedWithCustomError(vevote, "AccessControlUnauthorizedAccount");
      await expect(vevote.connect(admin).setNodeManagementContract(await vechainNodesMock.getAddress())).to.not.be
        .reverted;

      expect(await vevote.getNodeManagementContract()).to.equal(await vechainNodesMock.getAddress());
    });

    it("Cannot set node management contract to ZERO address", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      });
      await expect(vevote.connect(admin).setNodeManagementContract(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "InvalidAddress",
      );
    });

    it("Should emit an event when node management contract updated", async function () {
      const { vevote, admin, vechainNodesMock, nodeManagement } = await getOrDeployContractInstances({
        forceDeploy: true,
      });
      await expect(vevote.connect(admin).setNodeManagementContract(await vechainNodesMock.getAddress()))
        .to.emit(vevote, "NodeManagementContractSet")
        .withArgs(await nodeManagement.getAddress(), await vechainNodesMock.getAddress());
    });

    it("Only admin address can update vechain node contract", async function () {
      const { vevote, otherAccount, nodeManagement } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(
        vevote.connect(otherAccount).setStargateNFTContract(await nodeManagement.getAddress()),
      ).to.be.revertedWithCustomError(vevote, "AccessControlUnauthorizedAccount");
    });

    it("Cannot set vechain node contract to ZERO address", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      });
      await expect(vevote.connect(admin).setNodeManagementContract(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "InvalidAddress",
      );
    });

    it("Should emit an event when vechain node contract updated", async function () {
      const { vevote, admin, nodeManagement, stargateNFT } = await getOrDeployContractInstances({
        forceDeploy: true,
      });
      await expect(vevote.connect(admin).setStargateNFTContract(await nodeManagement.getAddress()))
        .to.emit(vevote, "StargateNFTContractSet")
        .withArgs(await stargateNFT.getAddress(), await nodeManagement.getAddress());
    });

    it("Only admin address can update validator contract", async function () {
      const { vevote, otherAccount, nodeManagement } = await getOrDeployContractInstances({ forceDeploy: true });
      await expect(
        vevote.connect(otherAccount).setValidatorContract(await nodeManagement.getAddress()),
      ).to.be.revertedWithCustomError(vevote, "AccessControlUnauthorizedAccount");
    });

    it("Cannot set validator contract to ZERO address", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      });
      await expect(vevote.connect(admin).setValidatorContract(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        vevote,
        "InvalidAddress",
      );
    });

    it("Should emit an event when validator contract updated", async function () {
      const { vevote, admin, nodeManagement, authorityContractMock } = await getOrDeployContractInstances({
        forceDeploy: true,
      });
      await expect(vevote.connect(admin).setValidatorContract(await nodeManagement.getAddress()))
        .to.emit(vevote, "ValidatorContractSet")
        .withArgs(await authorityContractMock.getAddress(), await nodeManagement.getAddress());

      expect(await vevote.getValidatorContract()).to.eql(await nodeManagement.getAddress());
    });

    it("Only admin address can update node multiplers", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true });
      const nodeMultipliers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      await expect(
        vevote.connect(otherAccount).updateLevelIdMultipliers(nodeMultipliers),
      ).to.be.revertedWithCustomError(vevote, "AccessControlUnauthorizedAccount");
      await expect(vevote.connect(admin).updateLevelIdMultipliers(nodeMultipliers)).to.not.be.reverted;

      expect(await vevote.levelIdMultiplier(0)).to.equal(0);
      expect(await vevote.levelIdMultiplier(1)).to.equal(1);
      expect(await vevote.levelIdMultiplier(2)).to.equal(2);
      expect(await vevote.levelIdMultiplier(3)).to.equal(3);
      expect(await vevote.levelIdMultiplier(4)).to.equal(4);
      expect(await vevote.levelIdMultiplier(5)).to.equal(5);
      expect(await vevote.levelIdMultiplier(6)).to.equal(6);
      expect(await vevote.levelIdMultiplier(7)).to.equal(7);
      expect(await vevote.levelIdMultiplier(8)).to.equal(8);
      expect(await vevote.levelIdMultiplier(9)).to.equal(9);
      expect(await vevote.levelIdMultiplier(10)).to.equal(10);
    });

    it("Should emit an event when stargate node contract updated", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      });

      const nodeMultipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      await expect(vevote.connect(admin).updateLevelIdMultipliers(nodeMultipliers))
        .to.emit(vevote, "VoteMultipliersUpdated")
        .withArgs(nodeMultipliers);
    });
  });

  describe("Proposal Clock", function () {
    it("Should return the current block timestamp", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      const currentBlock = await getCurrentBlockNumber();
      expect(await vevote.clock()).to.equal(currentBlock);
    });

    it("Should return the correct CLOCK_TYPE", async function () {
      const { vevote } = await getOrDeployContractInstances({});
      expect(await vevote.CLOCK_MODE()).to.equal("mode=blocknumber&from=default");
    });
  });
});
