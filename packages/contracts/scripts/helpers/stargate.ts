import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { StargateNFT, StargateNFT__factory } from "../../typechain-types";
import { ERC20_ABI, VTHO_ADDRESS } from "./constants";
import { ABIContract, Address, Clause } from "@vechain/sdk-core";
import { SeedAccount, TestPk } from "./seedAccounts";
import { TransactionUtils } from "@repo/utils";
import { ThorClient } from "@vechain/sdk-network";
import { getConfig } from "@repo/config";
const thorClient = ThorClient.at(getConfig().nodeUrl);

export interface Level {
  name: string;
  isActive: boolean;
  isX: boolean;
  id: number;
  maturityBlocks: number;
  scaledRewardFactor: number;
  vetAmountRequiredToStake: bigint;
}

export interface LevelAndSupply {
  level: Level;
  cap: number;
  circulatingSupply: number;
}

const BLOCKS_PER_DAY = 6 * 60 * 24;

export enum TokenLevelId {
  // Extend legacy strengthLevel enum
  None,
  Strength,
  Thunder,
  Mjolnir,
  VeThorX,
  StrengthX,
  ThunderX,
  MjolnirX,
  Dawn,
  Lightning,
  Flash,
}

export const initialTokenLevels: LevelAndSupply[] = [
  // Legacy normal levels
  {
    level: {
      id: TokenLevelId.Strength,
      name: "Strength",
      isActive: true,
      isX: false,
      // ! TODO: Revert to 1000000 after testing
      vetAmountRequiredToStake: ethers.parseEther("1000000"),
      scaledRewardFactor: 150,
      maturityBlocks: BLOCKS_PER_DAY * 30,
    },
    cap: 100000, // 2000 - 1128, TODO: confirm ahead/around deployment time
    circulatingSupply: 0,
  },
  {
    level: {
      id: TokenLevelId.Thunder,
      name: "Thunder",
      isActive: true,
      isX: false,
      // ! TODO: Revert to 5000000 after testing
      vetAmountRequiredToStake: ethers.parseEther("5000000"),
      scaledRewardFactor: 250,
      maturityBlocks: BLOCKS_PER_DAY * 45,
    },
    cap: 100000, // 300 - 60
    circulatingSupply: 0,
  },
  {
    level: {
      id: TokenLevelId.Mjolnir,
      name: "Mjolnir",
      isActive: true,
      isX: false,
      // ! TODO: Revert to 15000000 after testing
      vetAmountRequiredToStake: ethers.parseEther("15000000"),
      scaledRewardFactor: 350,
      maturityBlocks: BLOCKS_PER_DAY * 60,
    },
    cap: 100000, // 100 - 79
    circulatingSupply: 0,
  },
  // Legacy X Levels
  {
    level: {
      id: TokenLevelId.VeThorX,
      name: "VeThorX",
      isActive: true,
      isX: true,
      // ! TODO: Revert to 600000 after testing
      vetAmountRequiredToStake: ethers.parseEther("600000"),
      scaledRewardFactor: 200,
      maturityBlocks: 0,
    },
    cap: 100000, // 800 - 800
    circulatingSupply: 0,
  },
  {
    level: {
      id: TokenLevelId.StrengthX,
      name: "StrengthX",
      isActive: true,
      isX: true,
      // ! TODO: Revert to 1600000 after testing
      vetAmountRequiredToStake: ethers.parseEther("1600000"),
      scaledRewardFactor: 300,
      maturityBlocks: 0,
    },
    cap: 100000, // 862 - 862
    circulatingSupply: 0,
  },
  {
    level: {
      id: TokenLevelId.ThunderX,
      name: "ThunderX",
      isActive: true,
      isX: true,
      // ! TODO: Revert to 5600000 after testing
      vetAmountRequiredToStake: ethers.parseEther("5600000"),
      scaledRewardFactor: 400,
      maturityBlocks: 0,
    },
    cap: 11000000, // 179 - 179
    circulatingSupply: 0,
  },
  {
    level: {
      id: TokenLevelId.MjolnirX,
      name: "MjolnirX",
      isActive: true,
      isX: true,
      // ! TODO: Revert to 15600000 after testing
      vetAmountRequiredToStake: ethers.parseEther("15600000"),
      scaledRewardFactor: 500,
      maturityBlocks: 0,
    },
    cap: 10, // 148 - 148
    circulatingSupply: 0,
  },
  // New levels
  {
    level: {
      id: TokenLevelId.Dawn,
      name: "Dawn",
      isActive: true,
      isX: false,
      // ! TODO: Revert to 10000 after testing
      vetAmountRequiredToStake: ethers.parseEther("10000"),
      scaledRewardFactor: 100,
      maturityBlocks: BLOCKS_PER_DAY * 1,
    },
    cap: 500000,
    circulatingSupply: 0,
  },
  {
    level: {
      id: TokenLevelId.Lightning,
      name: "Lightning",
      isActive: true,
      isX: false,
      // ! TODO: Revert to 50000 after testing
      vetAmountRequiredToStake: ethers.parseEther("50000"),
      scaledRewardFactor: 115,
      maturityBlocks: BLOCKS_PER_DAY * 5,
    },
    cap: 100000,
    circulatingSupply: 0,
  },
  {
    level: {
      id: TokenLevelId.Flash,
      name: "Flash",
      isActive: true,
      isX: false,
      // ! TODO: Revert to 200000 after testing
      vetAmountRequiredToStake: ethers.parseEther("200000"),
      scaledRewardFactor: 130,
      maturityBlocks: BLOCKS_PER_DAY * 15,
    },
    cap: 250000,
    circulatingSupply: 0,
  },
];

