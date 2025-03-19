import { Badge, BadgeProps } from "@chakra-ui/react";
import { useMemo } from "react";
import { FiEdit2 } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { MdOutlineHowToVote } from "react-icons/md";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { BiCheckDouble } from "react-icons/bi";
import { FaRegCircleXmark } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";

export const IconBadge = ({ variant, ...rest }: Omit<BadgeProps, "children">) => {
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
        return "Draft";
      case "upcoming":
        return "Upcoming";
      case "voting":
        return "Voting now";
      case "approved":
        return "Approved";
      case "executed":
        return "Executed";
      case "canceled":
        return "Canceled";
      case "rejected":
        return "Rejected";
      default:
        return "Draft";
    }
  }, [variant]);

  return (
    <Badge variant={variant} {...rest}>
      <IconElement size={16} />
      {text}
    </Badge>
  );
};
