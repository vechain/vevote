import { CheckIcon } from "@/icons";
import { Button, Flex, Icon, Menu, MenuButton, MenuButtonProps, MenuItem, MenuList, Portal, Text } from "@chakra-ui/react";
import { SVGProps } from "react";

type Option = string | undefined;

export const VotingBaseDropdown = <T extends Option>({
  selectedOption,
  onChange,
  options,
  label,
  icon,
  renderValue,
  ...restProps
}: Omit<MenuButtonProps, "children" | "onChange"> & {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  label?: string;
  options: T[];
  selectedOption: T;
  onChange?: (value: T) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderValue?: (value: T) => any;
}) => {
  return (
    <Menu 
      strategy="fixed" 
      placement="bottom-start"
      gutter={4}
    >
      <MenuButton
        as={Button}
        variant={"secondary"}
        size={{ base: "md", md: "lg" }}
        w={{ base: "100%", md: "fit-content" }}
        {...restProps}>
        <Flex
          paddingY={2}
          paddingX={4}
          gap={{ base: 0, md: 3 }}
          alignItems={"center"}
          justifyContent={"center"}
          color={"gray.600"}
          w={{ base: "100%", md: "fit-content" }}>
          {label && (
            <Text fontSize={14} fontWeight={600} display={{ base: "none", md: "block" }}>
              {label}
            </Text>
          )}
          <Icon as={icon} boxSize={5} />
        </Flex>
      </MenuButton>
      <MenuList zIndex={10000}>
        {options.map((value, id) => (
          <MenuItem
            key={id}
            onClick={() => onChange?.(value)}
            color={selectedOption === value ? "primary.600" : "gray.600"}
            fontWeight={selectedOption === value ? "semibold" : "normal"}
            _hover={{ bg: selectedOption === value ? "primary.100" : "gray.50" }}>
            {renderValue ? renderValue(value) : value}
            {selectedOption === value && <Icon marginLeft={"auto"} as={CheckIcon} />}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
