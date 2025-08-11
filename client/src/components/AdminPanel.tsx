import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Character, User, MediaFile } from "@shared/schema";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function AdminPanel({ isOpen, onClose, userId }: AdminPanelProps) {
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    imageUrl: "",
    avatarUrl: "",
    personalityStyle: "friendly",
    moodDistribution: { happy: 70, sad: 10, excited: 15, calm: 5 },
    responseTimeMs: 2000
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
    mutationFn: async (characterData: any) => {
      const response = await apiRequest("POST", "/api/admin/characters", characterData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/characters"] });
      setNewCharacter({
        name: "",
        description: "",
        imageUrl: "",
        avatarUrl: "",
        personalityStyle: "friendly",
        moodDistribution: { happy: 70, sad: 10, excited: 15, calm: 5 },
        responseTimeMs: 2000
      });
      toast({
        title: "Character Created!",
        description: "New character has been added successfully.",
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

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      toast({
        title: "Media Uploaded!",
        description: "Media file has been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);
    formData.append("fileType", file.type);

    uploadMediaMutation.mutate(formData);
  };

  const handleCreateCharacter = () => {
    if (!newCharacter.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Character name is required",
        variant: "destructive",
      });
      return;
    }
    
    createCharacterMutation.mutate(newCharacter);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-800 to-black text-white border-none max-w-4xl p-0 rounded-3xl overflow-hidden h-[80vh] flex flex-col">
        <DialogTitle className="sr-only">Admin Panel</DialogTitle>
        
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">🛠️ Admin Panel</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/20 p-1 h-8 w-8 rounded-full"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="characters" className="w-full h-full flex flex-col">
            <TabsList className="mx-6 bg-black/20">
              <TabsTrigger value="characters">Characters & AI</TabsTrigger>
              <TabsTrigger value="media">Image Management</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="auth">Telegram Auth</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Characters & AI Tab */}
              <TabsContent value="characters" className="space-y-6">
                {/* Create New Character */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Create New Character</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Character Name</label>
                      <Input
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                        placeholder="Enter character name"
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-character-name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Personality Style</label>
                      <select
                        value={newCharacter.personalityStyle}
                        onChange={(e) => setNewCharacter({...newCharacter, personalityStyle: e.target.value})}
                        className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
                        data-testid="select-personality-style"
                      >
                        <option value="friendly">Friendly</option>
                        <option value="flirty">Flirty</option>
                        <option value="mysterious">Mysterious</option>
                        <option value="playful">Playful</option>
                        <option value="serious">Serious</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Image URL</label>
                      <Input
                        value={newCharacter.imageUrl}
                        onChange={(e) => setNewCharacter({...newCharacter, imageUrl: e.target.value})}
                        placeholder="Character image URL"
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-image-url"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Avatar URL</label>
                      <Input
                        value={newCharacter.avatarUrl}
                        onChange={(e) => setNewCharacter({...newCharacter, avatarUrl: e.target.value})}
                        placeholder="Avatar for chat"
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-avatar-url"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={newCharacter.description}
                        onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
                        placeholder="Character description and personality"
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={3}
                        data-testid="textarea-character-description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Response Time (ms)</label>
                      <Input
                        type="number"
                        value={newCharacter.responseTimeMs}
                        onChange={(e) => setNewCharacter({...newCharacter, responseTimeMs: parseInt(e.target.value) || 2000})}
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-response-time"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateCharacter}
                    disabled={createCharacterMutation.isPending}
                    className="mt-4 bg-green-600 hover:bg-green-700"
                    data-testid="button-create-character"
                  >
                    {createCharacterMutation.isPending ? "Creating..." : "Create Character"}
                  </Button>
                </div>

                {/* Existing Characters */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Existing Characters ({characters.length})</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {characters.map((character) => (
                      <div key={character.id} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                            <img 
                              src={character.avatarUrl || character.imageUrl} 
                              alt={character.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{character.name}</h4>
                            <p className="text-sm text-white/70 mb-2">{character.description}</p>
                            
                            <div className="flex items-center space-x-4 text-xs">
                              <span className="bg-purple-600 px-2 py-1 rounded">
                                {character.personalityStyle}
                              </span>
                              <span className="text-white/50">
                                Level {character.level || 1}
                              </span>
                              <span className="text-green-400">
                                {character.responseTimeMs}ms
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Media Management Tab */}
              <TabsContent value="media" className="space-y-6">
                {/* Upload Section */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">📸 Image Upload</h3>
                  
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      data-testid="input-file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-4xl mb-2">📁</div>
                      <div className="text-lg font-medium">Upload Character Images</div>
                      <div className="text-sm text-white/70">Drag and drop or click to select</div>
                    </label>
                  </div>
                </div>

                {/* Media Gallery */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Media Gallery ({mediaFiles.length} files)</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaFiles.map((media) => (
                      <div key={media.id} className="bg-gray-700/50 rounded-lg overflow-hidden">
                        <div className="aspect-square">
                          <img 
                            src={media.url} 
                            alt={media.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <div className="text-sm font-medium truncate">{media.filename}</div>
                          <div className="text-xs text-white/50">{media.fileType}</div>
                          {media.characterId && (
                            <div className="text-xs text-green-400 mt-1">
                              Assigned to character
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">User Management ({users.length} users)</h3>
                  
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-white/70">
                            Level {user.level} • {user.points} points
                          </div>
                          <div className="text-xs text-white/50">
                            {user.isAdmin && <span className="text-red-400">Admin</span>}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View Profile</Button>
                          <Button size="sm" variant="destructive">Ban User</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Telegram Auth Tab */}
              <TabsContent value="auth" className="space-y-6">
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">🔐 Telegram Authentication</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bot Token</label>
                      <Input
                        type="password"
                        placeholder="Enter Telegram Bot Token"
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-telegram-token"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Webhook URL</label>
                      <Input
                        placeholder="https://your-domain.com/api/telegram/webhook"
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-webhook-url"
                      />
                    </div>

                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Setup Instructions:</h4>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        <li>Create a bot with @BotFather on Telegram</li>
                        <li>Get your bot token and paste it above</li>
                        <li>Set the webhook URL for your deployment</li>
                        <li>Users can authenticate via Telegram login</li>
                      </ol>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Configure Telegram Auth
                    </Button>
                  </div>
                </div>

                {/* GetStream AI Section */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">🤖 GetStream AI Integration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">API Key</label>
                      <Input
                        type="password"
                        placeholder="Enter GetStream API Key"
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-getstream-key"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">App ID</label>
                      <Input
                        placeholder="Enter GetStream App ID"
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-getstream-app-id"
                      />
                    </div>

                    <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                      <h4 className="font-medium mb-2">AI Chat Features:</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Real-time AI character responses</li>
                        <li>Personality-based conversation styles</li>
                        <li>Advanced moderation and safety</li>
                        <li>Message history and analytics</li>
                      </ul>
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Enable GetStream AI
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}