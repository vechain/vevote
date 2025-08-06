import { useI18nContext } from "@/i18n/i18n-react";
import { FilterIcon } from "@/icons";
import { ProposalStatus } from "@/types/proposal";
import {
  Button,
  Checkbox,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuOptionGroup,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_STATUSES: ProposalStatus[] = [
  ProposalStatus.APPROVED,
  ProposalStatus.CANCELED,
  ProposalStatus.DRAFT,
  ProposalStatus.EXECUTED,
  ProposalStatus.REJECTED,
  ProposalStatus.UPCOMING,
  ProposalStatus.VOTING,
  ProposalStatus.MIN_NOT_REACHED,
];

export const FiltersDropdown = ({
  statuses,
  setStatuses,
  ...restProps
}: Omit<MenuButtonProps, "children"> & {
  statuses: ProposalStatus[];
  setStatuses: (newStatuses: ProposalStatus[]) => void;
}) => {
  const { LL } = useI18nContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [tempStatuses, setTempStatuses] = useState<ProposalStatus[]>(statuses);

  const onChangeStatus = useCallback(
    (value: ProposalStatus) => {
      const values = tempStatuses.includes(value)
        ? tempStatuses.filter(status => status !== value)
        : [...tempStatuses, value];
      setTempStatuses(values);
    },
    [tempStatuses],
  );

  const handleApply = useCallback(() => {
    setStatuses(tempStatuses);
    onClose();
  }, [tempStatuses, setStatuses, onClose]);

  const handleReset = useCallback(() => {
    setTempStatuses(DEFAULT_STATUSES);
    setStatuses(DEFAULT_STATUSES);
    onClose();
  }, [setStatuses, onClose]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(tempStatuses.sort()) !== JSON.stringify(statuses.sort());
  }, [tempStatuses, statuses]);

  const options = useMemo(() => {
    return Object.entries(LL.badge).map(opt => {
      return {
        value: opt[0] as ProposalStatus,
        label: opt[1](),
      };
    });
  }, [LL.badge]);

  useEffect(() => {
    setTempStatuses(statuses);
  }, [statuses]);
  return (
    <Menu closeOnSelect={false} isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <MenuButton as={Button} variant={"secondary"} size={{ base: "md", md: "lg" }} {...restProps}>
        <Flex alignItems={"center"} gap={2}>
          <Text>{LL.filters.title()}</Text>
          <Icon as={FilterIcon} />
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup type="checkbox">
          {options.map((option, id) => {
            const isSelected = tempStatuses.includes(option.value);
            return (
              <MenuItem
                key={id}
                onClick={() => onChangeStatus(option.value)}
                color={isSelected ? "primary.600" : "gray.600"}
                fontWeight={isSelected ? "semibold" : "normal"}
                _hover={{ bg: isSelected ? "primary.100" : "gray.50" }}>
                {option.label}
                <Checkbox marginLeft={"auto"} isChecked={isSelected} pointerEvents={"none"} />
              </MenuItem>
            );
          })}
        </MenuOptionGroup>
        <MenuDivider />
        <Flex padding={3} gap={2} justifyContent={"space-between"}>
          <Button size="sm" variant="ghost" onClick={handleReset} color="gray.600" _hover={{ bg: "gray.50" }}>
            {LL.filters.reset()}
          </Button>
          <Button size="sm" variant="solid" colorScheme="primary" onClick={handleApply} isDisabled={!hasChanges}>
            {LL.filters.apply()}
          </Button>
        </Flex>
      </MenuList>
    </Menu>
  );
};
