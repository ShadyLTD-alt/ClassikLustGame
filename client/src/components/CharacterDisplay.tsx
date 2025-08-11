import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Character, User, GameStats } from "@shared/schema";

interface CharacterDisplayProps {
  character: Character;
  user: User;
  stats?: GameStats;
  onTap: () => void;
  isTapping: boolean;
}

export default function CharacterDisplay({ character, user, stats, onTap, isTapping }: CharacterDisplayProps) {
  const [tapEffect, setTapEffect] = useState(false);

  const handleTap = () => {
    if (user.energy <= 0 || isTapping) return;

    setTapEffect(true);
    onTap();

    // Remove tap effect after animation
    setTimeout(() => {
      setTapEffect(false);
    }, 200);
  };

  const energyPercentage = (user.energy / user.maxEnergy) * 100;

  return (
    <div className="px-4 pb-6">
      <div className="relative bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/30">
        
        {/* Character Info */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">{character.name}</h2>
          <p className="text-gray-300 text-sm">{character.bio}</p>
          <div className="flex justify-center items-center mt-2 space-x-2">
            <i className="fas fa-heart text-red-400"></i>
            <span className="text-sm">❤️ 85%</span>
            <span className="text-xs text-gray-400">Level {user.level}</span>
          </div>
        </div>

        {/* Character Image Container */}
        <div className="relative mx-auto w-64 h-80 mb-6">
          <img 
            src={character.imageUrl} 
            alt={character.name}
            className={`w-full h-full object-cover rounded-2xl shadow-2xl cursor-pointer transform hover:scale-105 transition-transform duration-200 animate-float ${
              tapEffect ? 'tap-effect' : ''
            } ${user.energy <= 0 ? 'grayscale opacity-50' : ''}`}
            onClick={handleTap}
            style={{
              filter: user.energy <= 0 ? 'grayscale(100%)' : 'none'
            }}
          />
          
          {/* Tap Effect Overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl transition-opacity duration-200 pointer-events-none ${
              tapEffect ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Floating Hearts */}
          <div 
            className={`absolute top-4 right-4 transition-opacity duration-200 ${
              tapEffect ? 'opacity-100 animate-bounce' : 'opacity-0'
            }`}
          >
            <i className="fas fa-heart text-red-400 text-2xl"></i>
          </div>

          {/* No Energy Overlay */}
          {user.energy <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
              <div className="text-center text-white">
                <i className="fas fa-battery-empty text-4xl mb-2"></i>
                <p className="text-sm">No Energy!</p>
                <p className="text-xs text-gray-400">Wait for energy to regenerate</p>
              </div>
            </div>
          )}
        </div>

        {/* Energy Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Energy</span>
            <span>{user.energy}/{user.maxEnergy}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="energy-bar h-3 rounded-full transition-all duration-300" 
              style={{ width: `${energyPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-900/30 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-400">{stats?.totalTaps || 0}</div>
            <div className="text-xs text-gray-400">Total Taps</div>
          </div>
          <div className="bg-green-900/30 rounded-lg p-3">
            <div className="text-lg font-bold text-green-400">+125</div>
            <div className="text-xs text-gray-400">Per Tap</div>
          </div>
          <div className="bg-purple-900/30 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-400">{user.hourlyRate.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Per Hour</div>
          </div>
        </div>
      </div>
    </div>
  );
}
