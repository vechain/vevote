import { TagProps, Tag, TagLeftIcon } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { ClockIcon, EditIcon, VoteIcon, CheckCircleIcon, CheckDoubleIcon, CancelIcon, CircleXIcon } from "@/icons";

export const IconBadge = ({ variant, ...rest }: Omit<TagProps, "children">) => {
  const { LL } = useI18nContext();
  const IconElement = useMemo(() => {
    switch (variant) {
      case "draft":
        return EditIcon;
      case "upcoming":
        return ClockIcon;
      case "voting":
        return VoteIcon;
      case "approved":
        return CheckCircleIcon;
      case "executed":
        return CheckDoubleIcon;
      case "canceled":
        return CancelIcon;
      case "rejected":
        return CircleXIcon;
      case "min-not-reached":
        return CircleXIcon;
      default:
        return EditIcon;
    }
  }, [variant]);

  const text = useMemo(() => {
    switch (variant) {
      case "draft":
        return LL.badge.draft();
      case "upcoming":
        return LL.badge.upcoming();
      case "voting":
        return LL.badge.voting();
      case "approved":
        return LL.badge.approved();
      case "executed":
        return LL.badge.executed();
      case "canceled":
        return LL.badge.canceled();
      case "rejected":
        return LL.badge.rejected();
      case "min-not-reached":
        return LL.badge.min_not_reached();
      default:
        return LL.badge.draft();
    }
  }, [variant, LL]);

  return (
    <Tag variant={variant === "min-not-reached" ? "rejected" : variant} {...rest}>
      <TagLeftIcon as={IconElement} width={{ base: 3, md: 5 }} height={{ base: 3, md: 5 }} />
      {text}
    </Tag>
  );
};
