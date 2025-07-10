import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowLeftIcon } from "@/icons";
import { Button, ButtonProps, Icon, Link } from "@chakra-ui/react";

export const BackButton = (props: ButtonProps) => {
  const { LL } = useI18nContext();
  return (
    <>
      <BaseButton
        display={{
          base: "none",
          md: "flex",
        }}
        {...props}>
        {LL.back()}
      </BaseButton>
      <BaseButton display={{ base: "flex", md: "none" }} size={"md"} minWidth={"40px"} w={"40px"} {...props} />
    </>
  );
};

const BaseButton = ({ children, ...rest }: ButtonProps) => {
  return (
    <Button
      as={Link}
      gap={2}
      alignItems={"center"}
      href="/"
      variant={"secondary"}
      leftIcon={<Icon as={ArrowLeftIcon} w={5} h={5} />}
      {...rest}>
      {children}
    </Button>
  );
};
