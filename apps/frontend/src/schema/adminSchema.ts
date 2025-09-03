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
    .min(1, "Quorum numerator must be at least 1")
    .max(100, "Quorum numerator cannot exceed 100"),
  minVotingDelay: z.coerce
    .number()
    .min(3600, "Minimum voting delay must be at least 1 hour")
    .max(2592000, "Minimum voting delay cannot exceed 30 days"),
  minVotingDuration: z.coerce
    .number()
    .min(86400, "Minimum voting duration must be at least 1 day")
    .max(2592000, "Minimum voting duration cannot exceed 30 days"),
  maxVotingDuration: z.coerce
    .number()
    .min(86400, "Maximum voting duration must be at least 1 day")
    .max(5184000, "Maximum voting duration cannot exceed 60 days"),
  minStakedVetAmount: z.coerce
    .number()
    .min(0, "Minimum staked VET amount cannot be negative")
    .max(1000000, "Minimum staked VET amount cannot exceed 1M VET"),
}).refine(
  (data) => data.minVotingDuration <= data.maxVotingDuration,
  {
    message: "Minimum voting duration must be less than or equal to maximum voting duration",
    path: ["maxVotingDuration"],
  }
);

export type GovernanceSettingsSchema = z.infer<typeof governanceSettingsSchema>;

export const votingPowerQuerySchema = z.object({
  address: addressSchema,
  timepoint: z.coerce
    .number()
    .min(0, "Timepoint must be a positive number"),
  masterAddress: z.string().optional().refine(
    (val) => !val || /^0x[a-fA-F0-9]{40}$/.test(val),
    "Master address must be a valid Ethereum address"
  ),
});

export type VotingPowerQuerySchema = z.infer<typeof votingPowerQuerySchema>;

export const levelMultipliersSchema = z.object({
  multipliers: z.array(z.coerce
    .number()
    .min(0, "Multiplier cannot be negative")
    .max(1000, "Multiplier cannot exceed 1000")
  ).length(11, "Must have exactly 11 multipliers"),
});

export type LevelMultipliersSchema = z.infer<typeof levelMultipliersSchema>;
