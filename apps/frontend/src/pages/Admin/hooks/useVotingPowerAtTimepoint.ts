import { useQuery } from "@tanstack/react-query";
import { veVoteService } from "../services/VeVoteService";

export interface VotingPowerAtTimepointResult {
  nodePower: bigint;
  validatorPower: bigint;
  totalPower: bigint;
}

interface UseVotingPowerAtTimepointProps {
  address?: string;
  timepoint?: number;
  masterAddress?: string;
}

export const useVotingPowerAtTimepoint = ({ address, timepoint, masterAddress }: UseVotingPowerAtTimepointProps) => {
  return useQuery({
    queryKey: ["votingPowerAtTimepoint", address, timepoint, masterAddress],
    queryFn: async (): Promise<VotingPowerAtTimepointResult> => {
      if (!address || timepoint === undefined) {
        return {
          nodePower: BigInt(0),
          validatorPower: BigInt(0),
          totalPower: BigInt(0),
        };
      }

      const [nodePower, validatorPowerWithNodePower] = await Promise.all([
        veVoteService.getVotingPowerAtTimepoint(address, timepoint),
        masterAddress ? veVoteService.getVotingPowerAtTimepoint(address, timepoint, masterAddress) : BigInt(0),
      ]);

      return {
        nodePower,
        validatorPower: validatorPowerWithNodePower - nodePower,
        totalPower: validatorPowerWithNodePower,
      };
    },
    enabled: !!address && timepoint !== undefined,
    staleTime: 30000,
  });
};
