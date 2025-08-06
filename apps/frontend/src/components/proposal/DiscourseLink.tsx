import { DiscourseIcon } from "@/icons";
import { Icon, Link } from "@chakra-ui/react";

export const DiscourseLink = ({ src }: { src: string }) => {
  return (
    <Link
      href={src}
      isExternal
      fontSize="sm"
      _hover={{ textDecoration: "underline" }}
      onClick={e => e.stopPropagation()}>
      <Icon as={DiscourseIcon} color="primary.700" />
    </Link>
  );
};
