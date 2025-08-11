import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  level: integer("level").notNull().default(1),
  points: integer("points").notNull().default(0),
  energy: integer("energy").notNull().default(4500),
  maxEnergy: integer("maxEnergy").notNull().default(4500),
  hourlyRate: integer("hourlyRate").notNull().default(0),
  isAdmin: boolean("isAdmin").notNull().default(false),
  nsfwEnabled: boolean("nsfwEnabled").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().default(sql`now()`)
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  bio: text("bio").default(""),
  backstory: text("backstory").default(""),
  interests: text("interests").default(""),
  quirks: text("quirks").default(""),
  imageUrl: text("imageUrl").default(""),
  avatarUrl: text("avatarUrl").default(""),
  isUnlocked: boolean("isUnlocked").notNull().default(false),
  requiredLevel: integer("requiredLevel").notNull().default(1),
  personality: text("personality").notNull().default("friendly"),
  chatStyle: text("chatStyle").notNull().default("casual"),
  personalityStyle: text("personalityStyle").notNull().default("Sweet & Caring"),
  moodDistribution: jsonb("moodDistribution").default({
    normal: 70,
    happy: 20,
    flirty: 10,
    playful: 0,
    mysterious: 0,
    shy: 0
  }),
  responseTimeMin: integer("responseTimeMin").notNull().default(1),
  responseTimeMax: integer("responseTimeMax").notNull().default(3),
  randomPictureSending: boolean("randomPictureSending").notNull().default(false),
  pictureSendChance: integer("pictureSendChance").notNull().default(5),
  customTriggerWords: jsonb("customTriggerWords").default([]),
  customGreetings: jsonb("customGreetings").default([]),
  customResponses: jsonb("customResponses").default([]),
  likes: text("likes").default(""),
  dislikes: text("dislikes").default(""),
  isNsfw: boolean("isNsfw").notNull().default(false),
  isVip: boolean("isVip").notNull().default(false),
  isEvent: boolean("isEvent").notNull().default(false),
  isWheelReward: boolean("isWheelReward").notNull().default(false),
  userId: varchar("userId")
});

export const upgrades = pgTable("upgrades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cost: integer("cost").notNull(),
  level: integer("level").notNull().default(1),
  maxLevel: integer("maxLevel").notNull().default(1),
  hourlyBonus: integer("hourlyBonus").notNull().default(0),
  tapBonus: integer("tapBonus").notNull().default(0),
  userId: varchar("userId").notNull(),
  requiredLevel: integer("requiredLevel").notNull().default(1),
  requiredUpgrades: jsonb("requiredUpgrades").default({})
});

export const gameStats = pgTable("gameStats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userId").notNull(),
  totalTaps: integer("totalTaps").notNull().default(0),
  totalEarned: integer("totalEarned").notNull().default(0),
  totalPoints: integer("totalPoints").notNull().default(0),
  pointsPerSecond: integer("pointsPerSecond").notNull().default(0),
  currentEnergy: integer("currentEnergy").notNull().default(4500),
  maxEnergy: integer("maxEnergy").notNull().default(4500),
  lastWheelSpin: timestamp("lastWheelSpin"),
  wheelSpinsRemaining: integer("wheelSpinsRemaining").notNull().default(1),
  selectedCharacterId: varchar("selectedCharacterId")
});

export const wheelRewards = pgTable("wheelRewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'coins', 'gems', 'character', 'energy'
  amount: integer("amount").default(0),
  rarity: text("rarity").notNull().default("common"), // 'common', 'rare', 'epic', 'legendary'
  label: text("label").notNull(),
  weight: integer("weight").notNull().default(100), // Higher = more likely
  characterId: varchar("characterId"), // For character unlocks
  isActive: boolean("isActive").notNull().default(true)
});

export const userCharacters = pgTable("userCharacters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userId").notNull(),
  characterId: varchar("characterId").notNull(),
  isUnlocked: boolean("isUnlocked").notNull().default(false),
  unlockedAt: timestamp("unlockedAt"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  isSelected: boolean("isSelected").notNull().default(false)
});

export const chatMessages = pgTable("chatMessages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userId").notNull(),
  characterId: varchar("characterId"),
  message: text("message").notNull(),
  isFromUser: boolean("isFromUser").notNull(),
  createdAt: timestamp("createdAt").notNull().default(sql`now()`)
});

export const gameSettings = pgTable("gameSettings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  energyRegenRate: integer("energyRegenRate").notNull().default(1),
  maxEnergyBonus: integer("maxEnergyBonus").notNull().default(0),
  nsfwEnabled: boolean("nsfwEnabled").notNull().default(false),
  wheelRewards: jsonb("wheelRewards").notNull(),
  updatedAt: timestamp("updatedAt").notNull().default(sql`now()`)
});

export const mediaFiles = pgTable("mediaFiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("originalName").notNull(),
  mimeType: text("mimeType").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  characterId: varchar("characterId"),
  uploadedBy: varchar("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").notNull().default(sql`now()`)
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  level: true,
  points: true,
  energy: true,
  maxEnergy: true,
  hourlyRate: true,
  isAdmin: true,
  nsfwEnabled: true,
  createdAt: true
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true
});

export const insertUpgradeSchema = createInsertSchema(upgrades).omit({
  id: true
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true
});

export const insertWheelRewardSchema = createInsertSchema(wheelRewards).omit({
  id: true
});

export const insertUserCharacterSchema = createInsertSchema(userCharacters).omit({
  id: true,
  unlockedAt: true
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});

export const insertGameSettingsSchema = createInsertSchema(gameSettings).omit({
  id: true,
  updatedAt: true
});

export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Upgrade = typeof upgrades.$inferSelect;
export type InsertUpgrade = z.infer<typeof insertUpgradeSchema>;

export type GameStats = typeof gameStats.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type GameSettings = typeof gameSettings.$inferSelect;
export type InsertGameSettings = z.infer<typeof insertGameSettingsSchema>;

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;

export type WheelReward = typeof wheelRewards.$inferSelect;
export type InsertWheelReward = z.infer<typeof insertWheelRewardSchema>;

export type UserCharacter = typeof userCharacters.$inferSelect;
export type InsertUserCharacter = z.infer<typeof insertUserCharacterSchema>;
