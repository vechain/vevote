import { ethers } from "hardhat"
import { expect } from "chai"
import { getOrDeployContractInstances } from "./helpers"
import { describe, it } from "mocha"
import { createLocalConfig } from "@repo/config/contracts/envs/local"
import {
  createProposal,
  getCurrentBlockTimestamp,
  getProposalIdFromTx,
  waitForNextBlock,
  waitForProposalToEnd,
  waitForProposalToStart,
} from "./helpers/common"
import { createNodeHolder } from "./helpers/xnode"
import { time } from "@nomicfoundation/hardhat-network-helpers"

describe("VeVote", function () {
  describe("Deployment", function () {
    it("should deploy the contract", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      expect(await vevote.getAddress()).to.be.a("string")
    })

    it("correct contract version should be set", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      expect(await vevote.version()).to.equal(1)
    })

    it("should set the correct admin address", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({})
      expect(await vevote.hasRole(await vevote.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true
    })

    it("should set the correct initilization parameters", async function () {
      const config = createLocalConfig()
      const { vevote, nodeManagement, vechainNodesMock } = await getOrDeployContractInstances({})
      expect(await vevote["quorumNumerator()"]()).to.equal(config.QUORUM_PERCENTAGE)
      expect(await vevote.getMinVotingDelay()).to.equal(config.INITIAL_MIN_VOTING_DELAY)
      expect(await vevote.getMaxVotingDuration()).to.equal(config.INITIAL_MAX_VOTING_DURATION)
      expect(await vevote.getMinVotingDuration()).to.equal(config.INITIAL_MIN_VOTING_DURATION)
      expect(await vevote.getMaxChoices()).to.equal(config.INITIAL_MAX_CHOICES)
      expect(await vevote.getNodeManagementContract()).to.equal(await nodeManagement.getAddress())
      expect(await vevote.getVechainNodeContract()).to.equal(await vechainNodesMock.getAddress())
      expect(await vevote.getBaseLevelNode()).to.equal(config.BASE_LEVEL_NODE)
      expect(await vevote.nodeLevelMultiplier(1)).to.equal(100)
      expect(await vevote.nodeLevelMultiplier(2)).to.equal(100)
      expect(await vevote.nodeLevelMultiplier(3)).to.equal(100)
      expect(await vevote.nodeLevelMultiplier(4)).to.equal(150)
      expect(await vevote.nodeLevelMultiplier(5)).to.equal(150)
      expect(await vevote.nodeLevelMultiplier(6)).to.equal(150)
      expect(await vevote.nodeLevelMultiplier(7)).to.equal(150)
    })

    it("should should not be able to initlized again", async function () {
      const config = createLocalConfig()
      const { vevote, admin, nodeManagement, vechainNodesMock } = await getOrDeployContractInstances({})
      await expect(
        vevote.initialize(
          {
            quorumPercentage: config.QUORUM_PERCENTAGE,
            initialMinVotingDelay: config.INITIAL_MIN_VOTING_DELAY,
            initialMaxVotingDuration: config.INITIAL_MAX_VOTING_DURATION,
            initialMinVotingDuration: config.INITIAL_MIN_VOTING_DURATION,
            initialMaxChoices: config.INITIAL_MAX_CHOICES,
            nodeManagement: await nodeManagement.getAddress(),
            vechainNodesContract: await vechainNodesMock.getAddress(),
            baseLevelNode: config.BASE_LEVEL_NODE,
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
      ).to.be.revertedWithCustomError(vevote, "InvalidInitialization")
    })

    it("Should support ERC 165 interface", async () => {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })

      expect(await vevote.supportsInterface("0x01ffc9a7")).to.equal(true) // ERC165
    })
  })

  describe("Proposal Creation", function () {
    it("Only whitelisted addresses can create proposals", async function () {
      const { vevote, otherAccount } = await getOrDeployContractInstances({})

      await expect(createProposal({ proposer: otherAccount })).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )
    })

    it("Exact same proposal cannot be created twice", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      // Proposal gets created with default values
      await createProposal({
        startTime: 2741687368,
      })
      // Proposal with same values cannot be created again
      await expect(
        createProposal({
          startTime: 2741687368,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteUnexpectedProposalState")
    })

    it("Proposal start time must be in the future and at least threshold voting delay in the future", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          startTime: 0,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidStartTime")
    })

    it("Voting period must be greater than min voting duration", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          votingPeriod: 0,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidVoteDuration")
    })

    it("Voting period must be less than max voting duration", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          votingPeriod: 100000000000,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidVoteDuration")
    })

    it("Description must be a valid IPFS hash (CID v0)", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          description: "ABCDEDFGHIJ",
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidProposalDescription")

      await expect(
        createProposal({
          description: "QmPaAAXwS2kGyr63q6iakVT8ybqeYeRLqwqUCYu64mNLME",
        }),
      ).to.not.be.reverted
    })

    it("Description must be a valid IPFS hash (CID v1)", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          description: "bafybeidjjktshhtbgzrmrsqivlmrmrap4opll5sh3ym3m5h7s5wodjohcq",
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidProposalDescription")

      await expect(
        createProposal({
          description: "bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte",
        }),
      ).to.not.be.reverted
    })

    it("Maximum choices a user can vote for must be less than or equal to the number of choices", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          maxChoices: 4,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidChoiceCount")
    })

    it("Minimum choices a user can vote for must be greater than maximum", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          minChoices: 3,
          maxChoices: 2,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidSelectionRange")
    })

    it("Minimum choices a user can vote for must be greater than zero", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          minChoices: 0,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidSelectionRange")
    })

    it("Number of choices must be less that max choices threshold", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          maxChoices: 100,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidChoiceCount")
    })

    it("Should revert if max choices a user can select is greater than max choices threshold", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      await expect(
        createProposal({
          maxChoices: 33,
        }),
      ).to.be.revertedWithCustomError(vevote, "VeVoteInvalidChoiceCount")
    })

    it("Should store the proposer address correctly", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({})
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      expect(await vevote.proposalProposer(proposalId)).to.equal(whitelistedAccount.address)
    })

    it("Should store the proposal snapshot correctly", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal({
        startTime: 2741687368,
      })
      const proposalId = await getProposalIdFromTx(tx)
      expect(await vevote.proposalSnapshot(proposalId)).to.equal(2741687368)
    })

    it("Should store the proposal deadline duration correctly", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal({
        startTime: 2000000000,
        votingPeriod: 100,
      })
      const proposalId = await getProposalIdFromTx(tx)
      expect(await vevote.proposalDeadline(proposalId)).to.equal(2000000000 + 100)
    })

    it("Should store the proposal choices correctly", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal({
        choices: [
          ethers.encodeBytes32String("FOR"),
          ethers.encodeBytes32String("AGAINST"),
          ethers.encodeBytes32String("ABSTAIN"),
        ],
      })
      const proposalId = await getProposalIdFromTx(tx)
      const choices = await vevote.proposalChoices(proposalId)

      expect(choices.length).to.equal(3)
      expect(ethers.decodeBytes32String(choices[0])).to.equal("FOR")
      expect(ethers.decodeBytes32String(choices[1])).to.equal("AGAINST")
      expect(ethers.decodeBytes32String(choices[2])).to.equal("ABSTAIN")
    })

    it("Should store the minimum and maximum choices correctly", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal({
        minChoices: 1,
        maxChoices: 2,
      })
      const proposalId = await getProposalIdFromTx(tx)
      const selectionInfo = await vevote.proposalSelectionRange(proposalId)
      expect(selectionInfo[0]).to.equal(1)
      expect(selectionInfo[1]).to.equal
    })

    it("Should emit the ProposalCreated event with correct info", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      const choices = [
        ethers.encodeBytes32String("FOR"),
        ethers.encodeBytes32String("AGAINST"),
        ethers.encodeBytes32String("ABSTAIN"),
      ]
      const tx = await createProposal({
        minChoices: 1,
        maxChoices: 2,
        choices,
        description: "bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte",
        startTime: 2000000000,
        votingPeriod: 100,
      })
      await expect(tx)
        .to.emit(vevote, "VeVoteProposalCreated")
        .withArgs(
          await getProposalIdFromTx(tx),
          whitelistedAccount.address,
          "bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte",
          2000000000,
          100,
          choices,
          2,
          1,
        )
    })

    it("Should return the proposal id", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      const choices = [
        ethers.encodeBytes32String("FOR"),
        ethers.encodeBytes32String("AGAINST"),
        ethers.encodeBytes32String("ABSTAIN"),
      ]
      const tx = await createProposal({
        minChoices: 1,
        maxChoices: 2,
        choices,
        description: "bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte",
        startTime: 2000000000,
        votingPeriod: 100,
      })

      expect(
        await vevote.hashProposal(
          whitelistedAccount.address,
          2000000000,
          100,
          choices,
          ethers.keccak256(ethers.toUtf8Bytes("bafkreidbrnrrrv3a4iusha5kpodumws4cwlgnrdjrqrr6hbnqu7l5szjte")),
          2,
          1,
        ),
      ).to.equal(await getProposalIdFromTx(tx))
    })

    it("Should be able to set min and max choices to same value, so user can only vote for one choice", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal({
        minChoices: 1,
        maxChoices: 1,
      })
      const proposalId = await getProposalIdFromTx(tx)
      const selectionInfo = await vevote.proposalSelectionRange(proposalId)
      expect(selectionInfo[0]).to.equal(1)
      expect(selectionInfo[1]).to.equal(1)
    })
  })

  describe("Proposal Cancellation", function () {
    it("Admin addresses can cancel proposals", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      expect(await vevote.state(proposalId)).to.equal(0)
      await expect(vevote.connect(admin).cancel(proposalId)).to.not.be.reverted
      expect(await vevote.state(proposalId)).to.equal(2)
    })

    it("proposers can cancel their own proposal", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal({ proposer: whitelistedAccount })
      const proposalId = await getProposalIdFromTx(tx)
      expect(await vevote.state(proposalId)).to.equal(0)
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId)).to.not.be.reverted
      expect(await vevote.state(proposalId)).to.equal(2)
    })

    it("Non admin or proposer cannot cancel", async function () {
      const { vevote, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      expect(await vevote.state(proposalId)).to.equal(0)
      await expect(vevote.connect(otherAccount).cancel(proposalId)).to.revertedWithCustomError(
        vevote,
        "UnauthorizedAccess",
      )
    })

    it("Only whitelisted addresses can cancel their a proposal when it is PENDING state", async function () {
      const { vevote, whitelistedAccount, mjolnirXHolder, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      // PENDING -> CANCELLED
      const tx1 = await createProposal()
      const proposalId1 = await getProposalIdFromTx(tx1)
      // ACTIVE
      const tx2 = await createProposal()
      const proposalId2 = await getProposalIdFromTx(tx2)
      // DEFEATED
      const tx3 = await createProposal()
      const proposalId3 = await getProposalIdFromTx(tx3)
      // SUCEEDED -> EXECUTED
      const tx4 = await createProposal()
      const proposalId4 = await getProposalIdFromTx(tx4)

      // Should be able to cancel PENDING proposal
      expect(await vevote.state(proposalId1)).to.equal(0)
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId1)).to.not.be.reverted

      // Should be able to cancel ACTIVE proposal
      await waitForProposalToStart(proposalId2)
      expect(await vevote.state(proposalId2)).to.equal(1)
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId2)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )

      // Should not be able to cancel DEFEATED proposal
      // TODO: Uncomment this after quorom is implemented
      /* await waitForProposalToEnd(proposalId3)
      expect(await vevote.state(proposalId3)).to.equal(3)
      await expect(vevote.connect(admin).cancel(proposalId3)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      ) */

      // Should not be able to cancel SUCEEDED proposal
      await waitForProposalToStart(proposalId4)
      await vevote.connect(mjolnirXHolder).castVote(proposalId4, 1)
      await waitForProposalToEnd(proposalId4)
      expect(await vevote.state(proposalId4)).to.equal(4)
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )

      // Should not be able to cancel EXECUTED proposal
      await vevote.connect(admin).execute(proposalId4)
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )

      // Should not be able to re-cancel a proposal
      await expect(vevote.connect(whitelistedAccount).cancel(proposalId1)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )
    })

    it("Admins can cancel any proposal when they are in PENDING or ACTIVE state", async function () {
      const { vevote, admin, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      // PENDING -> CANCELLED
      const tx1 = await createProposal()
      const proposalId1 = await getProposalIdFromTx(tx1)
      // ACTIVE
      const tx2 = await createProposal()
      const proposalId2 = await getProposalIdFromTx(tx2)
      // DEFEATED
      const tx3 = await createProposal()
      const proposalId3 = await getProposalIdFromTx(tx3)
      // SUCEEDED -> EXECUTED
      const tx4 = await createProposal()
      const proposalId4 = await getProposalIdFromTx(tx4)

      // Should be able to cancel PENDING proposal
      expect(await vevote.state(proposalId1)).to.equal(0)
      await expect(vevote.connect(admin).cancel(proposalId1)).to.not.be.reverted

      // Admin should be able to cancel ACTIVE proposal
      await waitForProposalToStart(proposalId2)
      expect(await vevote.state(proposalId2)).to.equal(1)
      await expect(vevote.connect(admin).cancel(proposalId2)).to.not.be.reverted

      // Should not be able to cancel DEFEATED proposal
      // TODO: Uncomment this after quorom is implemented
      /* await waitForProposalToEnd(proposalId3)
      expect(await vevote.state(proposalId3)).to.equal(3)
      await expect(vevote.connect(admin).cancel(proposalId3)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      ) */

      // Should not be able to cancel SUCEEDED proposal
      await waitForProposalToStart(proposalId4)
      await vevote.connect(mjolnirXHolder).castVote(proposalId4, 1)
      await waitForProposalToEnd(proposalId4)
      expect(await vevote.state(proposalId4)).to.equal(4)
      await expect(vevote.connect(admin).cancel(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )

      // Should not be able to cancel EXECUTED proposal
      await vevote.connect(admin).execute(proposalId4)
      await expect(vevote.connect(admin).cancel(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )

      // Should not be able to re-cancel a proposal
      await expect(vevote.connect(admin).cancel(proposalId1)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )
    })

    it("Should emit the ProposalCancelled event with correct info", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await expect(vevote.connect(admin).cancel(proposalId)).to.emit(vevote, "ProposalCanceled").withArgs(proposalId, admin.address, "")
    })

    it("Should emit the ProposalCancelled event with correct info when cancelWithReason is called", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await expect(vevote.connect(admin).cancelWithReason(proposalId, "BAD IDEA")).to.emit(vevote, "ProposalCanceled").withArgs(proposalId, admin.address, "BAD IDEA")
    })

    it("Should return the proposal id", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await expect(vevote.connect(admin).cancel(proposalId)).to.not.be.reverted
      expect(proposalId).to.equal(await getProposalIdFromTx(tx))
    })
  })

  describe("Proposal Voting", function () {
    it("Should revert if proposal is not in ACTIVE state", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 1)).to.be.revertedWithCustomError(
        vevote,
        "ProposalNotActive",
      )
    })

    it("Should revert if user has already voted", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await vevote.connect(mjolnirXHolder).castVote(proposalId, 1)
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 1)).to.be.revertedWithCustomError(
        vevote,
        "AlreadyVoted",
      )
    })

    it("Should revert if a user selects a choice that is not in the proposal", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 10000000)).to.be.revertedWithCustomError(
        vevote,
        "InvalidVoteChoice",
      )
    })

    it("Should revert if a user selects more choices than the maximum allowed", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 7)).to.be.revertedWithCustomError(
        vevote,
        "InvalidVoteChoice",
      )
    })

    it("Should revert if a user selects less choices than the minimum allowed", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await expect(vevote.connect(mjolnirXHolder).castVote(proposalId, 0)).to.be.revertedWithCustomError(
        vevote,
        "InvalidVoteChoice",
      )
    })

    it("Should revert if a user tries to vote that does not own a node or have any delegated nodes", async function () {
      const { vevote, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await expect(vevote.connect(otherAccount).castVote(proposalId, 1)).to.be.revertedWithCustomError(
        vevote,
        "VoterNotEligible",
      )
    })

    it("Should determine vote weight based on all nodes a user owns and has deleagted to them", async function () {
      const { vevote, strengthHolder, veThorXHolder, nodeManagement } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)

      // User owns 1 node with weight 100
      expect(await vevote.getVoteWeight(strengthHolder.address)).to.equal(100)

      // Delegate veThorXHolder to mjolnirXHolder
      await nodeManagement.connect(veThorXHolder).delegateNode(strengthHolder.address)

      // User owns 1 node with weight 100 and has 1 delegated node with weight 9-
      expect(await vevote.getVoteWeight(strengthHolder.address)).to.equal(190)

      // Total votes should be 100 + 90 = 190
      await vevote.connect(strengthHolder).castVote(proposalId, 1)
      expect(await vevote.totalVotes(proposalId)).to.equal(190)
    })

    // TODO: Update this test to reflect the new node contract
    it("Should determine vote weight based on all nodes a user owns and has deleagted to them at a certian timepoint", async function () {
      const { vevote, strengthHolder} = await getOrDeployContractInstances({
        forceDeploy: true,
      })

      const timepoint = await getCurrentBlockTimestamp()

      // User owns 1 node with weight 100
      expect(await vevote.getVoteWeightAtTimepoint(strengthHolder.address, timepoint)).to.equal(100)
    })

    it("Should normalise the vote weights when calling the getters in the contract", async function () {
      // TODO: Implement a test for all values when new node contracts in
    })

    it("Should split vote weight evenly between all choices when a user votes", async function () {
      const { vevote, strengthHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)

      // User owns 1 node with weight 100
      expect(await vevote.getVoteWeight(strengthHolder.address)).to.equal(100)

      // Vote weight should be split evenly between all choices
      await vevote.connect(strengthHolder).castVote(proposalId, 3)

      // Total votes should be 100
      expect(await vevote.totalVotes(proposalId)).to.equal(100)
      // Choice 1 should have 50 votes
      const votes = await vevote.getProposalVotes(proposalId)
      expect(votes[0].weight).to.equal(50)
      expect(votes[1].weight).to.equal(50)
    })

    it("Should update proposal choice tally correctly when a user votes", async function () {})

    it("Should revert if base node level is 0 or not set", async function () {
      const config = createLocalConfig()
      config.BASE_LEVEL_NODE = 0
      const { vevote, strengthHolder } = await getOrDeployContractInstances({ forceDeploy: true, config })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)

      // User owns 1 node with weight 100
      await expect(vevote.getVoteWeight(strengthHolder.address)).to.be.revertedWithCustomError(
        vevote,
        "VoteWeightDenominatorZero",
      )

      // Vote weight should be split evenly between all choices
      await expect(vevote.connect(strengthHolder).castVote(proposalId, 3)).to.be.revertedWithCustomError(
        vevote,
        "VoteWeightDenominatorZero",
      )
    })

    it("Should handle cases where vote choice weight is less than vote weight denominator", async function () {
      const { vevote, dawnHolder, otherAccount, vechainNodesMock } = await getOrDeployContractInstances({
        forceDeploy: true,
      })

      // Get Dawn holder number 2
      await createNodeHolder(10, otherAccount, vechainNodesMock)

      const tx = await createProposal()

      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)

      // User owns 1 node with weight 1
      expect(await vevote.getVoteWeight(dawnHolder.address)).to.equal(1)

      // Total votes should be 1, 0.5 for choice 1 and 0.5 for choice 2
      await vevote.connect(dawnHolder).castVote(proposalId, 3)
      expect(await vevote.totalVotes(proposalId)).to.equal(1)

      // Votes for choices will be 0.5 and 0.5 which is not a whole number so will be rounded to 0 in solidity
      const votes = await vevote.getProposalVotes(proposalId)
      expect(votes[0].weight).to.equal(0)
      expect(votes[1].weight).to.equal(0)

      // If another user votes with weight 1, total votes will be 2, and as votes have crossed threshold of 1 for choice 1, it will be 1
      expect(await vevote.getVoteWeight(otherAccount.address)).to.equal(1)
      await vevote.connect(otherAccount).castVote(proposalId, 1)

      expect(await vevote.totalVotes(proposalId)).to.equal(2)
      const votes2 = await vevote.getProposalVotes(proposalId)
      expect(votes2[0].weight).to.equal(1) // Choice 1 will be 1
      expect(votes2[1].weight).to.equal(0) // Choice 2 will still be 0 as total weight is 0.5
    })

    it("Has Voted should return true if user has voted", async function () {
      const { vevote, dawnHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await vevote.connect(dawnHolder).castVote(proposalId, 1)
      expect(await vevote.hasVoted(proposalId, dawnHolder.address)).to.equal(true)
    })

    it("Should emit the VoteCast event with correct info", async function () {
      const { vevote, dawnHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await expect(vevote.connect(dawnHolder).castVote(proposalId, 1)).to.emit(vevote, "VoteCast").withArgs(
        dawnHolder.address,
        proposalId,
        1,
        1,
        ""
      )
    })

    it("Should emit the VoteCast event with correct info when castVoteWithReason is cast", async function () {
      const { vevote, dawnHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await expect(vevote.connect(dawnHolder).castVoteWithReason(proposalId, 1, "Test Reason")).to.emit(vevote, "VoteCast").withArgs(
        dawnHolder.address,
        proposalId,
        1,
        1,
        "Test Reason"
      )
    })
  })

  describe("Proposal Execution", function () {
    it("Only admin addresses can execute proposals", async function () {
      const { vevote, admin, validatorHolder, otherAccount, whitelistedAccount } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await vevote.connect(validatorHolder).castVote(proposalId, 1)
      await waitForProposalToEnd(proposalId)

      // Should rever if creator tries to execute proposal
      await expect(vevote.connect(whitelistedAccount).execute(proposalId)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )

      // Should revert if non-admin tries to execute proposal
      await expect(vevote.connect(otherAccount).execute(proposalId)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )

      await expect(vevote.connect(admin).execute(proposalId)).to.not.be.reverted

      expect(await vevote.state(proposalId)).to.equal(5)
    })

    it("Proposals can only be executed when they are in SUCEEDED state", async function () {
      const { vevote, whitelistedAccount, mjolnirXHolder, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      // PENDING -> CANCELLED
      const tx1 = await createProposal()
      const proposalId1 = await getProposalIdFromTx(tx1)
      // ACTIVE
      const tx2 = await createProposal()
      const proposalId2 = await getProposalIdFromTx(tx2)
      // DEFEATED
      const tx3 = await createProposal()
      const proposalId3 = await getProposalIdFromTx(tx3)
      // SUCEEDED -> EXECUTED
      const tx4 = await createProposal()
      const proposalId4 = await getProposalIdFromTx(tx4)

      // Should not be able to execute PENDING proposal
      expect(await vevote.state(proposalId1)).to.equal(0)
      await expect(vevote.connect(admin).execute(proposalId1)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )
      await vevote.connect(whitelistedAccount).cancel(proposalId1) // Cancel the proposal for tests below

      // Should be able to execute ACTIVE proposal
      await waitForProposalToStart(proposalId2)
      expect(await vevote.state(proposalId2)).to.equal(1)
      await expect(vevote.connect(admin).execute(proposalId2)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )

      // Should not be able to exectute DEFEATED proposal
      // TODO: Uncomment this after quorom is implemented
      /* await waitForProposalToEnd(proposalId3)
      expect(await vevote.state(proposalId3)).to.equal(3)
      await expect(vevote.connect(admin).execute(proposalId3)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      ) */

      // Should be able to execute a SUCEEDED proposal
      await waitForProposalToStart(proposalId4)
      await vevote.connect(mjolnirXHolder).castVote(proposalId4, 1)
      await waitForProposalToEnd(proposalId4)
      expect(await vevote.state(proposalId4)).to.equal(4)
      await expect(vevote.connect(admin).execute(proposalId4)).to.not.be.reverted
      expect(await vevote.state(proposalId4)).to.equal(5)

      // Should not be able to execute EXECUTED proposal
      await expect(vevote.connect(admin).execute(proposalId4)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )

      // Should not be able to execute a CANCELLED a proposal
      await expect(vevote.connect(admin).execute(proposalId1)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteUnexpectedProposalState",
      )
    })
  })

  describe("Proposal Quorom", function () {
    it("Should return the correct quorom denominator", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      expect(await vevote.quorumDenominator()).to.equal(100)
    })

    it("Should return the correct quorom numerator", async function () {
      const config = createLocalConfig()
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      expect(await vevote["quorumNumerator()"]()).to.equal(config.QUORUM_PERCENTAGE)
    })

    it("Should return the correct quorom numerator at a given timepoint", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      const currentTime = await getCurrentBlockTimestamp()

      expect(await vevote["quorumNumerator(uint256)"](currentTime)).to.equal(config.QUORUM_PERCENTAGE)
      expect(await vevote["quorumNumerator()"]()).to.equal(config.QUORUM_PERCENTAGE)

      await time.setNextBlockTimestamp(currentTime + 100)
      await waitForNextBlock()

      // Set quorom numerator to 50
      await vevote.connect(admin).updateQuorumNumerator(75)

      expect(await vevote["quorumNumerator(uint256)"](currentTime + 101)).to.equal(75)
      expect(await vevote["quorumNumerator()"]()).to.equal(75)

      // Time
      expect(await vevote["quorumNumerator(uint256)"](currentTime + 10)).to.equal(config.QUORUM_PERCENTAGE)
    })

    it("Should return the correct quorom at a given timepoint", async function () {
      // TODO: When quorom is implemented
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      expect(await vevote.quorum(1)).to.equal(0) // THIS IS A PLACEHOLDER
    })

    it("Only admin addresses can set the quorom numerator", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(otherAccount).updateQuorumNumerator(75)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )
      await expect(vevote.connect(admin).updateQuorumNumerator(75)).to.not.be.reverted
    })

    it("Quorom denominator must be less than or equal to the quorom denominator", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).updateQuorumNumerator(101)).to.be.revertedWithCustomError(
        vevote,
        "VeVoteInvalidQuorumFraction",
      )
    })

    it("Event should be emitted when quorom numerator is set", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).updateQuorumNumerator(75))
        .to.emit(vevote, "QuorumNumeratorUpdated")
        .withArgs(config.QUORUM_PERCENTAGE, 75)
    })

    it("Should return true if quorom is reached for a given proposal", async function () {
      // TODO: Implement this when quorom is implemented
    })
  })

  describe("Proposal State", function () {
    it("Should return EXECUTED if contract has been marked as executed", async function () {
      const { vevote, admin, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await vevote.connect(mjolnirXHolder).castVote(proposalId, 1)
      await waitForProposalToEnd(proposalId)
      expect(await vevote.state(proposalId)).to.equal(4)
      await vevote.connect(admin).execute(proposalId)
      expect(await vevote.state(proposalId)).to.equal(5) // EXECUTED
    })

    it("Should return CANCELLED if contract has been marked as cancelled by whitelisted account", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await vevote.connect(whitelistedAccount).cancel(proposalId)
      expect(await vevote.state(proposalId)).to.equal(2) // CANCELLED
    })

    it("Should return CANCELLED if contract has been marked as cancelled by proposer", async function () {
      const { vevote, whitelistedAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal({ proposer: whitelistedAccount })
      const proposalId = await getProposalIdFromTx(tx)
      await vevote.connect(whitelistedAccount).cancel(proposalId)
      expect(await vevote.state(proposalId)).to.equal(2) // CANCELLED
    })

    it("Should return PENDING if proposal snapshot is after current timepoint", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      const time = await getCurrentBlockTimestamp()
      const tx = await createProposal({
        startTime: time + 1000,
      })
      const proposalId = await getProposalIdFromTx(tx)
      expect(await vevote.state(proposalId)).to.equal(0) // PENDING
    })

    it("Should return ACTIVE if proposal snapshot is before current timepoint but deadline is after", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal({})
      const proposalId = await getProposalIdFromTx(tx)

      await waitForProposalToStart(proposalId)
      expect(await vevote.state(proposalId)).to.equal(1) // ACTIVE
    })

    it("Should return DEFEATED if proposal deadline is before current timepoint and quorom is not reached", async function () {
      // TODO: Implement this when quorom is implemented
    })

    it("Should return SUCEEDED if proposal deadline is before current timepoint and quorom is reached", async function () {
      const { vevote, mjolnirXHolder } = await getOrDeployContractInstances({ forceDeploy: true })
      const tx = await createProposal()
      const proposalId = await getProposalIdFromTx(tx)
      await waitForProposalToStart(proposalId)
      await vevote.connect(mjolnirXHolder).castVote(proposalId, 1)
      await waitForProposalToEnd(proposalId)
      expect(await vevote.state(proposalId)).to.equal(4) // SUCEEDED
    })

    it("Should throw error if getting state of non existent proposal", async function () {
      const { vevote } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.state(100000)).to.be.revertedWithCustomError(vevote, "VeVoteNonexistentProposal")
    })
  })

  describe("Proposal Configuration", function () {
    it("Only admin addresses ca nset min voting delay", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(otherAccount).setMinVotingDelay(100)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )
      await expect(vevote.connect(admin).setMinVotingDelay(100)).to.not.be.reverted

      expect(await vevote.getMinVotingDelay()).to.equal(100)
    })

    it("Cannot set min voting delay to 0", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMinVotingDelay(0)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMinVotingDelay",
      )
    })

    it("Should emit an event when min voting delay is set", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMinVotingDelay(1234))
        .to.emit(vevote, "MinVotingDelaySet")
        .withArgs(config.INITIAL_MIN_VOTING_DELAY, 1234)
    })

    it("Only admin addresses can set min voting duration", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(otherAccount).setMinVotingDuration(6)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )
      await expect(vevote.connect(admin).setMinVotingDuration(6)).to.not.be.reverted

      expect(await vevote.getMinVotingDuration()).to.equal(6)
    })

    it("Cannot set min voting duration to 0", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMinVotingDuration(0)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMinVotingDuration",
      )
    })

    it("Cannot set min voting duration greater or equal than max", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMinVotingDuration(config.INITIAL_MAX_VOTING_DURATION)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMinVotingDuration",
      )
    })

    it("Should emit an event when min voting duration is set", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMinVotingDuration(6))
        .to.emit(vevote, "MinVotingDurationSet")
        .withArgs(config.INITIAL_MIN_VOTING_DURATION, 6)
    })

    it("Only admin addresses can set max voting duration", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(otherAccount).setMaxVotingDuration(100)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )
      await expect(vevote.connect(admin).setMaxVotingDuration(100)).to.not.be.reverted

      expect(await vevote.getMaxVotingDuration()).to.equal(100)
    })

    it("Cannot set max voting duration to less than equal min", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMaxVotingDuration(config.INITIAL_MIN_VOTING_DURATION)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMaxVotingDuration",
      )
    })

    it("Should emit an event when max voting duration is set", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMaxVotingDuration(1234))
        .to.emit(vevote, "MaxVotingDurationSet")
        .withArgs(config.INITIAL_MAX_VOTING_DURATION, 1234)
    })

    it("Only admin addresses can set max choices", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(otherAccount).setMaxVotingDuration(10)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )
      await expect(vevote.connect(admin).setMaxChoices(10)).to.not.be.reverted

      expect(await vevote.getMaxChoices()).to.equal(10)
    })

    it("Max choices cannot be 0", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMaxChoices(0)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMaxChoices",
      )
    })

    it("Max choices cannot be greater than 32", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMaxChoices(33)).to.be.revertedWithCustomError(
        vevote,
        "InvalidMaxChoices",
      )
    })

    it("Should emit an event when max choices is set", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setMaxChoices(10))
        .to.emit(vevote, "MaxChoicesSet")
        .withArgs(config.INITIAL_MAX_CHOICES, 10)
    })

    it("Only admin addresses can set base level node", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(otherAccount).setBaseLevelNode(1)).to.be.revertedWithCustomError(
        vevote,
        "AccessControlUnauthorizedAccount",
      )
      await expect(vevote.connect(admin).setBaseLevelNode(1)).to.not.be.reverted

      expect(await vevote.getBaseLevelNode()).to.equal(1)
    })

    it("Base level node cannot be 0", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setBaseLevelNode(0)).to.be.revertedWithCustomError(
        vevote,
        "InvalidNode",
      )
    })

    it("Should emit an event when base level node is set", async function () {
      const config = createLocalConfig()
      const { vevote, admin } = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(vevote.connect(admin).setBaseLevelNode(1))
        .to.emit(vevote, "VechainBaseNodeSet")
        .withArgs(config.BASE_LEVEL_NODE, 1)
    })

    it("Only admin address can update node management cotract", async function () {
      const { vevote, admin, otherAccount, vechainNodesMock } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      await expect(
        vevote.connect(otherAccount).setNodeManagementContract(await vechainNodesMock.getAddress()),
      ).to.be.revertedWithCustomError(vevote, "AccessControlUnauthorizedAccount")
      await expect(vevote.connect(admin).setNodeManagementContract(await vechainNodesMock.getAddress())).to.not.be
        .reverted

      expect(await vevote.getNodeManagementContract()).to.equal(await vechainNodesMock.getAddress())
    })

    it("Cannot set node management contract to ZERO address", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      await expect(
        vevote.connect(admin).setNodeManagementContract(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(vevote, "InvalidAddress")
    })

    it("Should emit an event when node management contract updated", async function () {
      const { vevote, admin, vechainNodesMock, nodeManagement } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      await expect(vevote.connect(admin).setNodeManagementContract(await vechainNodesMock.getAddress()))
        .to.emit(vevote, "NodeManagementContractSet")
        .withArgs(await nodeManagement.getAddress(), await vechainNodesMock.getAddress())
    })

    it("Only admin address can update vechain node cotract", async function () {
      const { vevote, otherAccount, nodeManagement} = await getOrDeployContractInstances({ forceDeploy: true })
      await expect(
        vevote.connect(otherAccount).setVechainNodeContract(await nodeManagement.getAddress()),
      ).to.be.revertedWithCustomError(vevote, "AccessControlUnauthorizedAccount")
    })

    it("Cannot set vechain node contract to ZERO address", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      await expect(
        vevote.connect(admin).setNodeManagementContract(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(vevote, "InvalidAddress")
    })


    it("Should emit an event when vechain node contract updated", async function () {
      const { vevote, admin, vechainNodesMock, nodeManagement } = await getOrDeployContractInstances({
        forceDeploy: true,
      })
      await expect(vevote.connect(admin).setVechainNodeContract(await nodeManagement.getAddress()))
        .to.emit(vevote, "VechainNodeContractSet")
        .withArgs(await vechainNodesMock.getAddress(), await nodeManagement.getAddress())
    })

    it("Only admin address can update node multiplers", async function () {
      const { vevote, admin, otherAccount } = await getOrDeployContractInstances({ forceDeploy: true })
      const nodeMultipliers = {
        strength: 1,
        thunder: 2,
        mjolnir: 3,
        veThorX: 4,
        strengthX: 5,
        thunderX: 6,
        mjolnirX: 7,
        flash: 8,
        lightning: 9,
        dawn: 10,
        validator: 11,
      }
      await expect(
        vevote.connect(otherAccount).updateNodeMultipliers(nodeMultipliers),
      ).to.be.revertedWithCustomError(vevote, "AccessControlUnauthorizedAccount")
      await expect(vevote.connect(admin).updateNodeMultipliers(nodeMultipliers)).to.not.be.reverted

      expect(await vevote.nodeLevelMultiplier(1)).to.equal(1)
      expect(await vevote.nodeLevelMultiplier(2)).to.equal(2)
      expect(await vevote.nodeLevelMultiplier(3)).to.equal(3)
      expect(await vevote.nodeLevelMultiplier(4)).to.equal(4)
      expect(await vevote.nodeLevelMultiplier(5)).to.equal(5)
      expect(await vevote.nodeLevelMultiplier(6)).to.equal(6)
      expect(await vevote.nodeLevelMultiplier(7)).to.equal(7)
      expect(await vevote.nodeLevelMultiplier(8)).to.equal(8)
      expect(await vevote.nodeLevelMultiplier(9)).to.equal(9)
      expect(await vevote.nodeLevelMultiplier(10)).to.equal(10)
      expect(await vevote.nodeLevelMultiplier(11)).to.equal(11)
    })

    it("Should emit an event when vechain node contract updated", async function () {
      const { vevote, admin } = await getOrDeployContractInstances({
        forceDeploy: true,
      })

      const nodeMultipliers = {
        strength: 1,
        thunder: 2,
        mjolnir: 3,
        veThorX: 4,
        strengthX: 5,
        thunderX: 6,
        mjolnirX: 7,
        flash: 8,
        lightning: 9,
        dawn: 10,
        validator: 11,
      }

      await expect(vevote.connect(admin).updateNodeMultipliers(nodeMultipliers))
        .to.emit(vevote, "NodeVoteMultipliersUpdated")
        .withArgs(Object.values(nodeMultipliers).map(BigInt))
    })
  })

  describe("Proposal Clock", function () {
    it("Should return the current block timestamp", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      const currentTime = await getCurrentBlockTimestamp()
      expect(await vevote.clock()).to.equal(currentTime)
    })

    it("Should return the correct CLOCK_TYPE", async function () {
      const { vevote } = await getOrDeployContractInstances({})
      expect(await vevote.CLOCK_MODE()).to.equal("mode=timestamp&from=default")
    })
  })
})
