import { MessageModal } from "@/components/ui/ModalSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Link, ModalFooter, Text, useDisclosure } from "@chakra-ui/react";
import { GoArrowRight } from "react-icons/go";
import { LuInfo } from "react-icons/lu";
import { FaCheck } from "react-icons/fa6";
import { IoCloseCircleOutline, IoReloadSharp } from "react-icons/io5";
import { useBuildCreateProposal } from "@/hooks/useBuildCreatePropose";
import { useCreateProposal } from "./CreateProposalProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { uploadProposalToIpfs } from "@/utils/ipfs/proposal";

export const PublishButton = () => {
  const { LL } = useI18nContext();
  const { isOpen: isPublishOpen, onClose: onPublishClose, onOpen: onPublishOpen } = useDisclosure();
  const { isOpen: isFailedOpen, onClose: onFailedClose, onOpen: onFailedOpen } = useDisclosure();
  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();

  const [isLoading, setIsLoading] = useState(false);

  const { proposalDetails } = useCreateProposal();
  const { sendTransaction, error, txReceipt } = useBuildCreateProposal();

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);

      const description = await uploadProposalToIpfs(proposalDetails);
      await sendTransaction({
        ...proposalDetails,
        description,
      });
      if (error) throw new Error(`Failed to sing transaction`);
      onPublishClose();
      onSuccessOpen();
    } catch (e) {
      console.error(e);
      onPublishClose();
      onFailedOpen();
    } finally {
      setIsLoading(false);
    }
  }, [error, onFailedOpen, onPublishClose, onSuccessOpen, proposalDetails, sendTransaction]);

  const newProposalId = useMemo(() => {
    return txReceipt?.outputs?.[0].events?.[0];
  }, [txReceipt?.outputs]);

  const onTryAgain = useCallback(() => onFailedClose(), [onFailedClose]);

  useEffect(() => {
    console.log("output", txReceipt?.outputs);
  }, [txReceipt?.outputs]);

  return (
    <>
      <Button variant={"primary"} type="button" onClick={onPublishOpen}>
        {LL.proposal.create.summary_form.publish_proposal()}
        <GoArrowRight />
      </Button>
      {/* Publish modal */}
      <MessageModal
        isOpen={isPublishOpen}
        onClose={onPublishClose}
        icon={LuInfo}
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
          <Button width={"full"} onClick={onSubmit} isLoading={isLoading}>
            {LL.confirm()}
            <FaCheck size={24} />
          </Button>
        </ModalFooter>
      </MessageModal>
      {/* Publish Failed modal */}
      <MessageModal
        isOpen={isFailedOpen}
        onClose={onFailedClose}
        icon={IoCloseCircleOutline}
        iconColor={"red.600"}
        title={LL.proposal.create.summary_form.publish_failed()}>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {LL.proposal.create.summary_form.publish_failed_description()}
        </Text>
        <ModalFooter width={"full"} justifyContent={"space-center"} mt={7} gap={4}>
          <Button width={"full"} onClick={onFailedClose} variant={"tertiary"} type="button">
            {LL.cancel()}
          </Button>
          <Button width={"full"} onClick={onTryAgain}>
            <IoReloadSharp size={24} />
            {LL.try_again()}
          </Button>
        </ModalFooter>
      </MessageModal>
      {/* Publish success modal */}
      <MessageModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        icon={FaCheck}
        iconColor={"primary.500"}
        title={LL.proposal.create.summary_form.publish_success()}>
        <Text textAlign={"center"} fontSize={14} color={"gray.600"}>
          {LL.proposal.create.summary_form.publish_success_description()}
        </Text>
        <ModalFooter width={"full"} justifyContent={"space-center"} mt={7}>
          <Link
            as={Button}
            width={"full"}
            href={`/proposal/${newProposalId}`}
            color={"white"}
            _hover={{ textDecoration: "none" }}>
            {LL.continue()}
          </Link>
        </ModalFooter>
      </MessageModal>
    </>
  );
};
