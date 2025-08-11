import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function AdminPanel({ isOpen, onClose, userId }: AdminPanelProps) {
  const [newUserName, setNewUserName] = useState("");
  const { toast } = useToast();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isOpen,
  });

  const createUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("POST", "/api/admin/users", { username });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setNewUserName("");
      toast({
        title: "User Created",
        description: "New user created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-none max-w-md p-6 rounded-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">⚙️</span>
            </div>
            <h2 className="text-xl font-bold text-pink-300">Game Settings</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/20 p-1 h-8 w-8 rounded-full"
          >
            ✕
          </Button>
        </div>

        {/* Layout & Design Editor Section */}
        <div className="mb-6">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">🎨</span>
              <h3 className="text-pink-300 font-bold">Layout & Design Editor</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-600/50 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">🖼️</div>
                <div className="text-sm font-semibold">Images</div>
                <div className="text-xs text-white/70">Manage character & background images</div>
              </div>
              
              <div className="bg-purple-600/50 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">🎨</div>
                <div className="text-sm font-semibold">Themes</div>
                <div className="text-xs text-white/70">Customize colors & layout</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Options Section */}
        <div className="mb-6">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">🎮</span>
              <h3 className="text-pink-300 font-bold">Game Options</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-600/50 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">👥</div>
                <div className="text-sm font-semibold">Characters</div>
                <div className="text-xs text-white/70">Select & unlock characters</div>
              </div>
              
              <div className="bg-purple-600/50 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">⭐</div>
                <div className="text-sm font-semibold">Upgrades</div>
                <div className="text-xs text-white/70">Character improvements</div>
              </div>
              
              <div className="bg-purple-600/50 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">✨</div>
                <div className="text-sm font-semibold">Create Character</div>
                <div className="text-xs text-white/70">Design your own</div>
              </div>
              
              <div className="bg-purple-600/50 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">🚪</div>
                <div className="text-sm font-semibold">Logout</div>
                <div className="text-xs text-white/70">Sign out of game</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Create new user..."
              className="flex-1 bg-white/10 border-none text-white placeholder-white/60 rounded-xl px-4"
              disabled={createUserMutation.isPending}
            />
            <Button
              onClick={() => newUserName && createUserMutation.mutate(newUserName)}
              disabled={!newUserName || createUserMutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-xl"
            >
              Add
            </Button>
          </div>
          
          <div className="text-center text-white/70 text-sm">
            Active Users: {users.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}