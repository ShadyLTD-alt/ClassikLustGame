import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCharacterSchema, insertUpgradeSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Character routes
  app.get("/api/characters/:userId", async (req, res) => {
    try {
      const characters = await storage.getUserCharacters(req.params.userId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/character/selected/:userId", async (req, res) => {
    try {
      const character = await storage.getSelectedCharacter(req.params.userId);
      if (!character) {
        return res.status(404).json({ error: "No character selected" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/character", async (req, res) => {
    try {
      const characterData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(characterData);
      res.json(character);
    } catch (error) {
      res.status(400).json({ error: "Invalid character data" });
    }
  });

  app.post("/api/character/select", async (req, res) => {
    try {
      const { userId, characterId } = req.body;
      await storage.selectCharacter(userId, characterId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Upgrade routes
  app.get("/api/upgrades/:userId", async (req, res) => {
    try {
      const upgrades = await storage.getUserUpgrades(req.params.userId);
      res.json(upgrades);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/upgrade", async (req, res) => {
    try {
      const upgradeData = insertUpgradeSchema.parse(req.body);
      const upgrade = await storage.createUpgrade(upgradeData);
      res.json(upgrade);
    } catch (error) {
      res.status(400).json({ error: "Invalid upgrade data" });
    }
  });

  app.post("/api/upgrade/purchase", async (req, res) => {
    try {
      const { userId, upgradeId } = req.body;
      const upgrade = await storage.upgradeUserUpgrade(userId, upgradeId);
      res.json(upgrade);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Game stats routes
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/stats/:userId", async (req, res) => {
    try {
      await storage.updateUserStats(req.params.userId, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat routes
  app.get("/api/chat/:userId/:characterId?", async (req, res) => {
    try {
      const { characterId } = req.params;
      const messages = await storage.getChatMessages(req.params.userId, characterId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      
      // TODO: Add AI response generation here
      // For now, return a simple response
      const aiResponse = await storage.createChatMessage({
        userId: messageData.userId,
        characterId: messageData.characterId,
        message: "I understand! Thanks for talking with me.",
        isFromUser: false
      });
      
      res.json({ userMessage: message, aiResponse });
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.delete("/api/chat/:userId/:characterId?", async (req, res) => {
    try {
      const { characterId } = req.params;
      await storage.clearChatHistory(req.params.userId, characterId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Game action routes
  app.post("/api/tap", async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check energy
      if (user.energy <= 0) {
        return res.status(400).json({ error: "No energy remaining" });
      }

      // Calculate points per tap (base 125 + upgrades)
      const upgrades = await storage.getUserUpgrades(userId);
      const tapBonus = upgrades.reduce((sum, upgrade) => sum + upgrade.tapBonus, 0);
      const pointsPerTap = 125 + tapBonus;

      // Update user
      await storage.updateUser(userId, {
        points: user.points + pointsPerTap,
        energy: Math.max(0, user.energy - 1)
      });

      // Update stats
      const stats = await storage.getUserStats(userId);
      await storage.updateUserStats(userId, {
        totalTaps: stats.totalTaps + 1,
        totalEarned: stats.totalEarned + pointsPerTap
      });

      res.json({
        pointsEarned: pointsPerTap,
        newPoints: user.points + pointsPerTap,
        newEnergy: Math.max(0, user.energy - 1)
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Wheel routes
  app.get("/api/wheel/last-spin/:userId", async (req, res) => {
    try {
      const lastSpin = await storage.getLastWheelSpin(req.params.userId);
      res.json({ lastSpin });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/wheel/spin", async (req, res) => {
    try {
      const { userId } = req.body;
      const lastSpin = await storage.getLastWheelSpin(userId);
      
      // Check if user can spin (once per day)
      if (lastSpin) {
        const now = new Date();
        const lastSpinDate = new Date(lastSpin);
        const timeDiff = now.getTime() - lastSpinDate.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        
        if (hoursDiff < 24) {
          return res.status(400).json({ error: "Daily spin already used" });
        }
      }

      // Get game settings for rewards
      const settings = await storage.getGameSettings();
      const rewards = settings.wheelRewards;
      
      // Select random reward
      const rand = Math.random();
      let cumProb = 0;
      let selectedReward;
      
      for (const reward of rewards) {
        cumProb += reward.probability;
        if (rand <= cumProb) {
          selectedReward = reward;
          break;
        }
      }
      
      if (!selectedReward) {
        selectedReward = rewards[0]; // fallback
      }

      // Apply reward
      let rewardAmount = 0;
      if (selectedReward.type !== 'character') {
        rewardAmount = Math.floor(Math.random() * (selectedReward.max! - selectedReward.min! + 1)) + selectedReward.min!;
        
        const user = await storage.getUser(userId);
        if (user) {
          const updates: any = {};
          if (selectedReward.type === 'coins') {
            updates.points = user.points + rewardAmount;
          } else if (selectedReward.type === 'energy') {
            updates.energy = Math.min(user.maxEnergy, user.energy + rewardAmount);
          }
          await storage.updateUser(userId, updates);
        }
      }

      // Record spin
      await storage.recordWheelSpin(userId, `${selectedReward.type}:${rewardAmount}`);

      res.json({
        reward: selectedReward.type,
        amount: rewardAmount,
        message: `You won ${rewardAmount} ${selectedReward.type}!`
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/export", async (req, res) => {
    try {
      const data = await storage.exportAllData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getGameSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      await storage.updateGameSettings(req.body);
      const settings = await storage.getGameSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
