import { FileUpload, IMAGES_FORMATS } from "@/components/ui/FileUpload";
import { FileUploadChild } from "@/components/ui/FileUploadChild";
import { InputMessage } from "@/components/ui/InputMessage";
import { FormControl } from "@chakra-ui/react";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

type ImageUploadControlledProps<T extends FieldValues> = {
  name: Path<T>;
  isDisabled?: boolean;
  isLoading?: boolean;
  onSuccess?: () => void;
  message?: string;
};

export const ImageUploadControlled = <T extends FieldValues>({
  name,
  isDisabled,
  isLoading,
  onSuccess,
}: ImageUploadControlledProps<T>) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl isInvalid={Boolean(error)}>
          <FileUpload
            isDisabled={isDisabled}
            isLoading={isLoading}
            onChange={files => {
              control.setError(name, { message: undefined });
              onChange({
                type: files[0].type,
                name: files[0].name,
                size: files[0].size,
                source: files[0],
                url: URL.createObjectURL(files[0]),
              });
            }}
            formats={IMAGES_FORMATS}
            maxFiles={1}
            onError={message =>
              control.setError(name, {
                message,
              })
            }
            onSuccess={onSuccess}>
            <FileUploadChild value={value} />
          </FileUpload>

          <InputMessage error={error?.message} />
        </FormControl>
      )}
    />
  );
};
