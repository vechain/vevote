import { InputIncrement } from "@/components/ui/InputIncrement";
import { Controller, useFormContext } from "react-hook-form";

export const MIN_CHOICE_ALLOWED = 1;

type InputLimitProps = {
  isMinDisable?: boolean;
  isMaxDisable?: boolean;
};

export const InputLimitControlled = (props: InputLimitProps) => {
  const { control, watch } = useFormContext();

  const { votingMin } = watch();
  return (
    <Controller
      name="votingLimit"
      control={control}
      render={({ field: { value, onChange } }) => {
        const definedValue = value ?? 1;
        if (votingMin > value) onChange(votingMin);
        return (
          <InputIncrement
            value={definedValue}
            onDecrement={() => onChange(definedValue - 1)}
            onIncrement={() => onChange(definedValue + 1)}
            {...props}
          />
        );
      }}
    />
  );
};

export const InputMinControlled = (props: InputLimitProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      name="votingMin"
      control={control}
      render={({ field: { value, onChange } }) => {
        const definedValue = value ?? 1;
        return (
          <InputIncrement
            value={definedValue}
            onDecrement={() => onChange(definedValue - 1)}
            onIncrement={() => onChange(definedValue + 1)}
            {...props}
          />
        );
      }}
    />
  );
};
