import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().uuid({
    message: "Invalid search format. Please enter a valid UUID.",
  }),
});

export type SearchSchema = z.infer<typeof searchSchema>;
