import { DiscourseIcon } from "@/icons";
import { Link } from "@chakra-ui/react";

export const DiscourseLink = ({ src }: { src: string }) => {
  return (
    <Link
      href={src}
      isExternal
      fontSize="sm"
      _hover={{ textDecoration: "underline" }}
      onClick={e => e.stopPropagation()}>
      <DiscourseIcon />
    </Link>
  );
};
