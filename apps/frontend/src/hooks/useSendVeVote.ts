import { getConfig } from "@repo/config"
import { VeVote__factory } from "@repo/contracts"
import { useCallback, useMemo } from "react"
import { useBuildTransaction } from "../utils"
import { buildClause } from "../utils/buildClause"
import { getVeVoteBalanceQueryKey } from "./useVeVoteBalance"
import { ethers } from "ethers"
import { useWallet } from "@vechain/vechain-kit"

const GovernorInterface = VeVote__factory.createInterface()

type Props = { onSuccess?: () => void }

type useSendVeVoteParams = {
  amount: string
  receiver: string
}

export const useSendVeVote = ({ onSuccess }: Props) => {
  const { account } = useWallet()

  const clauseBuilder = useCallback(({ amount, receiver }: useSendVeVoteParams) => {
    const contractAmount = ethers.parseEther(amount)
    return [
      buildClause({
        to: getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress,
        contractInterface: GovernorInterface,
        method: "transfer",
        args: [receiver, contractAmount],
        comment: "transfer vevote",
      }),
    ]
  }, [])

  const refetchQueryKeys = useMemo(() => [getVeVoteBalanceQueryKey(account?.address || "")], [account])

  return useBuildTransaction({
    clauseBuilder,
    refetchQueryKeys,
    onSuccess,
  })
}
