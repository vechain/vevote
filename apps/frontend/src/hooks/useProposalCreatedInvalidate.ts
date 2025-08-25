import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProposalCreatedWebSocket } from "../services/ProposalCreatedWebSocket";

export const useProposalCreatedInvalidate = () => {
  const queryClient = useQueryClient();
  const wsRef = useRef<ProposalCreatedWebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new ProposalCreatedWebSocket();

    const unsubscribe = wsRef.current.onInvalidateProposalCreated(() => {
      queryClient.invalidateQueries({
        queryKey: ["infiniteProposals"],
      });
    });

    wsRef.current.connect();

    return () => {
      unsubscribe();
      wsRef.current?.disconnect();
      wsRef.current = null;
    };
  }, [queryClient]);

  return {};
};
