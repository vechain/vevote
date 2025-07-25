import { useI18nContext } from "@/i18n/i18n-react";
import { MessageSquareIcon } from "@/icons";
import { Flex, Icon, Text, Textarea } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useCallback } from "react";

const MAX_COMMENT_SIZE = 80;

type InputCommentProps = {
  comment?: string;
  setComment?: Dispatch<SetStateAction<string | undefined>>;
  disabled?: boolean;
};

export const InputComment = ({ comment, setComment, disabled }: InputCommentProps) => {
  const { LL } = useI18nContext();

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (comment && comment?.length >= MAX_COMMENT_SIZE) {
        if (e.currentTarget.value.length >= MAX_COMMENT_SIZE) return;
        setComment?.(e.currentTarget.value);
      }
      setComment?.(e.currentTarget.value);
    },
    [comment, setComment],
  );

  return (
    <Flex gap={2} flexDirection={"column"} alignItems={"start"}>
      <Flex gap={2} alignItems={"center"}>
        <Icon as={MessageSquareIcon} boxSize={{ base: 4, md: 5 }} />
        <Text fontSize={{ base: 14, md: 16 }} fontWeight={600}>
          {LL.comment()}
        </Text>
      </Flex>

      <Textarea
        background={disabled ? "gray.100" : ""}
        borderColor={disabled ? "gray.200" : ""}
        color={disabled ? "gray.600" : ""}
        fontSize={{ base: 14, md: 16 }}
        defaultValue={comment}
        onChange={onChange}
        placeholder={LL.comment_placeholder()}
        isDisabled={disabled}
      />
      <Text fontSize={12} color={"gray.600"}>
        {LL.filed_length({ current: comment?.length || 0, max: MAX_COMMENT_SIZE })}
      </Text>
    </Flex>
  );
};
