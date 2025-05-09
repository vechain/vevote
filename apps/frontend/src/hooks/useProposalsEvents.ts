import { ProposalCardType } from "@/types/proposal";
import { executeMultipleClauses } from "@/utils/contract";
import { getStatusFromState, getStatusParProposal } from "@/utils/proposals/helpers";
import { getProposalsEvents } from "@/utils/proposals/proposalsEvents";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/vechain-kit";
import { useMemo } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

/**
 *  Hook to get the proposals events from the governor contract (i.e the proposals created, canceled and executed)
 * @returns  the proposals events
 */
export const useProposalsEvents = (): { proposals: ProposalCardType[] } => {
  const { thor } = useConnex();

  const { data } = useQuery({
    queryKey: ["proposalsEvents"],
    queryFn: async () => await getProposalsEvents(thor),
    enabled: !!thor,
  });

  const { data: proposalsState } = useQuery({
    queryKey: ["proposalsState"],
    queryFn: async () =>
      await executeMultipleClauses({
        contractAddress,
        contractInterface,
        methodsWithArgs: getStatusParProposal(data?.proposals),
      }),
    enabled: !!thor,
  });

  //TODO: get rest of data from ipfs

  const proposals = useMemo(() => {
    const parsedProposalState = proposalsState?.map(r => {
      return getStatusFromState(Number(r.result.plain));
    });

    if (!parsedProposalState) return [];

    return (
      (data?.proposals?.map((p, i) => ({
        status: parsedProposalState[i],
        ...p,
      })) as ProposalCardType[]) || []
    );
  }, [data?.proposals, proposalsState]);

  return { proposals };
};
