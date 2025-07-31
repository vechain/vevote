import { ModalContent, ModalContentProps } from "@chakra-ui/react";

export const BaseModalContent = ({ children, ...others }: ModalContentProps) => {
  return (
    <ModalContent
      bg="white"
      border="none"
      boxShadow="none"
      position={{ base: "fixed", md: "relative" }}
      bottom={{ base: 0, md: "auto" }}
      mb={{ base: 0, md: "auto" }}
      mt={{ base: "auto", md: "auto" }}
      rounded={{ base: "0", md: "2xl" }}
      roundedTop={{ base: "2xl", md: "2xl" }}
      maxHeight={{ base: "100vh", md: "70vh" }}
      overflow="auto"
      {...others}>
      {children}
    </ModalContent>
  );
};
