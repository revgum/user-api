import { z } from "zod";

export const UpdateUserRequestSchema = z.object({
  emails: z.array(z.string()).max(3).optional(),
  name: z.string().optional(),
  dob: z.string().optional(),
});
