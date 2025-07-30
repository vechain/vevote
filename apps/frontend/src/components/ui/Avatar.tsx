import { Image, ImageProps } from "@chakra-ui/react";

export const Avatar = (props: ImageProps) => {
  return <Image src="/svgs/avatar.svg" alt="User Avatar" borderRadius="full" objectFit="cover" {...props} />;
};
