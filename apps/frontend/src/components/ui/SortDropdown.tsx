import {
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { Dispatch, SetStateAction } from "react";
import { SortDescIcon } from "@/icons";

export enum Sort {
  Newest = "newest",
  Oldest = "oldest",
}

export const SortDropdown = ({
  sort,
  setSort,
  ...restProps
}: Omit<MenuButtonProps, "children"> & { sort: Sort; setSort: Dispatch<SetStateAction<Sort>> }) => {
  const { LL } = useI18nContext();
  return (
    <Menu>
      <MenuButton as={Button} variant={"secondary"} size={{ base: "md", md: "icon" }} flexShrink={0} {...restProps}>
        <Icon as={SortDescIcon} />
      </MenuButton>
      <MenuList>
        <MenuOptionGroup defaultValue={sort} onChange={value => setSort(value as Sort)}>
          <MenuItemOption iconPlacement={"end"} value={Sort.Newest}>
            {LL.filters.sort.newest()}
          </MenuItemOption>
          <MenuItemOption iconPlacement={"end"} value={Sort.Oldest}>
            {LL.filters.sort.oldest()}
          </MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
