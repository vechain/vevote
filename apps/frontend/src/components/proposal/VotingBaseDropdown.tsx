import {
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, SVGProps } from "react";

type Option = string;

export const VotingBaseDropdown = <T extends Option>({
  selectedOption,
  setSelectedOption,
  options,
  label,
  icon,
  ...restProps
}: Omit<MenuButtonProps, "children"> & {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  label?: string;
  options: T[];
  selectedOption: T;
  setSelectedOption: Dispatch<SetStateAction<T>>;
}) => {
  return (
    <Menu>
      <MenuButton as={Button} variant={"secondary"} padding={0} {...restProps}>
        <Flex paddingY={2} paddingX={4} gap={3} alignItems={"center"} color={"gray.600"} height={"40px"}>
          {label && (
            <Text fontSize={14} fontWeight={600}>
              {label}
            </Text>
          )}
          <Icon as={icon} width={"20px"} height={"20px"} />
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup defaultValue={selectedOption} onChange={value => setSelectedOption(value as T)}>
          {options.map((value, id) => (
            <MenuItemOption key={id} iconPlacement={"end"} value={value}>
              {value}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
