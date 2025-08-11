import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { insertUserSchema, insertCharacterSchema, insertUpgradeSchema, insertChatMessageSchema, insertMediaFileSchema } from "@shared/schema";

// Configure multer for file uploads
const uploadDir = './public/uploads';
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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
      const rewards = settings.wheelRewards as any[];
      
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
        selectedReward = rewards[0] as any; // fallback
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

  // ===== IMAGE MANAGEMENT SYSTEM =====
  
  // Get all media files with optional character filter
  app.get("/api/media", async (req, res) => {
    try {
      const { characterId, level, nsfw, sortBy = 'createdAt' } = req.query;
      let mediaFiles = await storage.getMediaFiles(characterId as string);
      
      // Filter by NSFW if specified
      if (nsfw !== undefined) {
        const nsfwFilter = nsfw === 'true';
        const filteredFiles = [];
        for (const file of mediaFiles) {
          const character = await storage.getCharacter(file.characterId || '');
          if (character ? character.isNsfw === nsfwFilter : false) {
            filteredFiles.push(file);
          }
        }
        mediaFiles = filteredFiles;
      }
      
      // Sort by specified field
      mediaFiles.sort((a, b) => {
        if (sortBy === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'filename') {
          return a.filename.localeCompare(b.filename);
        }
        return 0;
      });
      
      res.json(mediaFiles);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Upload single or multiple images with processing
  app.post("/api/media/upload", upload.array('images', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { characterId, userId, processOptions } = req.body;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const uploadedFiles = [];
      
      for (const file of files) {
        // Process image with Sharp if options provided
        let processedPath = file.path;
        if (processOptions) {
          const options = JSON.parse(processOptions);
          const processedFilename = 'processed-' + file.filename;
          processedPath = path.join(uploadDir, processedFilename);
          
          let sharpProcessor = sharp(file.path);
          
          // Apply cropping if specified
          if (options.crop) {
            sharpProcessor = sharpProcessor.extract({
              left: options.crop.x,
              top: options.crop.y,
              width: options.crop.width,
              height: options.crop.height
            });
          }
          
          // Apply resizing if specified
          if (options.resize) {
            sharpProcessor = sharpProcessor.resize(options.resize.width, options.resize.height);
          }
          
          // Apply format conversion
          if (options.format) {
            sharpProcessor = sharpProcessor.toFormat(options.format);
          }
          
          await sharpProcessor.toFile(processedPath);
          
          // Delete original file
          await fs.unlink(file.path);
        }
        
        // Save to database
        const mediaFile = {
          filename: path.basename(processedPath),
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: (await fs.stat(processedPath)).size,
          path: `/uploads/${path.basename(processedPath)}`,
          characterId: characterId || null,
          uploadedBy: userId
        };
        
        await storage.saveMediaFile(mediaFile as any);
        uploadedFiles.push(mediaFile);
      }
      
      res.json({
        success: true,
        files: uploadedFiles,
        message: `${uploadedFiles.length} file(s) uploaded successfully`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific media file
  app.get("/api/media/:id", async (req, res) => {
    try {
      const mediaFile = await storage.getMediaFile(req.params.id);
      if (!mediaFile) {
        return res.status(404).json({ error: "Media file not found" });
      }
      res.json(mediaFile);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update media file metadata
  app.patch("/api/media/:id", async (req, res) => {
    try {
      const { characterId, tags, description } = req.body;
      const updatedFile = await storage.updateMediaFile(req.params.id, {
        characterId,
        // Add support for tags and description in schema if needed
      });
      
      if (!updatedFile) {
        return res.status(404).json({ error: "Media file not found" });
      }
      
      res.json(updatedFile);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete media file
  app.delete("/api/media/:id", async (req, res) => {
    try {
      const mediaFile = await storage.getMediaFile(req.params.id);
      if (!mediaFile) {
        return res.status(404).json({ error: "Media file not found" });
      }
      
      // Delete physical file
      const fullPath = path.join('./public', mediaFile.path);
      try {
        await fs.unlink(fullPath);
      } catch (err) {
        console.warn('Could not delete physical file:', fullPath);
      }
      
      // Delete from database
      await storage.deleteMediaFile(req.params.id);
      
      res.json({ success: true, message: "Media file deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assign media to character
  app.post("/api/media/:id/assign", async (req, res) => {
    try {
      const { characterId } = req.body;
      await storage.assignMediaToCharacter(req.params.id, characterId);
      res.json({ success: true, message: "Media assigned to character" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Crop/edit image endpoint
  app.post("/api/media/:id/edit", async (req, res) => {
    try {
      const { crop, resize, format, quality } = req.body;
      const mediaFile = await storage.getMediaFile(req.params.id);
      
      if (!mediaFile) {
        return res.status(404).json({ error: "Media file not found" });
      }
      
      const originalPath = path.join('./public', mediaFile.path);
      const editedFilename = 'edited-' + Date.now() + '-' + mediaFile.filename;
      const editedPath = path.join(uploadDir, editedFilename);
      
      let sharpProcessor = sharp(originalPath);
      
      // Apply transformations
      if (crop) {
        sharpProcessor = sharpProcessor.extract({
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height
        });
      }
      
      if (resize) {
        sharpProcessor = sharpProcessor.resize(resize.width, resize.height);
      }
      
      if (format) {
        sharpProcessor = sharpProcessor.toFormat(format, { quality: quality || 90 });
      }
      
      await sharpProcessor.toFile(editedPath);
      
      // Create new media file entry
      const editedFile = {
        filename: editedFilename,
        originalName: `edited-${mediaFile.originalName}`,
        mimeType: format ? `image/${format}` : mediaFile.mimeType,
        size: (await fs.stat(editedPath)).size,
        path: `/uploads/${editedFilename}`,
        characterId: mediaFile.characterId,
        uploadedBy: mediaFile.uploadedBy
      };
      
      await storage.saveMediaFile(editedFile as any);
      
      res.json({
        success: true,
        editedFile,
        message: "Image edited successfully"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin routes for characters
  app.get("/api/admin/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/media", async (req, res) => {
    try {
      const mediaFiles = await storage.getMediaFiles();
      res.json(mediaFiles);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Character management routes
  app.get("/api/character/:id", async (req, res) => {
    try {
      const character = await storage.getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/character/:id", async (req, res) => {
    try {
      const character = await storage.updateCharacter(req.params.id, req.body);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/character/:id", async (req, res) => {
    try {
      await storage.deleteCharacter(req.params.id);
      res.json({ success: true, message: "Character deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
