import { getConfig } from "@repo/config"
import { VeVote__factory } from "@repo/contracts"
import { getCallKey, useCall } from "../utils/hooks/useCall"
import { compareAddresses } from "@repo/utils/AddressUtils"
import { useWallet } from "@vechain/vechain-kit"

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress
const contractInterface = VeVote__factory.createInterface()
const method = "owner"

export const getVeVoteMinterQueryKey = () => {
  getCallKey({ method })
}

export const useVeVoteMinter = () => {
  const { account } = useWallet()
  const results = useCall({
    contractInterface,
    contractAddress,
    method,
  })

  return {
    ...results,
    minter: results.data,
    isMinter: compareAddresses(results.data || "", account?.address || ""),
    isMinterLoading: results.isPending,
  }
}
