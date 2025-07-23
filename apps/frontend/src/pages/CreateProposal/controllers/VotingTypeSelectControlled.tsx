import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalSetupSchema } from "@/schema/createProposalSchema";
import { VotingEnum } from "@/types/proposal";
import { Button, Flex, Radio, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { defaultSingleChoice } from "../CreateProposalProvider";

export const VotingTypeSelectControlled = () => {
  const { LL } = useI18nContext();
  const LLVotingTypes = LL.proposal.create.setup_form.voting_types;

  const { control, setValue } = useFormContext<ProposalSetupSchema>();

  const types = useMemo(
    () => [
      {
        title: LLVotingTypes.single_choice.title(),
        subtitle: LLVotingTypes.single_choice.subtitle(),
        kind: VotingEnum.SINGLE_CHOICE,
      }
    ],
    [LLVotingTypes],
  );

  return (
    <Controller
      name="votingType"
      control={control}
      render={({ field: { onChange, value } }) => {
        return (
          <Flex flexDirection={"column"} gap={2}>
            {types.map((t, i) => {
              return (
                <VotingTypeItem
                  selected={value}
                  onClick={() => {
                    onChange(t.kind);
                    setValue("votingOptions", defaultSingleChoice);
                  }}
                  key={i}
                  {...t}
                />
              );
            })}
          </Flex>
        );
      }}
    />
  );
};

const VotingTypeItem = ({
  title,
  subtitle,
  kind,
  onClick,
  selected,
}: {
  title: string;
  subtitle: string;
  kind: VotingEnum;
  selected: VotingEnum;
  onClick: () => void;
}) => {
  const isSelected = useMemo(() => selected === kind, [kind, selected]);

  return (
    <Button
      transition={"all 0.2s"}
      variant={"none"}
      _focus={{ boxShadow: "none" }}
      height={"100%"}
      display={"flex"}
      background={"white"}
      alignItems={"center"}
      gap={3}
      width={"100%"}
      padding={{ base: 3, md: 6 }}
      borderWidth={2}
      borderColor={isSelected ? "primary.600" : "gray.200"}
      borderRadius={{ base: 8, md: 16 }}
      onClick={onClick}>
      <Flex gap={1} flex={1} width={"100%"} flexDirection={"column"} alignItems={"start"}>
        <Text fontSize={{ base: 16, md: 18 }} fontWeight={600} color={isSelected ? "primary.600" : "gray.600"}>
          {title}
        </Text>
        <Text fontSize={{ base: 12, md: 16 }} fontWeight={500} color={"gray.500"}>
          {subtitle}
        </Text>
      </Flex>
      <Radio onClick={e => e.preventDefault()} isChecked={isSelected} />
    </Button>
  );
};
