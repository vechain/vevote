import {
  Modal as BaseModal,
  ColorProps,
  Heading,
  Icon,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
} from "@chakra-ui/react";
import { SVGProps } from "react";
import { BaseModalContent } from "./BaseModalContent";

export const ModalSkeleton = ({
  children,
  showCloseButton = true,
  ...props
}: ModalProps & { showCloseButton?: boolean }) => {
  return (
    <BaseModal isCentered {...props}>
      <ModalOverlay />
      <BaseModalContent>
        {showCloseButton && <ModalCloseButton onClick={props.onClose} />}
        {children}
      </BaseModalContent>
    </BaseModal>
  );
};

type MessageModalProps = Omit<ModalProps, "variant"> & {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  title?: string;
  iconColor?: ColorProps["color"];
};
export const MessageModal = ({ children, title, icon, iconColor = "primary.500", ...props }: MessageModalProps) => {
  return (
    <BaseModal isCentered {...props}>
      <ModalOverlay />
      <BaseModalContent gap={2} maxWidth={{ md: "480px" }}>
        <ModalHeader textAlign={"center"} display={"flex"} flexDirection={"column"} alignItems={"center"}>
          <Icon color={iconColor} boxSize={{ base: 14, md: 16 }} as={icon} paddingBottom={6} />
          <Text fontSize={{ base: 16, md: 20 }} color={"gray.600"} fontWeight={600}>
            {title}
          </Text>
        </ModalHeader>
        {children}
      </BaseModalContent>
    </BaseModal>
  );
};

export const ModalTitle = ({
  title,
  icon,
}: {
  title: string;
  icon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}) => {
  return (
    <Heading
      fontSize={{ base: 16, md: 20 }}
      fontWeight={600}
      color={"primary.600"}
      display={"flex"}
      alignItems={"center"}
      gap={2}>
      {icon && <Icon as={icon} color={"primary.600"} />}
      {title}
    </Heading>
  );
};
