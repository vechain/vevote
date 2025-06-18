import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Icon, Link, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { useBuildCreateProposal } from "@/hooks/useBuildCreatePropose";
import { useCreateProposal } from "./CreateProposalProvider";
import { useCallback, useState } from "react";
import { uploadProposalToIpfs } from "@/utils/ipfs/proposal";
import { getHashProposal } from "@/utils/proposals/proposalsQueries";
import { useWallet } from "@vechain/vechain-kit";
import { ArrowRightIcon, CheckIcon, CircleInfoIcon, CircleXIcon, RetryIcon } from "@/icons";
import { useGetDatesBlocks } from "@/hooks/useGetDatesBlocks";

export const PublishButton = () => {
  const { LL } = useI18nContext();
  const { isOpen: isPublishOpen, onClose: onPublishClose, onOpen: onPublishOpen } = useDisclosure();
  const { isOpen: isFailedOpen, onClose: onFailedClose, onOpen: onFailedOpen } = useDisclosure();
  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();

  const [isLoading, setIsLoading] = useState(false);
  const [newProposalId, setNewProposalId] = useState("");

  const { proposalDetails } = useCreateProposal();
  const {
    build: { sendTransaction, error: transError },
    error,
    resetError,
  } = useBuildCreateProposal();

  const { startBlock, durationBlock } = useGetDatesBlocks({
    startDate: proposalDetails.startDate,
    endDate: proposalDetails.endDate,
  });

  const { account } = useWallet();

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      resetError();

      const description = await uploadProposalToIpfs(proposalDetails);

      const data = {
        ...proposalDetails,
        startBlock,
        durationBlock,
        description,
      };

      await sendTransaction(data);

      console.log("error", transError);

      if (error) throw new Error(`Failed to sing transaction`);

      const res = await getHashProposal({ ...data, proposer: account?.address || "" });

      if (res.success) setNewProposalId((res.result.plain as BigInteger).toString());

      onPublishClose();
      onSuccessOpen();
    } catch (e) {
      onPublishClose();
      onFailedOpen();
    } finally {
      setIsLoading(false);
    }
  }, [
    account?.address,
    durationBlock,
    error,
    onFailedOpen,
    onPublishClose,
    onSuccessOpen,
    proposalDetails,
    resetError,
    sendTransaction,
    startBlock,
    transError,
  ]);

  const onTryAgain = useCallback(() => onFailedClose(), [onFailedClose]);

  return (
    <>
      <Button variant={"primary"} type="button" onClick={onPublishOpen} rightIcon={<Icon as={ArrowRightIcon} />}>
        {LL.proposal.create.summary_form.publish_proposal()}
      </Button>
      {/* Publish modal */}
      <MessageModal
        isOpen={isPublishOpen}
        onClose={onPublishClose}
        icon={CircleInfoIcon}
        iconColor={"primary.500"}
        title={LL.proposal.create.summary_form.publish_proposal()}>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {LL.proposal.create.summary_form.publish_description()}
        </Text>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {LL.proposal.create.summary_form.publish_sub_description()}
        </Text>
        <ModalFooter width={"full"} justifyContent={"space-center"} mt={7} gap={4}>
          <Button width={"full"} onClick={onPublishClose} variant={"tertiary"} type="button">
            {LL.cancel()}
          </Button>
          <Button width={"full"} onClick={onSubmit} isLoading={isLoading} rightIcon={<Icon as={CheckIcon} />}>
            {LL.confirm()}
          </Button>
        </ModalFooter>
      </MessageModal>
      {/* Publish Failed modal */}
      <MessageModal
        isOpen={isFailedOpen}
        onClose={onFailedClose}
        icon={CircleXIcon}
        iconColor={"red.600"}
        title={LL.proposal.create.summary_form.publish_failed()}>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {LL.proposal.create.summary_form.publish_failed_description()}
        </Text>
        <ModalFooter width={"full"} justifyContent={"space-center"} mt={7} gap={4}>
          <Button width={"full"} onClick={onFailedClose} variant={"tertiary"} type="button">
            {LL.cancel()}
          </Button>
          <Button width={"full"} onClick={onTryAgain} leftIcon={<Icon as={RetryIcon} />}>
            {LL.try_again()}
          </Button>
        </ModalFooter>
      </MessageModal>
      {/* Publish success modal */}
      <MessageModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        icon={CheckIcon}
        iconColor={"primary.500"}
        title={LL.proposal.create.summary_form.publish_success()}>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {LL.proposal.create.summary_form.publish_success_description()}
        </Text>
        <ModalFooter width={"full"} justifyContent={"space-center"} mt={7}>
          <Button
            as={Link}
            width={"full"}
            href={`/proposal/${newProposalId}`}
            color={"white"}
            _hover={{ textDecoration: "none" }}>
            {LL.continue()}
          </Button>
        </ModalFooter>
      </MessageModal>
    </>
  );
};
