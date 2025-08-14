import { useProposal } from "@/components/proposal/ProposalProvider";
import { CanceledInfoBox } from "@/components/ui/InfoBox";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useMemo } from "react";

export const CanceledProposal = () => {
  const { proposal } = useProposal();
  const { formattedProposalDate } = useFormatDate();

  const cancellationDate = useMemo(() => proposal.canceledDate || new Date(), [proposal.canceledDate]);
  const formattedDate = formattedProposalDate(cancellationDate);

  return <CanceledInfoBox reason={proposal.reason} date={formattedDate} />;
};
