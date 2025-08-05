import { VeVote, StargateNFT } from "../../typechain-types";
import { getSeedAccounts, getTestKeys } from "../helpers/seedAccounts";
import { getConfig } from "@repo/config";
import { ethers } from "hardhat";
import { airdropVTHO } from "../helpers/airdrop";
import { stake } from "../helpers";
import { createProposal, vote } from "../helpers/vote";

const ACCT_OFFSET = 100;
const NUM_USERS_TO_SEED = 500;
const FOR_VOTES = 60;
const AGAINST_VOTES = 35;

export const simulateVote = async () => {
  console.log("================");
  console.log("Running simulation...");

  // Get the latest config and create the contracts
  const config = getConfig();
  const vevote: VeVote = await ethers.getContractAt("VeVote", config.vevoteContractAddress);
  const stargate: StargateNFT = await ethers.getContractAt("StargateNFT", config.stargateNFTContractAddress);

  const accounts = getTestKeys(500);
  const seedAccounts = getSeedAccounts(NUM_USERS_TO_SEED, ACCT_OFFSET);

  console.log(`Seeding ${seedAccounts.length} accounts with Stargate NFTs...`);
  console.log(`Seed Accounts: ${seedAccounts.map(acct => acct.key.address).join(", ")}`);

  // Define specific accounts
  const admin = accounts[0];

  // Airdrop VTHO
  await airdropVTHO(
    seedAccounts.map(acct => acct.key.address),
    500n,
    admin,
  );

  // Mint Stargate NFTs
  await stake(config.stargateNFTContractAddress, seedAccounts);

  console.log(`Stargate NFTs minted for ${seedAccounts.length} accounts`);
  const pid = await createProposal(vevote);
  console.log(`Proposal created with ID: ${pid}`);

  // Calculate vote splits
  const totalVoters = seedAccounts.length;
  const forCount = Math.floor((FOR_VOTES / 100) * totalVoters);
  const againstCount = Math.floor((AGAINST_VOTES / 100) * totalVoters);
  const abstainCount = totalVoters - forCount - againstCount; // Ensure sum matches total

  console.log(`Voting distribution: FOR=${forCount}, AGAINST=${againstCount}, ABSTAIN=${abstainCount}`);

  // Slice accounts for each vote type
  const forVoters = seedAccounts.slice(0, forCount);
  const againstVoters = seedAccounts.slice(forCount, forCount + againstCount);
  const abstainVoters = seedAccounts.slice(forCount + againstCount);

  // Cast votes
  console.log("Casting FOR votes...");
  await vote(config.vevoteContractAddress, forVoters, pid, 1);

  console.log("Casting AGAINST votes...");
  await vote(config.vevoteContractAddress, againstVoters, pid, 0);

  console.log("Casting ABSTAIN votes...");
  await vote(config.vevoteContractAddress, abstainVoters, pid, 2);
};
