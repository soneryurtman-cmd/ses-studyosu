import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// Klonlanmış sesler
export const voices = pgTable("voices", {
  id: serial("id").primaryKey(),
  elevenLabsVoiceId: text("eleven_labs_voice_id").notNull(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  sampleName: text("sample_name").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Üretilen konuşma geçmişi
export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  voiceId: integer("voice_id")
    .notNull()
    .references(() => voices.id, { onDelete: "cascade" }),
  voiceName: text("voice_name").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Voice = typeof voices.$inferSelect;
export type Generation = typeof generations.$inferSelect;
