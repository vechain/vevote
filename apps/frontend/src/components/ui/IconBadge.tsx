import { TagProps, Tag, TagLeftIcon } from "@chakra-ui/react";
import { useMemo } from "react";
import { FiEdit2 } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { MdOutlineHowToVote } from "react-icons/md";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { BiCheckDouble } from "react-icons/bi";
import { FaRegCircleXmark } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useI18nContext } from "@/i18n/i18n-react";

export const IconBadge = ({ variant, ...rest }: Omit<TagProps, "children">) => {
  const { LL } = useI18nContext();
  const IconElement = useMemo(() => {
    switch (variant) {
      case "draft":
        return FiEdit2;
      case "upcoming":
        return IoMdTime;
      case "voting":
        return MdOutlineHowToVote;
      case "approved":
        return HiOutlineCheckCircle;
      case "executed":
        return BiCheckDouble;
      case "canceled":
        return RiDeleteBin6Line;
      case "rejected":
        return FaRegCircleXmark;
      default:
        return FiEdit2;
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
      default:
        return LL.badge.draft();
    }
  }, [variant, LL]);

  return (
    <Tag variant={variant} {...rest}>
      <TagLeftIcon as={IconElement} />
      {text}
    </Tag>
  );
};
