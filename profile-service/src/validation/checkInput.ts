import { z } from "zod";

export const updatePlayerInfoSchema = z.object({
  nickname: z.string()
	.min(1, { message: "Nickname is required" })
    .min(4, { message: "Nickname must be at least 4 characters" })
    .optional(),

  winPhrase: z.string()
    .min(1, { message: "Winphrase is required" })
    .optional(),
})
.refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);
