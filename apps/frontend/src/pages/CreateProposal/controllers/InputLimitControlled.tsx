import { InputIncrement } from "@/components/ui/InputIncrement";
import { ProposalMultipleOptionSchema } from "@/schema/createProposalSchema";
import { Controller, useFormContext } from "react-hook-form";

const MIN_CHOICE_ALLOWED = 1;

export const InputIncrementControlled = () => {
  const { control } = useFormContext<ProposalMultipleOptionSchema>();
  return (
    <Controller
      name="votingLimit"
      control={control}
      render={({ field: { value, onChange } }) => {
        const definedValue = value ?? 1;
        return (
          <InputIncrement
            value={definedValue}
            onDecrement={() => onChange(definedValue - 1)}
            onIncrement={() => onChange(definedValue + 1)}
            isMinDisable={definedValue === MIN_CHOICE_ALLOWED}
          />
        );
      }}
    />
  );
};
