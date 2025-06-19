import { getMasterNode } from "@/utils/proposals/AMNQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useBuildMasterNode = () => {
  const queryClient = useQueryClient();

  const refetchMasterNode = useCallback(
    async (address: string) => {
      return await queryClient.fetchQuery({
        queryKey: ["getMasterNode", address],
        queryFn: async () => await getMasterNode(address),
      });
    },
    [queryClient],
  );

  return {
    refetchMasterNode,
  };
};
