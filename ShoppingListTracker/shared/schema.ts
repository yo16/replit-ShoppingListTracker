import { text, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

// Types for the shopping list
export type ShoppingItem = {
  id: string;
  name: string;
  isSelected: boolean;
};

// Zod schema for webhook payload
export const webhookPayloadSchema = z.object({
  items: z.array(z.string()),
  password: z.string().min(1, "パスワードは必須です"),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

// Default shopping items
export const DEFAULT_ITEMS: ShoppingItem[] = [
  { id: "1", name: "バナナ", isSelected: false },
  { id: "2", name: "トマト", isSelected: false },
  { id: "3", name: "納豆", isSelected: false },
  { id: "4", name: "キムチ", isSelected: false },
  { id: "5", name: "梅干し", isSelected: false },
  { id: "6", name: "ヨーグルト", isSelected: false },
  { id: "7", name: "牛乳", isSelected: false },
  { id: "8", name: "Y1000", isSelected: false },
  { id: "9", name: "ミューズリー", isSelected: false },
];