import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "@/components/GameHeader";
import CharacterDisplay from "@/components/CharacterDisplay";
import UpgradeModal from "@/components/UpgradeModal";
import ChatModal from "@/components/ChatModal";
import AdminPanel from "@/components/AdminPanel";
import WheelModal from "@/components/WheelModal";
import { Button } from "@/components/ui/button";
import type { User, Character, Upgrade, GameStats } from "@shared/schema";

const MOCK_USER_ID = "mock-user-id";

export default function Game() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const { toast } = useToast();

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user", MOCK_USER_ID],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch selected character
  const { data: character, isLoading: characterLoading } = useQuery<Character>({
    queryKey: ["/api/character/selected", MOCK_USER_ID],
  });

  // Fetch user upgrades
  const { data: upgrades } = useQuery<Upgrade[]>({
    queryKey: ["/api/upgrades", MOCK_USER_ID],
  });

  // Fetch user stats
  const { data: stats } = useQuery<GameStats>({
    queryKey: ["/api/stats", MOCK_USER_ID],
  });

  // Tap mutation
  const tapMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/tap", { userId: MOCK_USER_ID });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user", MOCK_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats", MOCK_USER_ID] });
      
      toast({
        title: "Tap Success!",
        description: `Earned ${data.pointsEarned} points!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Tap Failed",
        description: error.message || "Not enough energy!",
        variant: "destructive",
      });
    },
  });

  // Energy regeneration effect
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", MOCK_USER_ID] });
    }, 60000); // Check energy every minute

    return () => clearInterval(interval);
  }, []);

  if (userLoading || characterLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading ClassikLust...</div>
      </div>
    );
  }

  if (!user || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Game data not available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ff69b4%27 fill-opacity=%270.05%27%3E%3Ccircle cx=%2730%27 cy=%2730%27 r=%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      {/* Top Status Bar - Similar to reference */}
      <div className="relative z-10 flex justify-between items-center p-4">
        {/* Left: User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
            <img 
              src={character.imageUrl} 
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            LV.{user.level}/10
          </div>
          <div className="text-white font-bold">
            {user.username} 🏷️$WIF
          </div>
        </div>

        {/* Right: Resources */}
        <div className="flex items-center space-x-4">
          {/* Sugar per Hour */}
          <div className="bg-pink-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <span>🍬</span>
            <span>+{stats?.pointsPerSecond ? stats.pointsPerSecond * 3600 : 16933}</span>
            <span className="text-green-300 text-xs">10%</span>
          </div>
          
          {/* Current Points */}
          <div className="bg-green-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <span>💎</span>
            <span>{stats?.totalPoints ? stats.totalPoints.toLocaleString() : "2,430"}</span>
          </div>
          
          {/* Energy */}
          <div className="bg-yellow-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <span>⚡</span>
            <span>{stats?.currentEnergy !== undefined ? `${stats.currentEnergy}/${stats.maxEnergy}` : "4500/4500"}</span>
          </div>
        </div>
      </div>

      {/* Event News Banner */}
      <div className="mx-4 mb-4">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-bold">EVENT NEWS</span>
            <span className="text-xs">ℹ️</span>
          </div>
        </div>
      </div>

      {/* Main Character Display */}
      <div className="flex-1 relative">
        <CharacterDisplay 
          character={character}
          user={user}
          stats={stats}
          onTap={() => tapMutation.mutate()}
          isTapping={tapMutation.isPending}
        />
      </div>

      {/* Right Side Action Buttons */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-3 z-20">
        <Button
          onClick={() => setShowWheelModal(true)}
          className="w-14 h-14 rounded-full bg-pink-500/90 hover:bg-pink-600 text-white shadow-lg backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-lg">🎯</div>
            <div className="text-xs">Wheel</div>
          </div>
        </Button>
        
        <Button
          onClick={() => setShowAdminPanel(true)}
          className="w-14 h-14 rounded-full bg-purple-500/90 hover:bg-purple-600 text-white shadow-lg backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-lg">⚙️</div>
            <div className="text-xs">Settings</div>
          </div>
        </Button>
      </div>

      {/* Bottom Navigation Bar - Similar to reference */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md p-3">
        <div className="flex justify-around items-center">
          <Button
            className="flex flex-col items-center space-y-1 bg-transparent hover:bg-white/10 text-white p-3 rounded-lg"
          >
            <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-sm">📊</div>
            <span className="text-xs">Level Up</span>
            <div className="text-xs text-yellow-400">{stats?.totalPoints || 4560}</div>
          </Button>

          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="flex flex-col items-center space-y-1 bg-transparent hover:bg-white/10 text-white p-3 rounded-lg"
          >
            <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center text-sm">⬆️</div>
            <span className="text-xs">Upgrade</span>
          </Button>

          <Button
            onClick={() => toast({ title: "Tasks", description: "Coming soon!" })}
            className="flex flex-col items-center space-y-1 bg-transparent hover:bg-white/10 text-white p-3 rounded-lg"
          >
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-sm">📋</div>
            <span className="text-xs">Task</span>
          </Button>

          <Button
            onClick={() => toast({ title: "Shop", description: "Coming soon!" })}
            className="flex flex-col items-center space-y-1 bg-transparent hover:bg-white/10 text-white p-3 rounded-lg"
          >
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-sm">🛒</div>
            <span className="text-xs">Shop</span>
          </Button>

          <Button
            onClick={() => setShowChatModal(true)}
            className="flex flex-col items-center space-y-1 bg-transparent hover:bg-white/10 text-white p-3 rounded-lg"
          >
            <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-sm">💬</div>
            <span className="text-xs">Chat</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        upgrades={upgrades || []}
        user={user}
      />
      
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        characterId={character?.id || ""}
        characterName={character?.name || "Character"}
        userId={MOCK_USER_ID}
      />

      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        userId={MOCK_USER_ID}
      />

      <WheelModal
        isOpen={showWheelModal}
        onClose={() => setShowWheelModal(false)}
        userId={MOCK_USER_ID}
      />
    </div>
  );
}
