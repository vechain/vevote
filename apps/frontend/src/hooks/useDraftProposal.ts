import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { ProposalCardType } from "@/types/proposal";
import dayjs from "dayjs";

export const useDraftProposal = () => {
  const fromDraftToProposal = (
    draftProposal: ProposalCardType | null,
    defaultProposal: ProposalDetails,
  ): ProposalDetails => {
    if (!draftProposal) return defaultProposal;
    return {
      ...draftProposal,
      startDate: dayjs(draftProposal.startDate).toDate(),
      endDate: dayjs(draftProposal.endDate).toDate(),
    };
  };

  const fromProposalToDraft = async (proposalDetails: ProposalDetails): Promise<ProposalCardType> => {
    const file = proposalDetails.headerImage?.source;
    let base64Url = "";

    if (file) {
      base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(new Blob([file]));
      });
    }

    const draft: ProposalCardType = {
      ...proposalDetails,
      status: "draft",
      id: "draft",
      proposer: "0x",
      createdAt: new Date(),
      headerImage: {
        name: proposalDetails.headerImage?.name ?? "",
        size: proposalDetails.headerImage?.size ?? 0,
        type: proposalDetails.headerImage?.type ?? "",
        url: base64Url,
        source: file,
      },
    };

    return draft;
  };

  return { fromDraftToProposal, fromProposalToDraft };
};
