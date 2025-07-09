import { useI18nContext } from "@/i18n/i18n-react";
import { CheckCircleIcon } from "@/icons";
import { Button, ButtonProps, Icon } from "@chakra-ui/react";

export const VotedChip = (props: ButtonProps) => {
  const { LL } = useI18nContext();
  return (
    <Button
      variant={"feedback"}
      rightIcon={<Icon as={CheckCircleIcon} boxSize={{ base: 5, md: 6 }} />}
      size={{ base: "md", md: "lg" }}
      pointerEvents={"none"}
      {...props}>
      {LL.voted()}
    </Button>
  );
};
