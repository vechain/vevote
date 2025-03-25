import { Button, Icon, Menu, MenuButton, MenuItemOption, MenuList, MenuOptionGroup } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { Dispatch, SetStateAction } from "react";
import { BsSortDown } from "react-icons/bs";

export enum Sort {
  Newest = "newest",
  Oldest = "oldest",
  MostParticipant = "most_participant",
  LeastParticipant = "least_participant",
}

export const SortDropdown = ({ sort, setSort }: { sort: Sort; setSort: Dispatch<SetStateAction<Sort>> }) => {
  const { LL } = useI18nContext();
  return (
    <Menu>
      <MenuButton as={Button} variant={"icon"} size={"fit"}>
        <Icon as={BsSortDown} />
      </MenuButton>
      <MenuList>
        <MenuOptionGroup defaultValue={sort} onChange={value => setSort(value as Sort)}>
          <MenuItemOption iconPlacement={"end"} value={Sort.Newest}>
            {LL.filters.sort.newest()}
          </MenuItemOption>
          <MenuItemOption iconPlacement={"end"} value={Sort.Oldest}>
            {LL.filters.sort.oldest()}
          </MenuItemOption>
          <MenuItemOption iconPlacement={"end"} value={Sort.MostParticipant}>
            {LL.filters.sort.most_participant()}
          </MenuItemOption>
          <MenuItemOption iconPlacement={"end"} value={Sort.LeastParticipant}>
            {LL.filters.sort.least_participant()}
          </MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
