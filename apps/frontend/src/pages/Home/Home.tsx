import { VStack } from "@chakra-ui/react";
import { BalanceCard } from "./components/BalanceCard";

export const Home = () => {
  return (
    <VStack align="stretch" gap={4}>
      <BalanceCard />
    </VStack>
  );
};
