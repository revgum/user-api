import { z } from "zod";

export const CreateUserRequestSchema = z.object({
  userId: z.string(),
  emails: z.array(z.string()).max(3),
  name: z.string(),
  dob: z.string().optional(),
});
