import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "@/components/GameHeader";
import CharacterDisplay from "@/components/CharacterDisplay";
import UpgradeModal from "@/components/UpgradeModal";
import ChatModal from "@/components/ChatModal";
import { Button } from "@/components/ui/button";
import type { User, Character, Upgrade, GameStats } from "@shared/schema";

const MOCK_USER_ID = "mock-user-id";

export default function Game() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ff69b4%27 fill-opacity=%270.05%27%3E%3Ccircle cx=%2730%27 cy=%2730%27 r=%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <GameHeader user={user} />

      {/* Event Banner */}
      <div className="m-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-4 text-center animate-pulse">
        <h3 className="text-white font-bold text-lg">🎉 VALENTINE'S EVENT ACTIVE! 🎉</h3>
        <p className="text-sm text-pink-100">Double rewards for all activities!</p>
      </div>

      <CharacterDisplay 
        character={character}
        user={user}
        stats={stats}
        onTap={() => tapMutation.mutate()}
        isTapping={tapMutation.isPending}
      />

      {/* Floating Action Buttons */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 space-y-3 z-40">
        <Button
          onClick={() => toast({ title: "Wheel", description: "Coming soon!" })}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
        >
          🎁
        </Button>
        <Button
          onClick={() => toast({ title: "Power-ups", description: "Coming soon!" })}
          className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
        >
          ⚡
        </Button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-purple-500/30 z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Button
            onClick={() => setShowUpgradeModal(true)}
            variant="ghost"
            className="flex flex-col items-center py-3 px-2 rounded-lg hover:bg-purple-700/50 transition-colors"
          >
            <i className="fas fa-arrow-up text-lg mb-1"></i>
            <span className="text-xs">Upgrade</span>
          </Button>
          <Button
            onClick={() => toast({ title: "Tasks", description: "Coming soon!" })}
            variant="ghost"
            className="flex flex-col items-center py-3 px-2 rounded-lg hover:bg-purple-700/50 transition-colors"
          >
            <i className="fas fa-tasks text-lg mb-1"></i>
            <span className="text-xs">Tasks</span>
          </Button>
          <Button
            onClick={() => toast({ title: "Shop", description: "Coming soon!" })}
            variant="ghost"
            className="flex flex-col items-center py-3 px-2 rounded-lg hover:bg-purple-700/50 transition-colors"
          >
            <i className="fas fa-shopping-bag text-lg mb-1"></i>
            <span className="text-xs">Shop</span>
          </Button>
          <Button
            onClick={() => toast({ title: "Friends", description: "Coming soon!" })}
            variant="ghost"
            className="flex flex-col items-center py-3 px-2 rounded-lg hover:bg-purple-700/50 transition-colors"
          >
            <i className="fas fa-users text-lg mb-1"></i>
            <span className="text-xs">Friends</span>
          </Button>
          <Button
            onClick={() => setShowChatModal(true)}
            variant="ghost"
            className="flex flex-col items-center py-3 px-2 rounded-lg hover:bg-purple-700/50 transition-colors relative"
          >
            <i className="fas fa-comment text-lg mb-1"></i>
            <span className="text-xs">Chat</span>
            <div className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </Button>
        </div>
      </nav>

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
        character={character}
        userId={MOCK_USER_ID}
      />
    </div>
  );
}
