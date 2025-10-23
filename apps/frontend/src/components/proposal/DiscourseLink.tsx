import { useI18nContext } from "@/i18n/i18n-react";
import { DiscourseIcon } from "@/icons";
import { Icon, Link, Tooltip } from "@chakra-ui/react";

export const DiscourseLink = ({ src }: { src: string }) => {
  const { LL } = useI18nContext();
  return (
    <Tooltip label={LL.discuss_on_discourse()} placement="auto">
      <Link
        href={src}
        isExternal
        fontSize="sm"
        _hover={{ textDecoration: "underline" }}
        onClick={e => e.stopPropagation()}>
        <Icon as={DiscourseIcon} color="primary.700" />
      </Link>
    </Tooltip>
  );
};
