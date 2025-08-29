import { useQuery } from "@tanstack/react-query";
import { stargateService } from "../services";

export function useStargateStats() {
  return useQuery({
    queryKey: ["stargateStats"],
    queryFn: () => stargateService.getStargateStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
}

export function useStargateLevels() {
  return useQuery({
    queryKey: ["stargateLevels"],
    queryFn: () => stargateService.getLevels(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTokensOwnedBy(owner: string) {
  return useQuery({
    queryKey: ["tokensOwnedBy", owner],
    queryFn: () => stargateService.getTokensOwnedBy(owner),
    enabled: !!owner.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}