import { Address, HDKey, VET } from "@vechain/sdk-core"
import { getMnemonic } from "./env"
export type TestPk = {
  pk: Uint8Array
  address: Address
}

export type SeedAccount = {
  key: TestPk
  amount: bigint
}

export enum SeedStrategy {
  RANDOM,
  FIXED,
  LINEAR,
}

const mnemonic = getMnemonic()
const hdnode = HDKey.fromMnemonic(mnemonic.split(" "))

export const getTestKey = (index: number): TestPk => {
  const pk = hdnode.deriveChild(index)
  if (!pk.privateKey) {
    throw new Error("Private key not found")
  }
  return {
    pk: pk.privateKey,
    address: Address.ofPrivateKey(pk.privateKey),
  }
}

export const getTestKeys = (count: number): TestPk[] => {
  const accounts = []
  for (let i = 0; i < count; i++) {
    accounts.push(getTestKey(i))
  }

  return accounts
}

/**
 * Generates a random starting balance for an account
 * Lower balances are favoured based on a log scale
 * @param min
 * @param max
 * @returns
 */
const getRandomStartingBalance = (min: number, max: number): bigint => {
  const scale = Math.log(max) - Math.log(min)
  const random = Math.random() ** 6 // Raise to a power to skew towards smaller values.
  const result = Math.exp(Math.log(min) + scale * random)
  return VET.of(Math.floor(result)).wei
}
