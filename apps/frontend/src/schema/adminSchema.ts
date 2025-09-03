import { z } from "zod";
import { addressSchema, requiredString } from "@/utils/zod";

// User Management Schema
export const userManagementSchema = z.object({
  userAddress: addressSchema,
  selectedRole: requiredString,
});

export type UserManagementSchema = z.infer<typeof userManagementSchema>;

// Node Information Schema
export const nodeInfoSchema = z.object({
  userAddress: addressSchema,
});

export type NodeInfoSchema = z.infer<typeof nodeInfoSchema>;