import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull().default("Другое"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
