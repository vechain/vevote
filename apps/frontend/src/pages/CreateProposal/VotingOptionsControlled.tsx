import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Flex, FormControl, Input, Text } from "@chakra-ui/react";
import { closestCenter, DndContext, DndContextProps, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useMemo } from "react";
import { FieldErrors, useFieldArray, useFormContext } from "react-hook-form";
import { GoPlus } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDragHandleDots2 } from "react-icons/rx";
import { v4 as uuidv4 } from "uuid";

export const VotingOptionsControlled = () => {
  const { LL } = useI18nContext();
  const { control } = useFormContext();

  const {
    fields: options,
    append,
    remove,
    swap,
  } = useFieldArray({
    name: "votingOptions",
    control,
  });

  const onAddOption = useCallback(() => {
    append({ id: uuidv4(), value: "" });
  }, [append]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd: DndContextProps["onDragEnd"] = event => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = options.findIndex(option => option.id === active.id);
      const newIndex = options.findIndex(option => option.id === over?.id);
      arrayMove(options, oldIndex, newIndex);
      swap(oldIndex, newIndex);
    }
  };

  return (
    <Flex flexDirection={"column"} alignItems={"start"} gap={6} width="full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={options.map(value => value.id)} strategy={verticalListSortingStrategy}>
          {options.map((value, index) => (
            <SortableVotingOption key={value.id} id={value.id} index={index} onDelete={() => remove(index)} />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant={"tertiary"} onClick={onAddOption} width={"full"}>
        <GoPlus size={24} />
        {LL.proposal.create.add_new_option()}
      </Button>
    </Flex>
  );
};

const SortableVotingOption = ({ index, onDelete, id }: { index: number; onDelete: () => void; id: string }) => {
  const { LL } = useI18nContext();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      width: "100%",
    }),
    [transform, transition],
  );

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
          <FormControl isInvalid={Boolean((errors.votingOptions as FieldErrors)?.[index])}>
            <Input
              placeholder={LL.proposal.create.setup_form.voting_option_placeholder()}
              size={"md"}
              width={"full"}
              flex={1}
              {...register(`votingOptions.${index}.value`)}
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
