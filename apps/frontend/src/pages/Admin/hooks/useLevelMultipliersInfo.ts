import { useQuery } from "@tanstack/react-query";
import { veVoteService } from "../services/VeVoteService";

export const useLevelMultipliersInfo = () => {
  return useQuery({
    queryKey: ["levelMultipliers"],
    queryFn: () => veVoteService.getLevelMultipliers(),
    staleTime: 1000 * 60 * 5,
  });
};
