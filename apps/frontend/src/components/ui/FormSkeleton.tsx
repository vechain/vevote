/* eslint-disable @typescript-eslint/no-explicit-any */
import { Override } from "@/types/common";
import { scrollTo } from "@/utils/scrollTo";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  DetailedHTMLProps,
  FormEvent,
  FormHTMLAttributes,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Control,
  DefaultValues,
  FieldError,
  FieldErrors,
  FieldValues,
  FormProvider,
  Path,
  UseFormClearErrors,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormRegister,
  UseFormResetField,
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
  ValidationMode,
  useForm,
} from "react-hook-form";

export type FormSkeletonChildrenProps<Values extends FieldValues> = {
  isDirty: boolean;
  register: UseFormRegister<Values>;
  control: Control<Values, any>;
  setError: UseFormSetError<Values>;
  clearErrors: UseFormClearErrors<Values>;
  getValues: UseFormGetValues<Values>;
  setValue: UseFormSetValue<Values>;
  resetField: UseFormResetField<Values>;
  watch: UseFormWatch<Values>;
  trigger: UseFormTrigger<Values>;
  getFieldState: UseFormGetFieldState<Values>;
  formRef?: RefObject<HTMLFormElement>;
  errors: FieldErrors<Values>;
  isError: boolean;
  isValid: boolean;
  validateSchema: (schema: FormSkeletonProps<Values>["schema"], data?: unknown) => Promise<Values>;
};

type GenericSchema<Values> = z.ZodType<Values> | z.ZodEffects<z.ZodType<Values>> | z.ZodObject<z.ZodRawShape>;
type NestedSchema<Values> = z.ZodIntersection<GenericSchema<Values> | NestedSchema<Values>, any>;

export type FormSkeletonProps<Values extends FieldValues> = Override<
  DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>,
  {
    defaultValues?: DefaultValues<Values>;
    schema?: GenericSchema<Values> | NestedSchema<Values>;
    clearOnEdit?: boolean;
    mode?: keyof ValidationMode;
    children?: (props: FormSkeletonChildrenProps<Values>) => React.ReactNode;
    onChange?: (formProps: FormSkeletonChildrenProps<Values>, e?: FormEvent<HTMLFormElement>) => void;
    onInvalid?: (formProps: FormSkeletonChildrenProps<Values>) => void;
    onSubmit: (
      values: Values,
      formProps: FormSkeletonChildrenProps<Values>,
      action?: string,
    ) => Promise<Record<string, string> | string | undefined | void> | void | undefined;
  }
>;

export const FormSkeleton = <Values extends FieldValues>({
  children,
  defaultValues,
  clearOnEdit = true,
  mode = "onChange",
  schema,
  onChange,
  onInvalid,
  onSubmit,
  ...otherProps
}: FormSkeletonProps<Values>) => {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    resetField,
    clearErrors,
    watch,
    getValues,
    trigger,
    getFieldState,
    formState: { errors, isValid, isDirty, ...formStateProps },
    reset,
    ...otherFormProps
  } = useForm<Values>({
    defaultValues,
    mode,
    resolver: schema ? zodResolver(schema) : undefined,
  });
  const isError = useMemo(() => Object.keys(errors)?.length > 0, [errors]);

  const errorsMap = useCallback(
    (errors: FieldErrors<Values> | z.ZodIssue[]) => {
      const arr = Object.entries(errors);
      arr.forEach(([key, err]) => {
        const isMsgStr = typeof err?.message === "string";
        const isTypeStr = typeof err?.type?.type === "string";
        const msg = isMsgStr ? (err?.message as FieldError)?.message || (err?.message as string) : "";
        const deepType = isTypeStr ? err?.type?.type : undefined;
        const zErr = err as z.ZodIssue;
        const errPath = zErr?.path ? zErr.path.join(".") : "";

        setError((errPath || key) as Path<Values>, {
          message: msg ?? "",
          type: typeof err?.type === "string" ? err?.type : deepType,
        });
      });
    },
    [setError],
  );

  const validateSchema = useCallback(
    async (schema: FormSkeletonProps<Values>["schema"], data?: unknown) => {
      const values = getValues();
      if (!schema) return values as Values;
      const validation = await schema.safeParseAsync(data || values);
      if (!validation.success) {
        errorsMap(validation.error.errors);
        const { path: firstError } = validation.error.errors[0] || {};
        if (firstError) {
          const errorNode = document.querySelector(`input[name="${firstError}"]`);
          scrollTo(errorNode, -120);
        }
        throw validation.error.errors;
      }
      return validation.data as Values;
    },
    [errorsMap, getValues],
  );

  const formProps: FormSkeletonChildrenProps<Values> = useMemo(
    () => ({
      clearErrors,
      control,
      trigger,
      getFieldState,
      errors,
      watch,
      getValues,
      formRef,
      isError,
      register,
      setError,
      setValue,
      resetField,
      isValid,
      validateSchema,
      isDirty,
      reset,
    }),
    [
      clearErrors,
      control,
      trigger,
      getFieldState,
      errors,
      watch,
      getValues,
      formRef,
      isError,
      register,
      setError,
      setValue,
      resetField,
      isValid,
      validateSchema,
      isDirty,
      reset,
    ],
  );

  const submitForm = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const submitEvent = e.nativeEvent as SubmitEvent;
      const submitter = submitEvent.submitter as HTMLButtonElement;
      const submitAction = submitter?.value || "save";

      const onError = async (errors?: FieldErrors<Values>) => {
        if (errors) errorsMap(errors);
        try {
          if (schema) await validateSchema(schema);
        } catch (err) {
          if (onInvalid) onInvalid(formProps);
        }
      };

      return handleSubmit(
        async values => {
          try {
            await onSubmit(values, formProps, submitAction);
          } catch (err) {
            await onError();
          }
        },
        async errors => onError(errors),
      )(e).catch(() => onError());
    },
    [errorsMap, formProps, handleSubmit, onInvalid, onSubmit, schema, validateSchema],
  );

  useEffect(() => {
    reset(defaultValues, { keepValues: true, keepErrors: true });
  }, [defaultValues, reset]);

  return (
    <FormProvider
      handleSubmit={handleSubmit}
      {...formProps}
      formState={{ errors, isValid, isDirty, ...formStateProps }}
      {...otherFormProps}
      reset={reset}>
      <form
        ref={formRef}
        onSubmit={submitForm}
        onChange={(e: FormEvent<HTMLFormElement>) => {
          if (onChange) onChange(formProps, e);
          if (isError && clearOnEdit) clearErrors();
        }}
        noValidate={true}
        {...otherProps}>
        {children ? children(formProps) : null}
      </form>
    </FormProvider>
  );
};
