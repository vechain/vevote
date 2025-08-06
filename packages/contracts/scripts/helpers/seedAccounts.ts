import { Address, HDKey, VET } from "@vechain/sdk-core";
import { getMnemonic } from "./env";
export type TestPk = {
  pk: Uint8Array;
  address: Address;
};

export type SeedAccount = {
  key: TestPk;
  amount: bigint;
};

export enum SeedStrategy {
  RANDOM,
  FIXED,
  LINEAR,
}

const mnemonic = getMnemonic();
const hdnode = HDKey.fromMnemonic(mnemonic.split(" "));

export const getTestKey = (index: number): TestPk => {
  const pk = hdnode.deriveChild(index);
  if (!pk.privateKey) {
    throw new Error("Private key not found");
  }
  return {
    pk: pk.privateKey,
    address: Address.ofPrivateKey(pk.privateKey),
  };
};

export const getSeedAccounts = (numAccounts: number, acctOffset: number): SeedAccount[] => {
  const keys = getTestKeys(numAccounts + acctOffset);

  const seedAccounts: SeedAccount[] = [];

  keys.slice(acctOffset).forEach(key => {
    seedAccounts.push({
      key,
      amount: 0n,
    });
  });

  return seedAccounts;
};

export const getTestKeys = (count: number): TestPk[] => {
  const accounts = [];
  for (let i = 0; i < count; i++) {
    accounts.push(getTestKey(i));
  }

  return accounts;
};
