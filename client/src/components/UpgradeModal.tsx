import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Upgrade, User } from "@shared/schema";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgrades: Upgrade[];
  user: User;
}

export default function UpgradeModal({ isOpen, onClose, upgrades, user }: UpgradeModalProps) {
  const { toast } = useToast();

  const purchaseUpgradeMutation = useMutation({
    mutationFn: async (upgradeId: string) => {
      const response = await apiRequest("POST", "/api/upgrade/purchase", {
        userId: user.id,
        upgradeId
      });
      return response.json();
    },
    onSuccess: (data, upgradeId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/upgrades", user.id] });
      
      const upgrade = upgrades.find(u => u.id === upgradeId);
      toast({
        title: "Upgrade Purchased!",
        description: `${upgrade?.name} upgraded to level ${data.level}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase upgrade",
        variant: "destructive",
      });
    },
  });

  const canAfford = (cost: number) => user.points >= cost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900 to-pink-900 text-white border border-purple-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">Upgrades</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {upgrades.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No upgrades available</p>
                <p className="text-sm">Check back later for new upgrades!</p>
              </div>
            ) : (
              upgrades.map((upgrade) => (
                <div key={upgrade.id} className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-yellow-400">{upgrade.name}</h4>
                      <p className="text-sm text-gray-300">{upgrade.description}</p>
                      <p className="text-xs text-blue-400">
                        +{upgrade.hourlyBonus}/hour {upgrade.tapBonus > 0 && `+${upgrade.tapBonus}/tap`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${canAfford(upgrade.cost) ? 'text-green-400' : 'text-red-400'}`}>
                        {upgrade.cost.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Level {upgrade.level}/{upgrade.maxLevel}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => purchaseUpgradeMutation.mutate(upgrade.id)}
                    disabled={!canAfford(upgrade.cost) || upgrade.level >= upgrade.maxLevel || purchaseUpgradeMutation.isPending}
                    className={`w-full py-2 rounded-lg font-semibold transition-all ${
                      canAfford(upgrade.cost) && upgrade.level < upgrade.maxLevel
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {upgrade.level >= upgrade.maxLevel 
                      ? 'Max Level' 
                      : purchaseUpgradeMutation.isPending 
                      ? 'Purchasing...' 
                      : canAfford(upgrade.cost)
                      ? 'Upgrade'
                      : 'Insufficient Funds'
                    }
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
