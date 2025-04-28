import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalMultipleOptionSchema, ProposalSingleOptionSchema } from "@/schema/createProposalSchema";
import { Button, Flex, FormControl, Input, Text } from "@chakra-ui/react";
import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { RxDragHandleDots2 } from "react-icons/rx";
4;
import { RiDeleteBin6Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DndContextProps } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DEFAULT_OPTIONS = ["", ""];

export const VotingOptionsControlled = () => {
  const { control } = useFormContext<ProposalMultipleOptionSchema | ProposalSingleOptionSchema>();

  return (
    <Controller
      name={"votingOptions"}
      control={control}
      render={({ field: { value, onChange } }) => {
        const defaultValue = value.length === 0 ? DEFAULT_OPTIONS : value;
        return <VotingOptions options={defaultValue} onChange={onChange} />;
      }}
    />
  );
};

const VotingOptions = ({ options, onChange }: { options: string[]; onChange: (newValues: string[]) => void }) => {
  const { LL } = useI18nContext();

  const handleChange = useCallback(
    (newValue: string, index: number) => {
      const newOptions = [...options];
      newOptions[index] = newValue;
      onChange(newOptions);
    },
    [onChange, options],
  );

  const onAddOption = useCallback(() => {
    onChange([...options, ""]);
  }, [onChange, options]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd: DndContextProps["onDragEnd"] = event => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = options.findIndex((_, i) => `${i}-${options[i]}` === active.id);
      const newIndex = options.findIndex((_, i) => `${i}-${options[i]}` === over?.id);
      const newOptions = arrayMove(options, oldIndex, newIndex);
      onChange(newOptions);
    }
  };

  const handleDelete = useCallback(
    (index: number) => {
      const newOptions = options.filter((_, i) => i !== index);
      onChange(newOptions);
    },
    [onChange, options],
  );

  return (
    <Flex flexDirection={"column"} alignItems={"start"} gap={6} width="full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={options.map((value, i) => `${i}-${value}`)} strategy={verticalListSortingStrategy}>
          {options.map((value, index) => (
            <SortableVotingOption
              key={`${index}-${value}`}
              index={index}
              value={value}
              onChange={e => handleChange(e.currentTarget.value, index)}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button variant={"tertiary"} onClick={onAddOption} width={"full"}>
        <GoPlus size={24} />
        {LL.proposal.create.add_new_option()}
      </Button>
    </Flex>
  );
};

const SortableVotingOption = ({
  index,
  value,
  onChange,
  onDelete,
}: {
  index: number;
  value: string;
  onDelete: () => void;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
  const { LL } = useI18nContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `${index}-${value}` });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      width: "100%",
    }),
    [transform, transition],
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [value]);

  return (
    <Flex ref={setNodeRef} style={style} alignItems={"end"} gap={2}>
      <Flex
        {...attributes}
        {...listeners}
        cursor="grab"
        height={"48px"}
        alignItems={"center"}
        justifyContent={"center"}>
        <RxDragHandleDots2 style={{ transform: "rotate(90deg)" }} size={24} />
      </Flex>
      <Flex flexDirection={"column"} alignItems={"start"} gap={2} width={"full"}>
        <Text
          borderRadius={4}
          paddingX={2}
          background={"gray.200"}
          color={"gray.600"}
          fontSize={14}
          fontWeight={500}
          lineHeight={"20px"}>
          {LL.number_option({ index: index + 1 })}
        </Text>
        <Flex width={"full"} gap={2}>
          <FormControl isInvalid={Boolean(!value)}>
            <Input
              ref={inputRef}
              placeholder={LL.proposal.create.setup_form.voting_option_placeholder()}
              size={"md"}
              width={"full"}
              value={value}
              onChange={onChange}
              flex={1}
            />
          </FormControl>
          {index > 1 && (
            <Button onClick={onDelete} variant={"tertiary"} size={"fit"} width={"48px"}>
              <RiDeleteBin6Line size={24} />
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
