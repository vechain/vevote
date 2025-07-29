import {
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  MenuOptionGroup,
  Text,
} from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { CheckIcon, FilterIcon } from "@/icons";
import { ProposalStatus } from "@/types/proposal";

export const FiltersDropdown = ({
  statuses,
  setStatuses,
  ...restProps
}: Omit<MenuButtonProps, "children"> & {
  statuses: ProposalStatus[];
  setStatuses: Dispatch<SetStateAction<ProposalStatus[]>>;
}) => {
  const { LL } = useI18nContext();
  const onChangeStatus = useCallback(
    (value: ProposalStatus) => {
      const values = statuses.includes(value) ? statuses.filter(status => status !== value) : [...statuses, value];
      setStatuses(values);
    },
    [setStatuses, statuses],
  );
  const options = useMemo(() => {
    return Object.entries(LL.badge).map(opt => ({
      value: opt[0] as ProposalStatus,
      label: opt[1](),
    }));
  }, [LL.badge]);
  return (
    <Menu>
      <MenuButton as={Button} variant={"secondary"} size={{ base: "md", md: "lg" }} {...restProps}>
        <Flex alignItems={"center"} gap={2}>
          <Text>{LL.filters.title()}</Text>
          <Icon as={FilterIcon} />
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup defaultValue={statuses} type="checkbox">
          {options.map((option, id) => {
            const isSelected = statuses.includes(option.value);
            return (
              <MenuItem
                key={id}
                onClick={() => onChangeStatus(option.value)}
                color={isSelected ? "primary.600" : "gray.600"}
                fontWeight={isSelected ? "semibold" : "normal"}
                _hover={{ bg: isSelected ? "primary.100" : "gray.50" }}>
                {option.label}
                {isSelected && <Icon marginLeft={"auto"} as={CheckIcon} />}
              </MenuItem>
            );
          })}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
