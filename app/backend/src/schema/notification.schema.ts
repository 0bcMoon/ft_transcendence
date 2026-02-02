import { z } from "zod";

export const pagination = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const notificationIdParam = z.object({
  id: z.coerce.number().positive("Invalid notification ID"),
});
