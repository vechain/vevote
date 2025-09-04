import { z } from "zod";
import { addressSchema, requiredString } from "@/utils/zod";

export const userManagementSchema = z.object({
  userAddress: addressSchema,
  selectedRole: requiredString,
});

export type UserManagementSchema = z.infer<typeof userManagementSchema>;

export const nodeInfoSchema = z.object({
  userAddress: addressSchema,
});

export type NodeInfoSchema = z.infer<typeof nodeInfoSchema>;

export const governanceSettingsSchema = z.object({
  quorumNumerator: z.coerce
    .number()
    .min(1)
    .max(100),
  minVotingDelay: z.coerce
    .number()
    .min(1)
    .max(259200),
  minVotingDuration: z.coerce
    .number()
    .min(1)
    .max(259200),
  maxVotingDuration: z.coerce
    .number()
    .min(1)
    .max(259200),
  minStakedVetAmount: z.coerce
    .number()
    .min(0)
    .max(1000000),
}).refine(
  (data) => data.minVotingDuration <= data.maxVotingDuration,
  {
    path: ["maxVotingDuration"],
  }
);

export type GovernanceSettingsSchema = z.infer<typeof governanceSettingsSchema>;

export const votingPowerQuerySchema = z.object({
  address: addressSchema,
  timepoint: z.coerce
    .number()
    .min(0),
  masterAddress: z.string().optional().refine(
    (val) => !val || /^0x[a-fA-F0-9]{40}$/.test(val)
  ),
});

export type VotingPowerQuerySchema = z.infer<typeof votingPowerQuerySchema>;

export const levelMultipliersSchema = z.object({
  multipliers: z.array(z.coerce
    .number()
    .min(0)
    .max(1000)
  ).length(11),
});

export type LevelMultipliersSchema = z.infer<typeof levelMultipliersSchema>;
