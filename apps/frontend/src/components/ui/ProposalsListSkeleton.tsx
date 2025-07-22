import { TabPanel } from "@chakra-ui/react";
import { ProposalCardSkeleton } from "./ProposalCardSkeleton";

export const ProposalsListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <TabPanel display={"flex"} flexDirection={"column"} gap={{ base: 2, md: 4 }}>
      {Array.from({ length: count }).map((_, index) => (
        <ProposalCardSkeleton key={index} />
      ))}
    </TabPanel>
  );
};