import {
  Modal as BaseModal,
  ColorProps,
  Heading,
  Icon,
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

type MessageModalProps = Omit<ModalProps, "variant"> & {
  icon: IconType;
  title?: string;
  iconColor?: ColorProps["color"];
};

export const MessageModal = ({ children, title, icon, iconColor = "primary.500", ...props }: MessageModalProps) => {
  return (
    <BaseModal isCentered {...props}>
      <ModalOverlay />
      <ModalContent gap={2}>
        <ModalHeader textAlign={"center"} display={"flex"} flexDirection={"column"} alignItems={"center"}>
          <Icon color={iconColor} size={"xl"} as={icon} paddingBottom={6} />
          <Text fontSize={20} color={"gray.600"} fontWeight={600}>
            {title}
          </Text>
        </ModalHeader>
        {children}
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
