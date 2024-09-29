import { isBase64 } from "validator";
import { z } from "zod";

export const CreateUserRequestSchema = z.object({
  userId: z.string().refine(
    (val) => isBase64(val, { urlSafe: true }),
    (val) => ({
      message: `'${val}' is an invalid userId, it must be urlencoded`,
    })
  ),
  emails: z.array(z.string().email()).max(3),
  name: z.string(),
  dob: z.string().date().optional(),
});

export const PatchUserRequestSchema = z.object({
  emails: z.array(z.string().email()).max(3).optional(),
  name: z.string().optional(),
  dob: z.string().date().optional(),
});

export const UpdateUserRequestSchema = z.object({
  emails: z.array(z.string().email()).max(3),
  name: z.string(),
  dob: z.string().date().optional(),
});
