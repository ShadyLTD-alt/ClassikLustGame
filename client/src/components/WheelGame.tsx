import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Zap, Gift, Coins, Heart, Star, Crown, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WheelReward {
  type: string;
  min?: number;
  max?: number;
  probability: number;
  icon: string;
  color: string;
}

interface SpinResult {
  reward: string;
  amount: number;
  message: string;
}

interface WheelGameProps {
  isOpen?: boolean;
  onClose?: () => void;
  userId?: string;
}

export default function WheelGame({ isOpen, onClose, userId = "mock-user-id" }: WheelGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data for current points/energy
  const { data: user } = useQuery({
    queryKey: ['/api/user', userId],
    queryFn: () => fetch(`/api/user/${userId}`).then(res => res.json())
  });

  // Fetch last spin time
  const { data: lastSpinData } = useQuery({
    queryKey: ['/api/wheel/last-spin', userId],
    queryFn: () => fetch(`/api/wheel/last-spin/${userId}`).then(res => res.json())
  });

  // Fetch game settings for wheel rewards
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: () => fetch('/api/settings').then(res => res.json())
  });

  const wheelRewards: WheelReward[] = settings?.wheelRewards || [
    { type: 'coins', min: 100, max: 500, probability: 0.3, icon: '🪙', color: 'bg-yellow-500' },
    { type: 'energy', min: 10, max: 30, probability: 0.25, icon: '⚡', color: 'bg-blue-500' },
    { type: 'coins', min: 50, max: 200, probability: 0.2, icon: '💰', color: 'bg-green-500' },
    { type: 'energy', min: 5, max: 15, probability: 0.15, icon: '🔋', color: 'bg-cyan-500' },
    { type: 'character', min: 0, max: 0, probability: 0.05, icon: '👸', color: 'bg-purple-500' },
    { type: 'coins', min: 25, max: 100, probability: 0.05, icon: '🎁', color: 'bg-pink-500' }
  ];

  // Spin wheel mutation
  const spinMutation = useMutation({
    mutationFn: () => apiRequest('/api/wheel/spin', { method: 'POST', body: { userId } }),
    onSuccess: (result: SpinResult) => {
      setSpinResult(result);
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/wheel/last-spin', userId] });
      
      toast({
        title: "Wheel Spin Result!",
        description: result.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Spin Failed",
        description: error.message || "Could not spin the wheel",
        variant: "destructive"
      });
      setIsSpinning(false);
    }
  });

  // Calculate time until next spin
  useEffect(() => {
    if (!lastSpinData?.lastSpin) return;

    const lastSpinTime = new Date(lastSpinData.lastSpin).getTime();
    const now = Date.now();
    const timeDiff = now - lastSpinTime;
    const hoursLeft = 24 - (timeDiff / (1000 * 60 * 60));
    
    if (hoursLeft > 0) {
      setTimeUntilNext(hoursLeft);
      
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const newTimeDiff = currentTime - lastSpinTime;
        const newHoursLeft = 24 - (newTimeDiff / (1000 * 60 * 60));
        
        if (newHoursLeft <= 0) {
          setTimeUntilNext(0);
          clearInterval(interval);
        } else {
          setTimeUntilNext(newHoursLeft);
        }
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    } else {
      setTimeUntilNext(0);
    }
  }, [lastSpinData]);

  const canSpin = timeUntilNext <= 0;

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    // Animate wheel
    const spins = 5; // Number of full rotations
    const randomAngle = Math.random() * 360;
    const totalRotation = wheelRotation + (spins * 360) + randomAngle;
    
    setWheelRotation(totalRotation);

    // Wait for animation to complete, then trigger API call
    setTimeout(() => {
      spinMutation.mutate();
      setIsSpinning(false);
    }, 3000);
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours <= 0) return "Ready to spin!";
    
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    
    if (h > 0) {
      return `${h}h ${m}m remaining`;
    } else {
      return `${m}m remaining`;
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'coins': return <Coins className="h-4 w-4" />;
      case 'energy': return <Zap className="h-4 w-4" />;
      case 'character': return <Crown className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Daily Wheel Spin</h2>
        <p className="text-muted-foreground">
          Spin the wheel once per day for amazing rewards!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wheel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Reward Wheel
              </CardTitle>
              <CardDescription>
                Spin to win coins, energy, or even rare characters!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {/* Wheel Container */}
              <div className="relative">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-foreground" />
                </div>

                {/* Wheel */}
                <div
                  ref={wheelRef}
                  className="w-64 h-64 rounded-full border-4 border-border relative overflow-hidden"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
                  }}
                >
                  {wheelRewards.map((reward, index) => {
                    const angle = (360 / wheelRewards.length) * index;
                    const nextAngle = (360 / wheelRewards.length) * (index + 1);
                    
                    return (
                      <div
                        key={index}
                        className={`absolute w-1/2 h-1/2 origin-bottom-right ${reward.color}`}
                        style={{
                          transform: `rotate(${angle}deg)`,
                          clipPath: `polygon(0% 100%, 0% 0%, ${100 * Math.sin((Math.PI * (nextAngle - angle)) / 180)}% ${100 * (1 - Math.cos((Math.PI * (nextAngle - angle)) / 180))}%)`
                        }}
                      >
                        <div 
                          className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg"
                          style={{ transform: `rotate(${(nextAngle - angle) / 2}deg)` }}
                        >
                          <span className="text-2xl">{reward.icon}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spin Button */}
              <div className="text-center space-y-4">
                <Button
                  onClick={handleSpin}
                  disabled={!canSpin || isSpinning || spinMutation.isPending}
                  size="lg"
                  className="px-8 py-6 text-lg font-bold"
                >
                  {isSpinning ? "Spinning..." : canSpin ? "SPIN NOW!" : "Not Available"}
                </Button>

                {!canSpin && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      <span>{formatTimeRemaining(timeUntilNext)}</span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, ((24 - timeUntilNext) / 24) * 100))} 
                      className="mt-2 w-64"
                    />
                  </div>
                )}
              </div>

              {/* Spin Result */}
              {spinResult && (
                <Card className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300">
                  <CardContent className="pt-6 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl">🎉</div>
                      <h3 className="text-xl font-bold">Congratulations!</h3>
                      <p className="text-lg">{spinResult.message}</p>
                      <div className="flex items-center justify-center gap-2">
                        {getRewardIcon(spinResult.reward)}
                        <span className="font-bold">
                          {spinResult.amount > 0 ? `+${spinResult.amount}` : ''} {spinResult.reward}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span>Coins</span>
                </div>
                <Badge variant="secondary">{user?.points || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Energy</span>
                </div>
                <Badge variant="secondary">{user?.energy || 0}/{user?.maxEnergy || 100}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Level</span>
                </div>
                <Badge variant="secondary">{user?.level || 1}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Info */}
          <Card>
            <CardHeader>
              <CardTitle>Possible Rewards</CardTitle>
              <CardDescription>
                What you can win from the wheel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {wheelRewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{reward.icon}</span>
                    <span className="capitalize">{reward.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {reward.type !== 'character' ? `${reward.min}-${reward.max}` : 'Rare'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(reward.probability * 100).toFixed(1)}% chance
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• One free spin every 24 hours</p>
              <p>• Rewards are added to your account instantly</p>
              <p>• Higher value rewards have lower chances</p>
              <p>• Character rewards unlock new chat partners</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}