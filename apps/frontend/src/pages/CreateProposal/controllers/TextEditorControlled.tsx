import { TextEditor } from "@/components/ui/TextEditor";
import Quill, { Delta } from "quill";
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
        render={({field:{onChange,value}}) => (
          <TextEditor
            ref={quillRef}
            readOnly={false}
            defaultValue={new Delta(JSON.parse(JSON.stringify(value)))}
            onTextChange={({delta,oldContent})=>{
                onChange([...oldContent.ops,...delta.ops])
            }}
          />
        )}
      />
    );
  };
  