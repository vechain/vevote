import { TextEditor } from "@/components/ui/TextEditor";
import Quill from "quill";
import { useRef } from "react";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

type TextEditorControlledProps<T> = {
  name: Path<T>;
};

export const TextEditorControlled = <T extends FieldValues>({ name }: TextEditorControlledProps<T>) => {
  const { control } = useFormContext();
  const quillRef = useRef<Quill | null>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange }, formState: { defaultValues, errors } }) => (
        <TextEditor
          ref={quillRef}
          readOnly={false}
          defaultValue={defaultValues?.["description"]}
          onTextChange={({ oldContent, delta }) => {
            const newContent = oldContent.compose(delta);
            console.log("New content:", newContent);
            onChange(newContent.ops);
          }}
          isError={!!errors[name]?.message}
        />
      )}
    />
  );
};
