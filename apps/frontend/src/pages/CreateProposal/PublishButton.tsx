import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Icon, Link, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { useBuildCreateProposal } from "@/hooks/useBuildCreatePropose";
import { useCreateProposal } from "./CreateProposalProvider";
import { useCallback, useEffect, useState } from "react";
import { uploadProposalToIpfs } from "@/utils/ipfs/proposal";
import { getHashProposal } from "@/utils/proposals/proposalsQueries";
import { useWallet } from "@vechain/vechain-kit";
import { ArrowRightIcon, CheckIcon, CircleInfoIcon, CircleXIcon, RetryIcon } from "@/icons";
import { useGetDatesBlocks } from "@/hooks/useGetDatesBlocks";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";

export const PublishButton = () => {
  const { LL } = useI18nContext();
  const { account } = useWallet();

  const { isOpen: isPublishOpen, onClose: onPublishClose, onOpen: onPublishOpen } = useDisclosure();
  const { isOpen: isFailedOpen, onClose: onFailedClose, onOpen: onFailedOpen } = useDisclosure();
  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();

  const [isLoading, setIsLoading] = useState(false);
  const [newProposalId, setNewProposalId] = useState("");

  const { proposalDetails } = useCreateProposal();
  const {
    build: { sendTransaction, status, txReceipt },
  } = useBuildCreateProposal();

  const { startBlock, durationBlock } = useGetDatesBlocks({
    startDate: proposalDetails.startDate,
    endDate: proposalDetails.endDate,
  });

  const onSuccess = useCallback(() => {
    onPublishClose();
    onSuccessOpen();
  }, [onPublishClose, onSuccessOpen]);

  const onFailed = useCallback(() => {
    onPublishClose();
    onFailedOpen();
  }, [onFailedOpen, onPublishClose]);

  const onSubmit = useCallback(async () => {
    let proposalId = "";

    try {
      setIsLoading(true);
      setNewProposalId("");

      trackEvent(MixPanelEvent.PROPOSAL_PUBLISH);

      const description = await uploadProposalToIpfs(proposalDetails);

      const data = {
        ...proposalDetails,
        startBlock,
        durationBlock,
        description,
      };

      await sendTransaction(data);

      const res = await getHashProposal({ ...data, proposer: account?.address || "" });
      if (res.success) {
        proposalId = (res.result.plain as BigInteger).toString();
        setNewProposalId(proposalId);

        trackEvent(MixPanelEvent.PROPOSAL_PUBLISHED, {
          proposalId,
          transactionId: txReceipt?.meta.txID || "unknown",
        });
      }
    } catch (e) {
      trackEvent(MixPanelEvent.PROPOSAL_PUBLISH_FAILED, {
        proposalId: proposalId || proposalDetails.title,
        error: e instanceof Error ? e.message : "Unknown error",
        transactionId: txReceipt?.meta.txID || "unknown",
      });
      onFailed();
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, durationBlock, onFailed, proposalDetails, sendTransaction, startBlock, txReceipt?.meta.txID]);

  const onTryAgain = useCallback(() => onFailedClose(), [onFailedClose]);

  useEffect(() => {
    if (newProposalId) {
      onSuccess();
    }
  }, [newProposalId, onFailed, onFailedOpen, onSuccess, status]);

  return (
    <>
      <Button
        variant={"primary"}
        type="button"
        onClick={() => {
          // Track CTA click
          trackEvent(MixPanelEvent.CTA_PUBLISH_CLICKED, {
            proposalId: proposalDetails.title,
          });
          onPublishOpen();
        }}
        rightIcon={<Icon as={ArrowRightIcon} />}>
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
