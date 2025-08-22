import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { VoteCastWebSocket } from "../services/VoteCastWebSocket";

export const useVoteCastInvalidate = () => {
  const queryClient = useQueryClient();
  const wsRef = useRef<VoteCastWebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new VoteCastWebSocket();

    const unsubscribe = wsRef.current.onInvalidateVoteCast(() => {
      queryClient.invalidateQueries({
        queryKey: ["voteCastResults"],
      });

      queryClient.invalidateQueries({
        queryKey: ["hasVoted"],
      });

      queryClient.invalidateQueries({
        queryKey: ["totalVotes"],
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
