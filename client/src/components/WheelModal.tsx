import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const WHEEL_SEGMENTS = [
  { label: "+1000 coins", color: "#FF6B6B", icon: "💰", weight: 25 },
  { label: "gems", color: "#4ECDC4", icon: "💎", weight: 15 },
  { label: "+10 coins", color: "#45B7D1", icon: "🪙", weight: 30 },
  { label: "+500 coins", color: "#96CEB4", icon: "💰", weight: 20 },
  { label: "Character unlock", color: "#FFEAA7", icon: "👤", weight: 5 },
  { label: "+500 coins", color: "#DDA0DD", icon: "💰", weight: 20 },
  { label: "gems", color: "#FFB347", icon: "💎", weight: 15 },
  { label: "+10 coins", color: "#F8BBD9", icon: "🪙", weight: 30 }
];

export default function WheelModal({ isOpen, onClose, userId }: WheelModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const { toast } = useToast();

  // Get user stats to check wheel availability
  const { data: stats } = useQuery({
    queryKey: ["/api/stats", userId],
    enabled: isOpen,
  });

  // Calculate time until next spin
  useEffect(() => {
    if (!stats?.lastWheelSpin) {
      setTimeLeft("");
      return;
    }

    const updateTimer = () => {
      const lastSpin = new Date(stats.lastWheelSpin);
      const nextSpin = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      const now = new Date();
      const diff = nextSpin.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [stats?.lastWheelSpin]);

  const canSpin = !stats?.lastWheelSpin || timeLeft === "";

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/wheel/spin", { userId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats", userId] });
      setResult(data.message);
      toast({
        title: "Wheel Spin Result!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Spin Failed",
        description: error.message || "Daily spin already used!",
        variant: "destructive",
      });
    },
  });

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Generate random rotation (multiple full spins + random position)
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const randomSegment = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const randomRotation = rotation + 1440 + (randomSegment * segmentAngle) + Math.random() * segmentAngle;
    setRotation(randomRotation);
    
    // Call API after animation
    setTimeout(() => {
      spinMutation.mutate();
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-700 via-blue-800 to-purple-900 text-white border-none max-w-md p-0 rounded-3xl overflow-hidden">
        <DialogTitle className="sr-only">Daily Wheel</DialogTitle>
        
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Daily Wheel</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/20 p-1 h-8 w-8 rounded-full"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Beautiful Wheel Design */}
        <div className="relative mx-auto mb-6 px-6">
          <div className="relative w-72 h-72 mx-auto">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 p-1">
              {/* Middle Ring */}
              <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-1">
                {/* Inner Ring */}
                <div className="w-full h-full rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-1">
                  {/* Center Wheel */}
                  <div 
                    className="w-full h-full rounded-full bg-gradient-to-br from-pink-300 to-blue-400 relative overflow-hidden"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                    }}
                  >
                    {/* Star in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">⭐</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Spin Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={handleSpin}
                disabled={isSpinning || !canSpin || spinMutation.isPending}
                className="w-32 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg rounded-full shadow-2xl border-2 border-white disabled:opacity-50"
                data-testid="button-spin-wheel"
              >
                {isSpinning ? "SPINNING..." : canSpin ? "🎯 SPIN NOW!" : "USED"}
              </Button>
            </div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-transparent border-b-white drop-shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Timer and Status */}
        <div className="px-6 pb-6">
          {timeLeft ? (
            <div className="bg-black/40 rounded-2xl p-4 mb-4">
              <div className="text-center">
                <div className="text-white font-bold text-lg mb-1">Next spin available in:</div>
                <div className="text-2xl font-bold text-orange-400">{timeLeft}</div>
                <div className="text-sm text-white/70">One spin per day</div>
              </div>
            </div>
          ) : (
            <div className="bg-black/40 rounded-2xl p-4 mb-4">
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">Free spin available!</div>
                <div className="text-sm text-white/70">Claim your daily reward</div>
              </div>
            </div>
          )}

          {/* Recent Rewards */}
          <div className="bg-black/40 rounded-2xl p-4 mb-4">
            <div className="text-white font-bold text-sm mb-2">Recent Rewards</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Yesterday:</span>
                <span className="text-yellow-400 font-bold">+500 coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">2 days ago:</span>
                <span className="text-purple-400 font-bold">Character unlock</span>
              </div>
            </div>
          </div>

          {/* Possible Rewards */}
          <div className="bg-black/40 rounded-2xl p-4">
            <div className="text-white font-bold text-sm mb-3">Possible Rewards</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span>🪙</span>
                <span className="text-yellow-400">+1000 coins:</span>
                <span className="text-green-400">+10</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💎</span>
                <span className="text-blue-400">gems:</span>
                <span className="text-yellow-400">+500</span>
              </div>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center">
              <div className="text-white font-bold text-lg">{result}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}