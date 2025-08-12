import {
  type User,
  type InsertUser,
  type Character,
  type InsertCharacter,
  type Upgrade,
  type InsertUpgrade,
  type GameStats,
  type InsertGameStats,
  type ChatMessage,
  type InsertChatMessage,
  type GameSettings,
  type InsertGameSettings,
  type MediaFile,
  type WheelReward,
  type UserCharacter
} from "@shared/schema";
import { randomUUID } from "crypto";

import Database from 'better-sqlite3';

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Character management
  getCharacter(id: string): Promise<Character | undefined>;
  getUserCharacters(userId: string): Promise<Character[]>;
  getAllCharacters(): Promise<Character[]>;
  getSelectedCharacter(userId: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, updates: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: string): Promise<void>;
  selectCharacter(userId: string, characterId: string): Promise<void>;

  // Upgrade management
  getUpgrade(id: string): Promise<Upgrade | undefined>;
  getUserUpgrades(userId: string): Promise<Upgrade[]>;
  createUpgrade(upgrade: InsertUpgrade): Promise<Upgrade>;
  updateUpgrade(id: string, updates: Partial<Upgrade>): Promise<Upgrade | undefined>;

  // Game stats
  getUserStats(userId: string): Promise<GameStats>;
  updateUserStats(userId: string, updates: Partial<GameStats>): Promise<void>;

  // Chat system
  getChatMessages(userId: string, characterId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(userId: string, characterId?: string): Promise<void>;

  // Wheel system
  getLastWheelSpin(userId: string): Promise<Date | null>;
  recordWheelSpin(userId: string, reward: string): Promise<void>;

  // Admin/Settings
  getGameSettings(): Promise<GameSettings>;
  updateGameSettings(settings: Partial<GameSettings>): Promise<void>;
  getSystemStats(): Promise<any>;
  exportAllData(): Promise<any>;

  // Media management
  getAllMedia(): Promise<MediaFile[]>;
  getMediaFiles(characterId?: string): Promise<MediaFile[]>;
  getMediaFile(id: string): Promise<MediaFile | undefined>;
  saveMediaFile(file: MediaFile): Promise<MediaFile>;
  uploadMedia(file: any): Promise<MediaFile>;
  updateMediaFile(id: string, updates: Partial<MediaFile>): Promise<MediaFile | undefined>;
  deleteMediaFile(id: string): Promise<void>;
  assignMediaToCharacter(mediaId: string, characterId: string): Promise<void>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private characters: Map<string, Character>;
  private upgrades: Map<string, Upgrade>;
  private gameStats: Map<string, GameStats>;
  private chatMessages: Map<string, ChatMessage[]>;
  private wheelSpins: Map<string, Date>;
  private gameSettings: GameSettings;
  private mediaFiles: Map<string, MediaFile>;
  private selectedCharacters: Map<string, string>; // userId -> characterId
  private energyRegenInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.upgrades = new Map();
    this.gameStats = new Map();
    this.chatMessages = new Map();
    this.wheelSpins = new Map();
    this.mediaFiles = new Map();
    this.selectedCharacters = new Map();

    // Initialize default game settings
    this.gameSettings = {
      id: randomUUID(),
      energyRegenRate: 1,
      maxEnergyBonus: 0,
      nsfwEnabled: false,
      wheelRewards: [
        { type: 'coins', min: 100, max: 1000, probability: 0.4 },
        { type: 'gems', min: 1, max: 10, probability: 0.3 },
        { type: 'energy', min: 100, max: 500, probability: 0.2 },
        { type: 'character', probability: 0.1 }
      ],
      chatRandomPercentage: 15,
      vipBenefits: {
        daily: { coins: 500, gems: 24, energyRegen: 50, exclusiveChars: true, vipChat: true },
        weekly: { coins: 2000, gems: 7, energyRegen: 100, allExclusive: true, prioritySupport: true, dailyBonus: true },
        monthly: { coins: 6000, gems: 30, energyRegen: 200, unlimited: true, customChars: true, monthlyEvents: true }
      },
      levelRequirements: [
        { level: 1, pointsRequired: 0 },
        { level: 2, pointsRequired: 1000 },
        { level: 3, pointsRequired: 2500 },
        { level: 4, pointsRequired: 5000 },
        { level: 5, pointsRequired: 10000 }
      ],
      updatedAt: new Date()
    };

    // Initialize with mock data
    this.initializeMockData();

    // Load existing media files from uploads folder
    this.loadExistingMediaFiles();
    this.startEnergyRegeneration();
  }

  private initializeMockData() {
    // Create mock user
    const mockUser: User = {
      id: "mock-user-id",
      username: "ShadyLTD",
      password: "password123",
      level: 4,
      points: 2140,
      energy: 4500,
      maxEnergy: 4500,
      hourlyRate: 16933,
      isAdmin: true,
      nsfwEnabled: false,
      createdAt: new Date()
    };
    this.users.set(mockUser.id, mockUser);

    // Create mock characters with full feature set
    const mockCharacters: Character[] = [
      {
        id: "char-yuki",
        name: "Akira",
        description: "A confident and athletic anime girl with striking blue eyes and dark hair",
        userId: mockUser.id,
        level: 1,
        bio: "A confident and athletic anime girl with striking blue eyes and dark hair",
        backstory: "A dedicated fitness enthusiast who balances strength training with her love for anime and gaming",
        interests: "Fitness, anime, gaming, outdoor activities",
        quirks: "Always flexes when excited, has a competitive streak in everything",
        imageUrl: "/uploads/images-1754981650026-111631932.webp",
        avatarUrl: "/uploads/images-1754981667686-266701314.jpg",
        isUnlocked: true,
        requiredLevel: 1,
        personality: "playful",
        chatStyle: "energetic",
        personalityStyle: "Sweet & Caring",
        moodDistribution: {
          normal: 70,
          happy: 20,
          flirty: 10,
          playful: 0,
          mysterious: 0,
          shy: 0
        },
        responseTimeMin: 1,
        responseTimeMax: 3,
        responseTimeMs: 2000,
        randomPictureSending: true,
        pictureSendChance: 5,
        customTriggerWords: [],
        customGreetings: ["Hello darling! 💪", "Hi there sweetie! 😊", "Hey gorgeous! 😘"],
        customResponses: ["That's so sweet! 💕", "I love talking with you! ❤️", "You're amazing! ⭐"],
        likes: "compliments, romance, movies, music, art",
        dislikes: "rudeness, negativity, boring topics",
        isNsfw: false,
        isVip: false,
        isEvent: false,
        isWheelReward: true
      },
      {
        id: "char-aria",
        name: "Luna",
        description: "A gentle and thoughtful anime girl with mesmerizing blue eyes",
        userId: mockUser.id,
        level: 1,
        bio: "A gentle and thoughtful anime girl with mesmerizing blue eyes",
        backstory: "A calm and introspective character who enjoys peaceful moments and deep conversations",
        interests: "Art, reading, stargazing, quiet cafes",
        quirks: "Always notices small details, has a soft spot for cute things",
        imageUrl: "/uploads/images-1754981888520-125105970.jpg",
        avatarUrl: "/uploads/images-1754981905106-372223556.jpg",
        isUnlocked: false,
        requiredLevel: 5,
        personality: "shy",
        chatStyle: "formal",
        personalityStyle: "Mysterious",
        moodDistribution: {
          normal: 50,
          happy: 15,
          flirty: 5,
          playful: 10,
          mysterious: 20,
          shy: 0
        },
        responseTimeMin: 2,
        responseTimeMax: 5,
        responseTimeMs: 3000,
        randomPictureSending: false,
        pictureSendChance: 3,
        customTriggerWords: [],
        customGreetings: ["Good evening...", "Hello there...", "How are you?"],
        customResponses: ["Interesting...", "I see...", "That's thoughtful of you."],
        likes: "art, poetry, quiet moments, deep thoughts",
        dislikes: "loud noises, chaos, rushing",
        isNsfw: false,
        isVip: true,
        isEvent: false,
        isWheelReward: false
      }
    ];

    mockCharacters.forEach(char => this.characters.set(char.id, char));
    this.selectedCharacters.set(mockUser.id, "char-yuki");

    // Create mock upgrades
    const mockUpgrades: Upgrade[] = [
      {
        id: "upgrade-1",
        name: "Special Talent",
        description: "Increases sugar per hour",
        cost: 5172,
        level: 8,
        maxLevel: 50,
        hourlyBonus: 798,
        tapBonus: 0,
        userId: mockUser.id,
        requiredLevel: 1,
        requiredUpgrades: {}
      }
    ];
    mockUpgrades.forEach(upgrade => this.upgrades.set(upgrade.id, upgrade));

    // Create mock stats
    const mockStats: GameStats = {
      id: "stats-mock-user",
      userId: mockUser.id,
      totalTaps: 1247,
      totalEarned: 45200,
      totalPoints: 2140,
      pointsPerSecond: 279,
      currentEnergy: 4500,
      maxEnergy: 4500,
      lastWheelSpin: null,
      wheelSpinsRemaining: 1,
      selectedCharacterId: "char-yuki"
    };
    this.gameStats.set(mockUser.id, mockStats);

    // Initialize empty chat for user
    this.chatMessages.set(mockUser.id, []);
  }

  private async loadExistingMediaFiles() {
    try {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = './public/uploads';

      if (!fs.existsSync(uploadsDir)) {
        console.log('Uploads directory does not exist');
        return;
      }

      const files = fs.readdirSync(uploadsDir);

      for (const filename of files) {
        if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          const filePath = path.join(uploadsDir, filename);
          const stats = fs.statSync(filePath);

          const mediaFile: MediaFile = {
            id: randomUUID(),
            filename: filename,
            originalName: filename,
            mimeType: this.getMimeType(filename),
            size: stats.size,
            fileType: 'image',
            url: `/uploads/${filename}`,
            path: `/uploads/${filename}`,
            characterId: null,
            uploadedBy: 'system',
            tags: [],
            description: null,
            isNsfw: false,
            createdAt: stats.birthtime || new Date()
          };

          this.mediaFiles.set(mediaFile.id, mediaFile);
          console.log('Loaded existing media file:', filename);
        }
      }

      console.log(`Loaded ${this.mediaFiles.size} existing media files`);
    } catch (error) {
      console.error('Error loading existing media files:', error);
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      level: 1,
      points: 0,
      energy: 4500,
      maxEnergy: 4500,
      hourlyRate: 0,
      isAdmin: false,
      nsfwEnabled: false,
      createdAt: new Date()
    };
    this.users.set(id, user);

    // Initialize user stats
    const stats: GameStats = {
      id: randomUUID(),
      userId: id,
      totalTaps: 0,
      totalEarned: 0,
      totalPoints: 0,
      pointsPerSecond: 0,
      currentEnergy: 4500,
      maxEnergy: 4500,
      lastWheelSpin: null,
      wheelSpinsRemaining: 1,
      selectedCharacterId: null
    };
    this.gameStats.set(id, stats);

    // Initialize empty chat
    this.chatMessages.set(id, []);

    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getUserCharacters(userId: string): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      char => char.userId === userId
    );
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async getSelectedCharacter(userId: string): Promise<Character | undefined> {
    const characterId = this.selectedCharacters.get(userId);
    return characterId ? this.characters.get(characterId) : undefined;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = randomUUID();
    const newCharacter: Character = {
      ...character,
      id,
      bio: character.bio || "",
      backstory: character.backstory || "",
      interests: character.interests || "",
      quirks: character.quirks || "",
      imageUrl: character.imageUrl || "",
      avatarUrl: character.avatarUrl || null,
      personalityStyle: character.personalityStyle || "Sweet & Caring",
      moodDistribution: character.moodDistribution || { normal: 70, happy: 20, flirty: 10, playful: 0, mysterious: 0, shy: 0 },
      responseTimeMin: character.responseTimeMin || 1,
      responseTimeMax: character.responseTimeMax || 3,
      randomPictureSending: character.randomPictureSending || false,
      pictureSendChance: character.pictureSendChance || 5,
      customTriggerWords: character.customTriggerWords || [],
      customGreetings: character.customGreetings || [],
      customResponses: character.customResponses || [],
      likes: character.likes || "",
      dislikes: character.dislikes || "",
      isUnlocked: character.isUnlocked ?? false,
      requiredLevel: character.requiredLevel ?? 1,
      personality: character.personality || "friendly",
      chatStyle: character.chatStyle || "casual",
      isNsfw: character.isNsfw ?? false,
      isVip: character.isVip ?? false,
      isEvent: character.isEvent ?? false,
      isWheelReward: character.isWheelReward ?? false,
      userId: character.userId || null
    };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;

    // Ensure moodDistribution is properly merged
    const updatedCharacter = { 
      ...character, 
      ...updates,
      moodDistribution: updates.moodDistribution ? {
        ...character.moodDistribution,
        ...updates.moodDistribution
      } : character.moodDistribution
    };

    this.characters.set(id, updatedCharacter);
    console.log('Character updated successfully:', id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: string): Promise<void> {
    this.characters.delete(id);
    // Remove from selected characters
    for (const [userId, charId] of Array.from(this.selectedCharacters.entries())) {
      if (charId === id) {
        this.selectedCharacters.delete(userId);
      }
    }
    // Clear related media assignments
    for (const [mediaId, media] of Array.from(this.mediaFiles.entries())) {
      if (media.characterId === id) {
        this.mediaFiles.set(mediaId, { ...media, characterId: null });
      }
    }
  }

  async selectCharacter(userId: string, characterId: string): Promise<void> {
    this.selectedCharacters.set(userId, characterId);
  }

  async getUpgrade(id: string): Promise<Upgrade | undefined> {
    return this.upgrades.get(id);
  }

  async getUserUpgrades(userId: string): Promise<Upgrade[]> {
    return Array.from(this.upgrades.values()).filter(
      upgrade => upgrade.userId === userId
    );
  }

  async createUpgrade(upgrade: InsertUpgrade): Promise<Upgrade> {
    const id = randomUUID();
    const newUpgrade: Upgrade = {
      ...upgrade,
      id,
      level: upgrade.level || 1,
      maxLevel: upgrade.maxLevel || 1,
      hourlyBonus: upgrade.hourlyBonus || 0,
      tapBonus: upgrade.tapBonus || 0,
      requiredLevel: upgrade.requiredLevel || 1,
      requiredUpgrades: upgrade.requiredUpgrades || {}
    };
    this.upgrades.set(id, newUpgrade);
    return newUpgrade;
  }

  async updateUpgrade(id: string, updates: Partial<Upgrade>): Promise<Upgrade | undefined> {
    const upgrade = this.upgrades.get(id);
    if (!upgrade) return undefined;

    const updatedUpgrade = { ...upgrade, ...updates };
    this.upgrades.set(id, updatedUpgrade);
    return updatedUpgrade;
  }

  async getUserStats(userId: string): Promise<GameStats> {
    const stats = this.gameStats.get(userId);
    if (!stats) {
      const defaultStats: GameStats = {
        id: randomUUID(),
        userId,
        totalTaps: 0,
        totalEarned: 0,
        totalPoints: 0,
        pointsPerSecond: 0,
        currentEnergy: 4500,
        maxEnergy: 4500,
        lastWheelSpin: null,
        wheelSpinsRemaining: 1,
        selectedCharacterId: null
      };
      this.gameStats.set(userId, defaultStats);
      return defaultStats;
    }
    return stats;
  }

  async updateUserStats(userId: string, updates: Partial<GameStats>): Promise<void> {
    const stats = await this.getUserStats(userId);
    const updatedStats = { ...stats, ...updates };
    this.gameStats.set(userId, updatedStats);
  }

  async getChatMessages(userId: string, characterId?: string): Promise<ChatMessage[]> {
    const messages = this.chatMessages.get(userId) || [];
    if (characterId) {
      return messages.filter(msg => msg.characterId === characterId);
    }
    return messages;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const chatMessage: ChatMessage = {
      ...message,
      id,
      characterId: message.characterId || null,
      createdAt: new Date()
    };

    const userMessages = this.chatMessages.get(message.userId) || [];
    userMessages.push(chatMessage);
    this.chatMessages.set(message.userId, userMessages);

    return chatMessage;
  }

  async clearChatHistory(userId: string, characterId?: string): Promise<void> {
    const messages = this.chatMessages.get(userId) || [];
    if (characterId) {
      const filteredMessages = messages.filter(msg => msg.characterId !== characterId);
      this.chatMessages.set(userId, filteredMessages);
    } else {
      this.chatMessages.set(userId, []);
    }
  }

  async getLastWheelSpin(userId: string): Promise<Date | null> {
    return this.wheelSpins.get(userId) || null;
  }

  async recordWheelSpin(userId: string, reward: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO wheel_spins (userId, reward, timestamp)
      VALUES (?, ?, ?)
    `);

    stmt.run(userId, reward, Date.now());
  }

  // Energy regeneration system
  private startEnergyRegeneration() {
    // Regenerate 3 energy every 5 seconds for all users
    this.energyRegenInterval = setInterval(async () => {
      try {
        const stmt = this.db.prepare(`
          UPDATE users 
          SET energy = MIN(maxEnergy, energy + 3) 
          WHERE energy < maxEnergy
        `);
        stmt.run();
      } catch (error) {
        console.error("Error regenerating energy:", error);
      }
    }, 5000); // 5 seconds
  }

  async updateEnergyRegenRate(regenAmount: number, intervalSeconds: number) {
    // Clear existing interval
    if (this.energyRegenInterval) {
      clearInterval(this.energyRegenInterval);
    }

    // Start new interval with custom settings
    this.energyRegenInterval = setInterval(async () => {
      try {
        const stmt = this.db.prepare(`
          UPDATE users 
          SET energy = MIN(maxEnergy, energy + ?) 
          WHERE energy < maxEnergy
        `);
        stmt.run(regenAmount);
      } catch (error) {
        console.error("Error regenerating energy:", error);
      }
    }, intervalSeconds * 1000);
  }

  destroy() {
    if (this.energyRegenInterval) {
      clearInterval(this.energyRegenInterval);
    }
    this.db.close();
  }
}

export const storage = new MemStorage();

let db: Database.Database | null = null;

export function initDB() {
  db = new Database('./data.db'); // your DB file path
  console.log('[Storage] DB initialized.');
}

export function isDBReady() {
  return db !== null;
}

export function getAllUsers() {
  if (!db) throw new Error('DB not initialized');
  return db.prepare('SELECT * FROM users').all();
}

export function updateUserEnergy(userId: number) {
  if (!db) throw new Error('DB not initialized');
  db.prepare('UPDATE users SET energy = energy + 1 WHERE id = ?').run(userId);
}