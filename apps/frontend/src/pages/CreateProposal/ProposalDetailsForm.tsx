import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { z } from "zod";
import { zodFile } from "@/utils/zod";
import { useMemo } from "react";
import { useCreateProposal } from "./CreateProposalProvider";
import { FormControl, Input } from "@chakra-ui/react";
import { Label } from "@/components/ui/Label";
import { InputMessage } from "@/components/ui/InputMessage";
import { useI18nContext } from "@/i18n/i18n-react";
import { TextEditorControlled } from "./controllers/TextEditorControlled";
import { ImageUploadControlled } from "./controllers/ImageUploadControlled";

const TITLE_MAX_CHARS = 60;

export const ProposalDetailsForm = () => {
  const { proposalDetails } = useCreateProposal();
  const { LL } = useI18nContext();
  const LLDetailsForm = LL.proposal.create.details_form;
  const schema = z.object({
    title: z.string(),
    description: z.array(z.object({})),
    headerImage: zodFile.optional(),
    startDate: z.date(),
    endDate: z.date(),
  });

  const defaultValues = useMemo(
    () => ({
      title: proposalDetails?.title || "",
      description: proposalDetails?.description || [],
      headerImage: proposalDetails?.headerImage,
      startDate: proposalDetails?.startDate,
      endDate: proposalDetails?.endDate,
    }),
    [proposalDetails],
  );

  const onSubmit = (values: z.infer<typeof schema>) => {
    console.log("values", values);
  };
  return (
    <FormSkeleton schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {({ register, errors, watch }) => {
        const title = watch("title");
        return (
          <CreateFormWrapper>
            <FormControl isInvalid={Boolean(errors.title)}>
              <Label label={LLDetailsForm.title()} />
              <Input width={"full"} placeholder={LLDetailsForm.title_placeholder()} {...register("title")} />
              <InputMessage
                error={errors.title?.message}
                message={LL.filed_length({ current: title.length, max: TITLE_MAX_CHARS })}
              />
            </FormControl>
            <FormControl isInvalid={Boolean(errors.description)}>
              <Label label={LLDetailsForm.description()} />
              <TextEditorControlled<z.infer<typeof schema>> name="description" />
              <InputMessage error={errors.description?.message} />
            </FormControl>
            <FormControl isInvalid={Boolean(errors.headerImage)}>
              <Label label={LLDetailsForm.header_image()} />
              <ImageUploadControlled name="headerImage" />
            </FormControl>
          </CreateFormWrapper>
        );
      }}
    </FormSkeleton>
  );
};
