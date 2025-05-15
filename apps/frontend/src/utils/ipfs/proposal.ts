import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { getConfig } from "@repo/config";
import axios from "axios";
import { uploadBlobToIPFS } from "../ipfs";
import { IpfsDetails } from "@/types/ipfs";
import { executeMultipleClauses } from "../contract";
import { getStatusFromState, getStatusParProposalMethod } from "../proposals/helpers";
import { VeVote__factory } from "@repo/contracts";
import { ProposalCardType } from "@/types/proposal";

const IPFS_FETCHING_SERVICE = getConfig(import.meta.env.VITE_APP_ENV).ipfsFetchingService;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const uploadProposalToIpfs = async ({ title, description, votingQuestion, headerImage }: ProposalDetails) => {
  let headerImageUrl = null;

  if (headerImage?.source) {
    const imageCID = await uploadBlobToIPFS(headerImage?.source, headerImage.name);
    headerImageUrl = `ipfs://${imageCID}`;
  }

  const updatedMetadata = {
    title,
    shortDescription: votingQuestion,
    markdownDescription: description,
    headerImage: {
      type: headerImage?.type,
      name: headerImage?.name,
      size: headerImage?.size,
      url: headerImageUrl,
    },
  };

  try {
    const metadataBlob = new Blob([JSON.stringify(updatedMetadata)], { type: "application/json" });

    return await uploadBlobToIPFS(metadataBlob, "metadata.json");
  } catch (error) {
    console.error("Error uploading proposal to IPFS:", error);
    throw error;
  }
};

export const getProposalsFromIpfs = async (proposalCID: string): Promise<IpfsDetails> => {
  const res = await axios.get(`${IPFS_FETCHING_SERVICE}/${proposalCID}`);
  if (res.status !== 200) throw new Error("ipfs failed");
  return { ipfsHash: proposalCID, ...res.data };
};

export const getProposalsWithState = async (proposalsData?: Omit<ProposalCardType, "status">[]) => {
  try {
    const proposalsState = await executeMultipleClauses({
      contractAddress,
      contractInterface,
      methodsWithArgs: getStatusParProposalMethod(proposalsData?.map(d => d.id || "")),
    });

    const parsedProposalState = proposalsState?.map(r => {
      return getStatusFromState(Number(r.result.plain));
    });

    return (
      (proposalsData?.map((p, i) => ({
        status: parsedProposalState[i],
        ...p,
      })) as ProposalCardType[]) || []
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};
