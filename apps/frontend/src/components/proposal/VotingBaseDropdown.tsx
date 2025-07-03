import { CheckIcon } from "@/icons";
import { Button, Flex, Icon, Menu, MenuButton, MenuButtonProps, MenuItem, MenuList, Text } from "@chakra-ui/react";
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
}: Omit<MenuButtonProps, "children"> & {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  label?: string;
  options: T[];
  selectedOption: T;
  onChange?: (value: T) => void;
  renderValue?: (value: T) => any;
}) => {
  return (
    <Menu autoSelect={false}>
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
