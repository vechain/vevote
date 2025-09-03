import { Text, TextProps, FormControl, Input } from "@chakra-ui/react";
import { FixedPointNumber, Units } from "@vechain/sdk-core";
import { useI18nContext } from "@/i18n/i18n-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

export const TableHeader = ({ label }: { label: string }) => {
  return (
    <Text
      whiteSpace="nowrap"
      fontSize={12}
      color="gray.800"
      fontWeight={500}
      textTransform="none"
      flex={1}
      textAlign="center">
      {label}
    </Text>
  );
};

export const BaseCell = ({ value, ...restProps }: TextProps & { value: string | number }) => {
  return (
    <Text whiteSpace="nowrap" fontSize={12} color="gray.600" textAlign="center" {...restProps}>
      {value}
    </Text>
  );
};

export const VETAmountCell = ({ amount }: { amount: bigint }) => {
  const { LL } = useI18nContext();

  return (
    <BaseCell
      value={LL.admin.vet_format({
        amount: Units.formatEther(FixedPointNumber.of(amount)),
      })}
      fontWeight={500}
    />
  );
};

export const BooleanCell = ({ value }: { value: boolean }) => {
  const { LL } = useI18nContext();

  return (
    <Text
      textAlign="center"
      fontWeight={500}
      fontSize={12}
      borderRadius={4}
      p={1}
      minWidth="60px"
      bg={value ? "green.100" : "red.100"}
      color={value ? "green.700" : "red.700"}>
      {value ? LL.admin.stargate_nodes.yes() : LL.admin.stargate_nodes.no()}
    </Text>
  );
};

export const NumberCell = ({ value, suffix }: { value: number | bigint; suffix?: string }) => {
  const displayValue = typeof value === "bigint" ? value.toString() : value.toLocaleString();
  return <BaseCell value={suffix ? `${displayValue} ${suffix}` : displayValue} fontWeight={500} />;
};

export const MultiplierInputCell = ({
  fieldName,
  placeholder,
  register,
  errors,
}: {
  fieldName: string;
  placeholder: string;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}) => {
  return (
    <FormControl isInvalid={!!errors[fieldName]} display="flex" justifyContent="center">
      <Input
        type="number"
        placeholder={placeholder}
        min={0}
        max={1000}
        step={10}
        size="sm"
        width="100px"
        textAlign="center"
        {...register(fieldName)}
      />
    </FormControl>
  );
};

export const NodeTypeCell = ({ name, type }: { name: string; type: "regular" | "x-node" }) => {
  return (
    <Text
      fontSize="sm"
      fontWeight="medium"
      textAlign="left"
      color={type === "x-node" ? "green.700" : "gray.700"}
      bg={type === "x-node" ? "green.50" : "transparent"}
      p={2}
      borderRadius={4}>
      {name}
    </Text>
  );
};
