import { ethers } from "hardhat"
import { expect } from "chai"
import { catchRevert, getOrDeployContractInstances } from "./helpers"
import { describe, it } from "mocha"
import { createLocalConfig } from "@repo/config/contracts/envs/local"

describe("VeVote", function () {
  describe("Deployment", function () {
    it("should deploy the contract", async function () {})
  })

  describe("Proposal Creation", function () {
    it("Only whitelised addresses can create proposals", async function () {})

    it("Exact same proposal cannot be created twice", async function () {})

    it("Proposal start time must be in the future and at least threshold voting delay in the future", async function () {})

    it("Voting period must be greater than max voting duration", async function () {})

    it("Voting period must be less than max voting duration", async function () {})

    it("Description must be a valid IPFS hash (CID v0)", async function () {})

    it("Description must be a valid IPFS hash (CID v1)", async function () {})

    it("Description must be a valid IPFS hash when starts with 'ipfs://'", async function () {})

    it("Maximum choices a user can vote for must be less than or equal to the number of choices", async function () {})

    it("Minimum choices a user can vote for must be greater than maximum", async function () {})

    it("Minimum choices a user can vote for must be greater than zero", async function () {})

    it("Number of choices must be greater or equal to maximum choices a user can vote for", async function () {})

    it("Number of choices must be less that max choices threshold", async function () {})

    it("Should revert if max choices auser can select is greater than max choices threshold", async function () {})

    it("Should store the proposar address correctly", async function () {})

    it("Should store the proposal snapshot correctly", async function () {})

    it("Should store the proposal deadline duration correctly", async function () {})

    it("Should store the proposal choices correctly", async function () {})

    it("Should store the minimum and maximum choices correctly", async function () {})

    it("Should emit the ProposalCreated event with correct info", async function () {}) 

    it("Should return the proposal id", async function () {})

    it("Should be able to set min and max choices to same value, so user can only vote for one choice", async function () {})
  })

  describe("Proposal Cancellation", function () {
    it("Admin addresses can cancel proposals", async function () {})

    it("Proposars can cancel their own proposal", async function () {})

    it("Only the proposar can cancel their own proposal when it is PENDING state", async function () {})

    it("Admins can cancel any proposal when they are in PENDING or ACTIVE state", async function () {})

    it("Should emit the ProposalCancelled event with correct info", async function () {})

    it("Should emit the ProposalCancelled event with correct info", async function () {})

    it("Should return the proposal id", async function () {})
  })

  describe("Proposal Voting", function () {
    it("Should revert if proposal is not in ACTIVE state", async function () {})

    it("Should revert if user has already voted", async function () {})

    it("Should revert if a user selects a choice that is not in the proposal", async function () {})

    it("Should revert if a user selects more choices than the maximum allowed", async function () {})

    it("Should revert if a user selects less choices than the minimum allowed", async function () {})

    it("Should revert if a user tries to vote that does not own a node or have any delegated nodes", async function () {})

    it("Should determine vote weight based on all nodes a user owns and has deleagted to them", async function () {})

    it("Should normalise the vote weights when calling the getters in the contract", async function () {})

    it("Should split vote weight evenly between all choices when a user votes", async function () {})

    it("Should update proposal choice tally correctly when a user votes", async function () {})

    it("Should revert if base node level is 0 or not set", async function () {})

    it("Should handle cases where vote choice weight is less than vote weight denominator", async function () {})

    
  })

  describe("Proposal Execution", function () {
    it("Only admin addresses can execute proposals", async function () {})

    it("Proposals can only be executed when they are in SUCEEDED state", async function () {})
  })

  describe("Quorom", function () {
    it("Should return the correct quorom denominator", async function () {})

    it("Should return the correct quorom numerator", async function () {})

    it("Should return the correct quorom numerator at a given timepoint", async function () {})

    it("Should return the correct quorom at a given timepoint", async function () {})

    it("Only admin addresses can set the quorom numerator", async function () {})

    it("Quorom denominator must be less than or equal to the quorom denominator", async function () {})

    it("Event should be emitted when quorom numerator is set", async function () {})

    it("Should return true if quorom is reached for a given proposal", async function () {})
  })

  describe("Proposal State", function () {
    it("Should return EXECUTED if contract has been marked as executed", async function () {})

    it("Should return CANCELLED if contract has been marked as cancelled by admin", async function () {})

    it("Should return CANCELLED if contract has been marked as cancelled by proposar", async function () {})

    it("Should return PENDING if proposal snapshot is after current timepoint", async function () {})

    it("Should return ACTIVE if proposal snapshot is before current timepoint but deadline is after", async function () {})

    it("Should return DEFEATED if proposal deadline is before current timepoint and quorom is not reached", async function () {})

    it("Should return SUCEEDED if proposal deadline is before current timepoint and quorom is reached", async function () {})
  })
})