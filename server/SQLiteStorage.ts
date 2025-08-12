import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

import type { User, Character, Upgrade, GameStats, ChatMessage, MediaFile } from '@shared/types';

export class SQLiteStorage {
  private db: Database.Database;

  constructor(dbPath = './data/game.db') {
    // Ensure folder exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);

    // Initialize tables if not exist
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        points INTEGER,
        energy INTEGER,
        maxEnergy INTEGER,
        nsfwEnabled INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        userId TEXT,
        name TEXT,
        imageUrl TEXT
      );

      CREATE TABLE IF NOT EXISTS upgrades (
        id TEXT PRIMARY KEY,
        userId TEXT,
        upgradeType TEXT,
        level INTEGER
      );

      CREATE TABLE IF NOT EXISTS gamestats (
        userId TEXT PRIMARY KEY,
        totalTaps INTEGER DEFAULT 0,
        totalEarned INTEGER DEFAULT 0,
        totalPoints INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS chatmessages (
        id TEXT PRIMARY KEY,
        userId TEXT,
        characterId TEXT,
        message TEXT,
        isFromUser INTEGER,
        createdAt INTEGER