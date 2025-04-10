import {
  Modal as BaseModal,
  ColorProps,
  Flex,
  Heading,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
} from "@chakra-ui/react";
import { IconType } from "react-icons/lib";

export const ModalSkeleton = ({ children, ...props }: ModalProps) => {
  return (
    <BaseModal isCentered {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        {children}
      </ModalContent>
    </BaseModal>
  );
};

type MessageModalProps = Omit<ModalProps, "variant" | "onClose"> & {
  icon: IconType;
  title?: string;
  description?: string;
  iconColor?: ColorProps["color"];
};

export const MessageModal = ({
  children,
  title,
  description,
  icon,
  iconColor = "primary.500",
  ...props
}: MessageModalProps) => {
  return (
    <BaseModal onClose={() => {}} closeOnOverlayClick={false} isCentered {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign={"center"} display={"flex"} flexDirection={"column"} alignItems={"center"}>
          <Icon color={iconColor} size={"xl"} as={icon} paddingBottom={4} />
          <Flex flexDirection={"column"} gap={2}>
            <Text variant={"subtitle"}>{title}</Text>
            <Text variant={"paragraph"}>{description}</Text>
          </Flex>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </BaseModal>
  );
};

export const ModalTitle = ({ title, icon }: { title: string; icon?: IconType }) => {
  return (
    <Heading fontSize={20} fontWeight={600} color={"primary.600"} display={"flex"} alignItems={"center"} gap={2}>
      {icon && <Icon as={icon} color={"primary.600"} />}
      {title}
    </Heading>
  );
};
