import { Image, ImageProps } from "@chakra-ui/react";

export const VoteLogo = (props: ImageProps) => {
  return (
    <Image
      src={import.meta.env.VITE_BASE_PATH + "svgs/vevote_logo.svg"}
      alt="VeVote Logo"
      width={"auto"}
      objectFit={"cover"}
      transition={"all 0.3s"}
      {...props}
    />
  );
};