export const vthoRewardPerBlockPerLevel = [
  {
    levelId: 1,
    rewardPerBlock: ethers.parseUnits("0.122399797", 18), // 0.122399797 * 10^18
  },
  {
    levelId: 2,
    rewardPerBlock: ethers.parseUnits("0.975076104", 18), // 0.975076104 * 10^18
  },
  {
    levelId: 3,
    rewardPerBlock: ethers.parseUnits("3.900304414", 18), // 3.900304414 * 10^18
  },
  {
    levelId: 4,
    rewardPerBlock: ethers.parseUnits("0.076674277", 18), // 0.076674277 * 10^18
  },
  {
    levelId: 5,
    rewardPerBlock: ethers.parseUnits("0.313546423", 18), // 0.313546423 * 10^18
  },
  {
    levelId: 6,
    rewardPerBlock: ethers.parseUnits("1.365550482", 18), // 1.365550482 * 10^18
  },
  {
    levelId: 7,
    rewardPerBlock: ethers.parseUnits("4.872526636", 18), // 4.872526636 * 10^18
  },
  // nft
  {
    levelId: 8,
    rewardPerBlock: ethers.parseUnits("0.000697615", 18), // 0.000697615 * 10^18
  },
  {
    levelId: 9,
    rewardPerBlock: ethers.parseUnits("0.003900304", 18), // 0.003900304 * 10^18
  },
];

export async function deployStargateNFTLibraries() {
  // Deploy Clock Library
  const Clock = await ethers.getContractFactory("Clock");
  const StargateNFTClockLib = await Clock.deploy();
  await StargateNFTClockLib.waitForDeployment();

  // Deploy DataTypes Library
  const DataTypes = await ethers.getContractFactory("DataTypes");
  const StargateNFTTypesLib = await DataTypes.deploy();
  await StargateNFTTypesLib.waitForDeployment();

  // Deploy Levels Library
  const Levels = await ethers.getContractFactory("Levels");
  const StargateNFTLevelsLib = await Levels.deploy();
  await StargateNFTLevelsLib.waitForDeployment();

  // Deploy MintingLogic Library
  const MintingLogic = await ethers.getContractFactory("MintingLogic");
  const StargateNFTMintingLib = await MintingLogic.deploy();
  await StargateNFTMintingLib.waitForDeployment();

  // Deploy Settings Library
  const Settings = await ethers.getContractFactory("Settings");
  const StargateNFTSettingsLib = await Settings.deploy();
  await StargateNFTSettingsLib.waitForDeployment();

  // Deploy Token Library
  const Token = await ethers.getContractFactory("Token");
  const StargateNFTTokenLib = await Token.deploy();
  await StargateNFTTokenLib.waitForDeployment();

  // Deploy VetGeneratedVtho Library
  const VetGeneratedVtho = await ethers.getContractFactory("VetGeneratedVtho");
  const StargateNFTVetGeneratedVthoLib = await VetGeneratedVtho.deploy();
  await StargateNFTVetGeneratedVthoLib.waitForDeployment();

  return {
    StargateNFTClockLib,
    StargateNFTTypesLib,
    StargateNFTMintingLib,
    StargateNFTSettingsLib,
    StargateNFTTokenLib,
    StargateNFTVetGeneratedVthoLib,
    StargateNFTLevelsLib,
  };
}

export const createNodeHolder = async (
  level: number,
  admin: HardhatEthersSigner,
  account: HardhatEthersSigner,
  stargateNFT: StargateNFT,
) => {
  const vetRequired = initialTokenLevels[level - 1].level.vetAmountRequiredToStake;

  if (network.name == "hardhat") {
    await network.provider.send("hardhat_setBalance", [account.address, "0x52B7D2DCC80CD2E4000000"]);
  } else {
    const vtho = await ethers.getContractAt(ERC20_ABI, VTHO_ADDRESS);
    const vthoRequired = ethers.parseUnits("1000", 18); // replace with actual required VTHO amount

    const currentVthoBalance = await vtho.balanceOf(account.address);

    if (currentVthoBalance < vthoRequired) {
      const tx = await vtho.connect(admin).transfer(account.address, vthoRequired);
      await tx.wait();
      console.log(`Sent ${ethers.formatEther(vthoRequired)} VTHO to ${account.address}`);
    }

    if ((await ethers.provider.getBalance(account.address)) < vetRequired) {
      await admin.sendTransaction({
        to: account.address,
        value: vetRequired,
      });
      console.log(`Sent ${ethers.formatEther(vetRequired)} VET to ${account.address}`);
    }
  }

  await stargateNFT.connect(account).stake(level, {
    value: vetRequired,
  });
};

export const chunk = <T>(array: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(array.length / size) }, (_v, i) => array.slice(i * size, i * size + size));

export const stake = async (stargateAddress: string, accounts: SeedAccount[]) => {
  console.log(`Minting Stargate NFTs (excluding X-Nodes)...`);

  const abi = ABIContract.ofAbi(StargateNFT__factory.abi);
  const stakeFunction = abi.getFunction("stake");

  // Filter out X-Node Levels
  const nonXTokenLevels = initialTokenLevels.filter(level => !level.level.isX);

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    // Assign levelId from non-X Levels in round-robin fashion
    const level = nonXTokenLevels[i % nonXTokenLevels.length].level;

    console.log(`Minting NFT for ${account.key.address} with levelId ${level.id} (${level.name})`);

    const clause = Clause.callFunction(Address.of(stargateAddress), stakeFunction, [level.id]);

    // Send transaction signed by this account's private key
    await TransactionUtils.sendTx(thorClient, [clause], account.key.pk, 5, 3_000_000); // Force gas limit to avoid estimation failures
  }
};
