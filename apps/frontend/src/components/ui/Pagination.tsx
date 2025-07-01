import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowDownIcon } from "@/icons";

type PaginationProps = {
  current: number;
  total: number;
  onShowMore?: () => void;
  text: string;
};

export const Pagination = ({ current, total, onShowMore, text }: PaginationProps) => {
  const { LL } = useI18nContext();
  return (
    <Flex justifyContent={"flex-start"} alignItems={"center"} marginTop={"24px"} columnGap={"16px"}>
      {current < total && (
        <Button rightIcon={<Icon as={ArrowDownIcon} />} variant={"tertiary"} onClick={onShowMore}>
          {LL.show_more()}
        </Button>
      )}

      <Text color={"gray.600"} fontSize={"14px"}>
        {text}
      </Text>
    </Flex>
  );
};
