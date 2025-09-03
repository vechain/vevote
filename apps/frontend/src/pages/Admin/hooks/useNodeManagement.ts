import { useQuery } from "@tanstack/react-query";
import { nodeManagementService } from "../services";

export function useUserNodeInfo(userAddress: string) {
  return useQuery({
    queryKey: ["userNodeInfo", userAddress],
    queryFn: () => nodeManagementService.getUserNodeInfo(userAddress),
    enabled: !!userAddress.trim(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useNodeLevel(nodeId: bigint) {
  return useQuery({
    queryKey: ["nodeLevel", nodeId.toString()],
    queryFn: () => nodeManagementService.getNodeLevel(nodeId),
    enabled: !!nodeId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useIsNodeHolder(userAddress: string) {
  return useQuery({
    queryKey: ["isNodeHolder", userAddress],
    queryFn: () => nodeManagementService.isNodeHolder(userAddress),
    enabled: !!userAddress.trim(),
    staleTime: 2 * 60 * 1000,
  });
}
