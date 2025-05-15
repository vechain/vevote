import { useI18nContext } from "@/i18n/i18n-react";
import { Button } from "@chakra-ui/react";
import { GoArrowRight } from "react-icons/go";

export const PublishButton = () => {
  const { LL } = useI18nContext();
  return (
    <Button variant={"primary"} type="submit">
      {LL.proposal.create.summary_form.publish_proposal()}
      <GoArrowRight />
    </Button>
  );
};
