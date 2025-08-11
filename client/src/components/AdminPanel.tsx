import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User, Character, MediaFile } from "@shared/schema";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function AdminPanel({ isOpen, onClose, userId }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("characters");
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    personalityType: "",
    imageUrl: "",
    avatarUrl: "",
    unlockLevel: 1,
  });
  const { toast } = useToast();

  // Fetch data
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isOpen,
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/admin/characters"],
    enabled: isOpen,
  });

  const { data: mediaFiles = [] } = useQuery<MediaFile[]>({
    queryKey: ["/api/admin/media"],
    enabled: isOpen,
  });

  // Create character mutation
  const createCharacterMutation = useMutation({
    mutationFn: async (characterData: typeof newCharacter) => {
      const response = await apiRequest("POST", "/api/admin/character/create", characterData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/characters"] });
      setNewCharacter({
        name: "",
        description: "",
        personalityType: "",
        imageUrl: "",
        avatarUrl: "",
        unlockLevel: 1,
      });
      toast({
        title: "Character Created!",
        description: "New character has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create character",
        variant: "destructive",
      });
    },
  });

  // Delete character mutation
  const deleteCharacterMutation = useMutation({
    mutationFn: async (characterId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/character/${characterId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/characters"] });
      toast({
        title: "Character Deleted",
        description: "Character has been removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete character",
        variant: "destructive",
      });
    },
  });

  const handleCreateCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharacter.name.trim()) return;
    createCharacterMutation.mutate(newCharacter);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-none max-w-4xl p-0 rounded-3xl overflow-hidden h-[700px] flex flex-col">
        <DialogTitle className="sr-only">Admin Panel</DialogTitle>
        
        {/* Header */}
        <div className="p-6 pb-0 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⚙️</div>
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/20 p-1 h-8 w-8 rounded-full"
              data-testid="button-close-admin"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger 
                value="characters" 
                className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                data-testid="tab-characters"
              >
                Characters
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                data-testid="tab-users"
              >
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                data-testid="tab-media"
              >
                Media
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                data-testid="tab-settings"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Characters Tab */}
            <TabsContent value="characters" className="space-y-6 h-full overflow-y-auto">
              {/* Create Character Form */}
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-pink-400">Create New Character</h3>
                <form onSubmit={handleCreateCharacter} className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Character Name"
                    value={newCharacter.name}
                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-character-name"
                  />
                  <Input
                    placeholder="Personality Type"
                    value={newCharacter.personalityType}
                    onChange={(e) => setNewCharacter({ ...newCharacter, personalityType: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-character-personality"
                  />
                  <Input
                    placeholder="Image URL"
                    value={newCharacter.imageUrl}
                    onChange={(e) => setNewCharacter({ ...newCharacter, imageUrl: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-character-image"
                  />
                  <Input
                    placeholder="Avatar URL"
                    value={newCharacter.avatarUrl}
                    onChange={(e) => setNewCharacter({ ...newCharacter, avatarUrl: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-character-avatar"
                  />
                  <Input
                    type="number"
                    placeholder="Unlock Level"
                    value={newCharacter.unlockLevel}
                    onChange={(e) => setNewCharacter({ ...newCharacter, unlockLevel: parseInt(e.target.value) || 1 })}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-character-level"
                  />
                  <Button
                    type="submit"
                    disabled={createCharacterMutation.isPending || !newCharacter.name.trim()}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    data-testid="button-create-character"
                  >
                    Create Character
                  </Button>
                  <Textarea
                    placeholder="Character Description"
                    value={newCharacter.description}
                    onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white col-span-2"
                    rows={3}
                    data-testid="textarea-character-description"
                  />
                </form>
              </div>

              {/* Characters List */}
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-400">Existing Characters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {characters.map((character) => (
                    <div key={character.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img 
                              src={character.avatarUrl || character.imageUrl || "/placeholder.jpg"} 
                              alt={character.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{character.name}</h4>
                            <p className="text-sm text-gray-300">{character.personalityType}</p>
                            <p className="text-xs text-green-400">Level {character.unlockLevel}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => deleteCharacterMutation.mutate(character.id)}
                          disabled={deleteCharacterMutation.isPending}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1"
                          data-testid={`button-delete-character-${character.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          Delete
                        </Button>
                      </div>
                      <p className="text-sm text-gray-400">{character.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6 h-full overflow-y-auto">
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-400">User Management</h3>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white">{user.username}</h4>
                        <div className="text-sm text-gray-300">
                          Level {user.level} • Points: {user.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.isAdmin ? "Admin" : "User"} • ID: {user.id}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1">
                          Edit
                        </Button>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1">
                          Reset
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6 h-full overflow-y-auto">
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-green-400">Media Files</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaFiles.map((file) => (
                    <div key={file.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="aspect-square mb-2 rounded overflow-hidden bg-gray-600">
                        <img 
                          src={file.url} 
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-white font-medium truncate" title={file.filename}>
                        {file.filename}
                      </div>
                      <div className="text-xs text-gray-400">
                        {file.characterId ? `Assigned` : `Unassigned`}
                      </div>
                      <Button className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white text-xs py-1">
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
                {mediaFiles.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📁</div>
                    <div>No media files uploaded</div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 h-full overflow-y-auto">
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Game Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Base Tap Reward</label>
                      <Input 
                        type="number" 
                        defaultValue="10"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Energy Regen Rate</label>
                      <Input 
                        type="number" 
                        defaultValue="1"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Max Energy</label>
                      <Input 
                        type="number" 
                        defaultValue="1000"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Daily Wheel Limit</label>
                      <Input 
                        type="number" 
                        defaultValue="1"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    Save Settings
                  </Button>
                </div>
              </div>

              {/* Database Actions */}
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-red-400">Database Actions</h3>
                <div className="space-y-3">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white w-full">
                    Backup Database
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                    Clear Chat History
                  </Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white w-full">
                    Reset All User Progress
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}