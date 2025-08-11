import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const WHEEL_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Cyan  
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Purple
  "#FFB347", // Orange
  "#F8BBD9"  // Pink
];

const REWARDS = [
  { label: "100 Coins", type: "coins", value: 100 },
  { label: "Energy", type: "energy", value: 250 },
  { label: "500 Coins", type: "coins", value: 500 },
  { label: "Gems", type: "gems", value: 5 },
  { label: "1000 Coins", type: "coins", value: 1000 },
  { label: "Character", type: "character", value: 0 },
  { label: "250 Energy", type: "energy", value: 250 },
  { label: "Jackpot", type: "coins", value: 2000 }
];

export default function WheelModal({ isOpen, onClose, userId }: WheelModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/wheel/spin", { userId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      setResult(`You won ${data.amount} ${data.reward}!`);
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
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Generate random rotation (multiple full spins + random position)
    const randomRotation = rotation + 1440 + Math.random() * 360;
    setRotation(randomRotation);
    
    // Call API after animation
    setTimeout(() => {
      spinMutation.mutate();
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-none max-w-sm p-6 rounded-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎯</span>
            </div>
            <h2 className="text-xl font-bold text-pink-300">Spin Wheel</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/20 p-1 h-8 w-8 rounded-full"
          >
            ✕
          </Button>
        </div>

        {/* Wheel Container */}
        <div className="relative mx-auto mb-6">
          <div className="relative w-64 h-64">
            {/* Wheel */}
            <div 
              className="w-full h-full rounded-full border-4 border-white relative overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
            >
              {REWARDS.map((reward, index) => (
                <div
                  key={index}
                  className="absolute w-1/2 h-1/2 origin-bottom-right"
                  style={{
                    transform: `rotate(${index * 45}deg)`,
                    backgroundColor: WHEEL_COLORS[index],
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
                  }}
                >
                  <div 
                    className="absolute text-xs font-bold text-white"
                    style={{
                      top: '20px',
                      left: '40px',
                      transform: `rotate(${22.5}deg)`,
                      fontSize: '10px'
                    }}
                  >
                    {reward.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Center Spin Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={handleSpin}
                disabled={isSpinning || spinMutation.isPending}
                className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-lg"
              >
                {isSpinning ? "..." : "SPIN"}
              </Button>
            </div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-white"></div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-white/90 text-sm">
            {result || "Click to spin and win prizes!"}
          </p>
          {!result && (
            <p className="text-white/70 text-xs mt-1">
              Free spin every 24 hours
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}