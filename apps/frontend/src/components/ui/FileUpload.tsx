import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { DropzoneOptions, DropzoneState, useDropzone } from "react-dropzone";
import { bytesToMB } from "@/utils/file";
import { UploadIcon } from "@/icons";

export const IMAGES_FORMATS = {
  "image/jpeg": [],
  "image/png": [],
  "image/svg+xml": [],
};

export const APPLICATION_FORMATS = {
  "application/pdf": [],
};

export const MAX_SIZE = 10485760;

export type FileUploadFormats = {
  [key in keyof (typeof IMAGES_FORMATS & typeof APPLICATION_FORMATS)]?: string[];
};

export type FileUploadProps = PropsWithChildren<{
  maxSize?: number;
  minSize?: number;
  onChange: (files: File[]) => void;
  maxFiles?: number;
  formats: FileUploadFormats;
  isDisabled?: boolean;
  isLoading?: boolean;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}>;

export const FileUpload = ({
  children,
  formats,
  maxSize = MAX_SIZE,
  onChange,
  isDisabled,
  isLoading,
  onError,
  onSuccess,
  ...props
}: FileUploadProps) => {
  const { LL } = useI18nContext();
  const onDrop: NonNullable<DropzoneOptions["onDrop"]> = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length) {
        const error = fileRejections[0].errors[0].message;
        if (error) {
          onError?.(LL.field_errors.invalid_format());
          return;
        }
      }
      onChange(acceptedFiles);
      onSuccess?.();
    },
    [LL.field_errors, onChange, onError, onSuccess],
  );

  const { getInputProps, getRootProps } = useDropzone({
    accept: formats,
    maxSize,
    onDrop,
    ...props,
  });

  const defaultFileUploadProps = useMemo(
    () => ({ maxSize, isDisabled, getRootProps, getInputProps, isLoading }),
    [maxSize, isDisabled, getRootProps, getInputProps, isLoading],
  );

  return (
    <Flex
      borderWidth={"1px"}
      borderRadius={"8px"}
      borderColor={"gray.200"}
      padding={"16px"}
      alignItems={"center"}
      gap={"24px"}
      backgroundColor={"white"}
      flexDirection={{ base: "column", md: "row" }}>
      {children}
      <DefaultFileUpload {...defaultFileUploadProps} />
    </Flex>
  );
};

type FileUploadChildProps = {
  maxSize: number;
  isDisabled?: boolean;
  isLoading?: boolean;
  getRootProps: DropzoneState["getRootProps"];
  getInputProps: DropzoneState["getInputProps"];
};

const DefaultFileUpload = ({ isDisabled, getRootProps, getInputProps }: FileUploadChildProps) => {
  const { LL } = useI18nContext();
  return (
    <Flex paddingTop={"8px"} flexDirection={"column"} gap={"24px"}>
      <Text fontSize={{ base: "12px", md: "14px" }} color={"gray.500"}>
        {LL.file_upload_description({ size: bytesToMB(MAX_SIZE) })}
      </Text>

      <Box {...getRootProps()} width={{ base: "100%", md: "fit-content" }}>
        <Button
          leftIcon={<Icon width={5} height={5} as={UploadIcon} />}
          variant={"secondary"}
          isDisabled={isDisabled}
          size={"md"}
          width={{ base: "100%", md: "fit-content" }}>
          <input {...getInputProps()} />
          {LL.upload()}
        </Button>
      </Box>
    </Flex>
  );
};
