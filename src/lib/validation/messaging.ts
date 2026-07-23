import { z } from "zod";

export const sendMessageSchema = z.object({
  threadId: z.string().uuid(),
  body: z.string().trim().min(1, "Message can't be empty").max(2000),
});
