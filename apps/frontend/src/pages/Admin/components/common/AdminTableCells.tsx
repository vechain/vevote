import { Text, TextProps, FormControl, Input } from "@chakra-ui/react";
import { FixedPointNumber, Units } from "@vechain/sdk-core";
import { useI18nContext } from "@/i18n/i18n-react";
import { useFormContext } from "react-hook-form";

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

export const NumberCell = ({ value, suffix }: { value: number | bigint; suffix?: string }) => {
  const displayValue = typeof value === "bigint" ? value.toString() : value.toLocaleString();
  return <BaseCell value={suffix ? `${displayValue} ${suffix}` : displayValue} fontWeight={500} />;
};

export const MultiplierInputCell = ({ fieldName, placeholder }: { fieldName: string; placeholder: string }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

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
