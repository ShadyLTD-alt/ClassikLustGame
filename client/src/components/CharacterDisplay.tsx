import { useState } from "react";
//import { Button } from "@/components/ui/button";
import type { Character, User, GameStats } from "@shared/schema";

interface CharacterDisplayProps {
  character: Character;
  user: User;
  stats?: GameStats;
  onTap: (event: React.MouseEvent) => void;
  isTapping: boolean;
}

export default function CharacterDisplay({ character, user, onTap, isTapping }: CharacterDisplayProps) {
  const [tapEffect, setTapEffect] = useState(false);

  const handleTap = (event: React.MouseEvent) => {
    if (user.energy <= 0 || isTapping) return;

    setTapEffect(true);
    onTap(event);

    // Remove tap effect after animation
    setTimeout(() => {
      setTapEffect(false);
    }, 200);
  };

  return (
    <div className="px-4 pb-6">
      <div className="relative bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/30">
      </div>

        {/* Character Info */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">{character.name}</h2>

        {/* Character Image Container */}
          <div className="relative mx-auto w-50 h-70 mb-6">
      <img
        src={character.imageUrl || character.avatarUrl || 'https://placehold.co/256x320/666666/FFFFFF?text=Placeholder'}
        alt={character.name}
        onClick={handleTap}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== 'https://placehold.co/256x320/666666/FFFFFF?text=Placeholder') {
            target.src = 'https://placehold.co/256x320/666666/FFFFFF?text=Placeholder';
          }
        }}
          className={`w-full h-full object-cover rounded-2xl shadow-2xl cursor-pointer transform hover:scale-105 transition-transform duration-200 animate-float ${
          tapEffect ? 'tap-effect' : ''
        } ${user.energy <= 0 ? 'grayscale opacity-50' : ''}`}
        style={{
          filter: user.energy <= 0 ? 'grayscale(100%)' : 'none'
        }}
      />
    </div>
         



          {/* Tap Effect Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl transition-opacity duration-200 pointer-events-none' ${
              tapEffect ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Floating Hearts */}
          <div
            className={`absolute top-4 right-4 transition-opacity duration-200' ${
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
      </div>
  );
}