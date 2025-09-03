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
