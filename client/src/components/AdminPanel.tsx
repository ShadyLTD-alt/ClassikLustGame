import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import CharacterCreation from "@/components/CharacterCreation";
import CharacterEditor from "@/components/CharacterEditor";
import ImageManager from "@/components/ImageManager";
import AICustomFunctions from "@/components/AICustomFunctions";
import LayoutEditor from "@/components/LayoutEditor";
import { Edit, Trash2, Bot, Brain } from "lucide-react";
import { Label } from "@/components/ui/label";

import type { User, Character, Upgrade, GameStats, MediaFile } from "@shared/schema";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showCharacterCreation?: boolean;
  setShowCharacterCreation?: (show: boolean) => void;
}

export default function AdminPanel({ isOpen, onClose, showCharacterCreation = false, setShowCharacterCreation }: AdminPanelProps) {
  const [localShowCharacterCreation, setLocalShowCharacterCreation] = useState(false);

  // Use props if provided, otherwise use local state
  const showCharacterCreationState = setShowCharacterCreation ? showCharacterCreation : localShowCharacterCreation;
  const setShowCharacterCreationState = setShowCharacterCreation || setLocalShowCharacterCreation;

  const [selectedTab, setSelectedTab] = useState("characters");
  const [editingCharacter, setEditingCharacter] = useState<any>(null);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showWheelGame, setShowWheelGame] = useState(false);
  const [showAIFunctions, setShowAIFunctions] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [selectedCharacterForAI, setSelectedCharacterForAI] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin data
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

  const { data: upgrades = [] } = useQuery<Upgrade[]>({
    queryKey: ["/api/admin/upgrades"],
    enabled: isOpen,
  });

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: () => fetch('/api/settings').then(res => res.json())
  });

  const handleEditCharacter = (character: any) => {
    setEditingCharacter(character);
    setSelectedTab("character-editor");
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (confirm('Are you sure you want to delete this character?')) {
      try {
        const response = await fetch(`/api/character/${characterId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/admin/characters'] });
          toast({ title: "Success", description: "Character deleted successfully!" });
        } else {
          throw new Error('Failed to delete character');
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto admin-panel bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🎮 ClassikLust Admin Panel
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Manage users, characters, media, and game settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 bg-gray-800/50 border border-purple-500/30">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="characters" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Characters</TabsTrigger>
                <TabsTrigger value="users" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Users</TabsTrigger>
                <TabsTrigger value="media" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Media</TabsTrigger>
                <TabsTrigger value="tools" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Tools</TabsTrigger>
                <TabsTrigger value="layout" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Layout</TabsTrigger>
                <TabsTrigger value="economy" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Economy</TabsTrigger>
                <TabsTrigger value="character-editor" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Edit</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">👥 Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{users.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">🎭 Characters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{characters.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">📁 Media Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{mediaFiles.length}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Characters Tab */}
              <TabsContent value="characters" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Character Management</h3>
                  <Button 
                    onClick={() => setShowCharacterCreationState(true)}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    Create Character
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {characters.map((character: any) => (
                    <Card key={character.id} className="admin-card character-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{character.name}</div>
                          <div className="text-sm text-gray-300">{character.bio || character.description}</div>
                          <div className="mt-2 flex justify-center space-x-2">
                            <Badge variant="secondary">Lvl {character.requiredLevel || character.unlockLevel || 1}</Badge>
                            <Badge variant="outline" className="text-white">
                              {character.personality || 'friendly'}
                            </Badge>
                          </div>
                          <div className="mt-3 flex justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCharacter(character)}
                              className="border-gray-600 text-white hover:bg-white/10"
                              title="Edit Character"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCharacterForAI(character.id);
                                setShowAIFunctions(true);
                              }}
                              className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                              title="AI Custom Functions"
                            >
                              <Bot className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCharacter(character.id)}
                              title="Delete Character"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <h3 className="text-xl font-bold text-white">User Management</h3>
                <div className="space-y-3">
                  {users.map((user) => (
                    <Card key={user.id} className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{user.username}</div>
                          <div className="text-sm text-gray-300">
                            Level {user.level} • {user.points} points
                          </div>
                          {user.isAdmin && (
                            <Badge variant="destructive" className="mt-1">Admin</Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="destructive">Ban</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Media Management</h3>
                  <Button 
                    onClick={() => setShowImageManager(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Open Image Manager
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mediaFiles.map((media) => (
                    <Card key={media.id || media.filename} className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                      <CardContent className="p-2">
                        <img 
                          src={media.path || `/uploads/${media.filename}`} 
                          alt={media.originalName || media.filename} 
                          className="w-full h-auto rounded aspect-square object-cover bg-gray-700 mb-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/api/placeholder-image';
                          }}
                        />
                        <div className="text-xs text-white truncate">{media.originalName || media.filename}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">🎡 Wheel Game</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowWheelGame(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Open Wheel Game
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">🎨 Layout Editor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowLayoutEditor(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        Open Layout Editor
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">⚙️ System Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Input 
                          placeholder="Global multiplier" 
                          className="bg-black/30 border-white/20 text-white" 
                          defaultValue={settings?.globalMultiplier}
                        />
                        <Button className="w-full">Update Settings</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-6">
                <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">🎨 Site Layout & Design</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LayoutEditor onClose={() => {}} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Economy Tab */}
              <TabsContent value="economy" className="space-y-6">
                <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Economy Settings</CardTitle>
                    <CardDescription className="text-white/70">Configure game economy and rewards</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="base-reward">Base Tap Reward</Label>
                      <Input
                        id="base-reward"
                        type="number"
                        defaultValue={1}
                        className="bg-purple-900/50 border-purple-500/50 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Energy System</CardTitle>
                    <CardDescription className="text-white/70">Configure energy regeneration settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="energy-regen-amount">Energy Per Regeneration</Label>
                      <Input
                        id="energy-regen-amount"
                        type="number"
                        defaultValue={3}
                        className="bg-purple-900/50 border-purple-500/50 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="energy-regen-interval">Regeneration Interval (seconds)</Label>
                      <Input
                        id="energy-regen-interval"
                        type="number"
                        defaultValue={5}
                        className="bg-purple-900/50 border-purple-500/50 text-white"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        const regenAmount = parseInt((document.getElementById('energy-regen-amount') as HTMLInputElement)?.value || '3');
                        const intervalSeconds = parseInt((document.getElementById('energy-regen-interval') as HTMLInputElement)?.value || '5');

                        fetch('/api/admin/energy-settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ regenAmount, intervalSeconds })
                        }).then(res => res.json()).then(data => {
                          if (data.success) {
                            queryClient.invalidateQueries({ queryKey: ['/api/settings'] }); // Assuming settings include energy config
                            toast({
                              title: "Success",
                              description: data.message,
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: data.message || "Failed to update energy settings",
                              variant: "destructive",
                            });
                          }
                        }).catch(error => {
                          toast({
                            title: "Error",
                            description: "An unexpected error occurred",
                            variant: "destructive",
                          });
                        });
                      }}
                      className="bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600"
                    >
                      Update Energy Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="character-editor" className="space-y-6">
                {editingCharacter ? (
                  <CharacterEditor 
                    character={editingCharacter}
                    isEditing={true}
                    onSuccess={() => {
                      setEditingCharacter(null);
                      toast({
                        title: "Character Updated",
                        description: "Character has been successfully updated!",
                      });
                    }}
                    onCancel={() => setEditingCharacter(null)}
                  />
                ) : (
                  <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-center">🎭 Character Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-center text-white space-y-4">
                        <p>Configure and manage custom AI functions for your characters.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {characters.slice(0, 4).map((character) => (
                            <Card key={character.id} className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 transition-colors cursor-pointer" 
                                  onClick={() => setEditingCharacter(character)}>
                              <CardContent className="p-4 text-center">
                                <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden">
                                  <img 
                                    src={character.imageUrl || '/api/placeholder-image'} 
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-white font-medium">{character.name}</div>
                                <div className="text-gray-400 text-sm">Level {character.requiredLevel}</div>
                                <Button size="sm" className="mt-2 bg-purple-600 hover:bg-purple-700">
                                  Edit AI Functions
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        {characters.length === 0 && (
                          <p className="text-gray-400">No characters available. Create some characters first.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <Dialog open={showCharacterCreationState} onOpenChange={setShowCharacterCreationState}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary-900 via-dark-900 to-primary-800 text-white border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🎭 Create New Character
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Create and customize a new character for your game.
            </DialogDescription>
          </DialogHeader>
          <CharacterEditor 
            isEditing={false}
            onSuccess={() => setShowCharacterCreationState(false)}
            onCancel={() => setShowCharacterCreationState(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showImageManager} onOpenChange={setShowImageManager}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary-900 via-dark-900 to-primary-800 text-white border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              📷 Image Manager
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Upload, manage and organize your game images and media files.
            </DialogDescription>
          </DialogHeader>
          <ImageManager 
            isOpen={showImageManager} 
            onClose={() => setShowImageManager(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showWheelGame} onOpenChange={setShowWheelGame}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary-900 via-dark-900 to-primary-800 text-white border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🎡 Wheel Game Management
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Configure wheel prizes, spin costs, and reward settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <Card className="admin-card bg-black/20 backdrop-blur-sm border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Wheel Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Prize Settings
                    </label>
                    <Textarea
                      placeholder="Configure wheel prizes (JSON format)"
                      className="bg-black/30 border-white/20 text-white min-h-[120px]"
                      defaultValue={JSON.stringify([
                        { id: 1, name: "100 LP", probability: 30, reward: { type: "points", value: 100 } },
                        { id: 2, name: "50 LP", probability: 40, reward: { type: "points", value: 50 } },
                        { id: 3, name: "Energy Boost", probability: 20, reward: { type: "energy", value: 100 } },
                        { id: 4, name: "Rare Character", probability: 5, reward: { type: "character", value: "rare" } },
                        { id: 5, name: "Jackpot", probability: 5, reward: { type: "points", value: 1000 } }
                      ], null, 2)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Spin Cost
                      </label>
                      <Input
                        type="number"
                        defaultValue="50"
                        className="bg-black/30 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Daily Free Spins
                      </label>
                      <Input
                        type="number"
                        defaultValue="3"
                        className="bg-black/30 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Update Wheel Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAIFunctions} onOpenChange={setShowAIFunctions}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary-900 via-dark-900 to-primary-800 text-white border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🧠 AI Custom Functions for {characters.find(char => char.id === selectedCharacterForAI)?.name || 'Selected Character'}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Configure and manage custom AI functions for your characters.
            </DialogDescription>
          </DialogHeader>
          <AICustomFunctions characterId={selectedCharacterForAI} onClose={() => setShowAIFunctions(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showLayoutEditor} onOpenChange={setShowLayoutEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary-900 via-dark-900 to-primary-800 text-white border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🎨 Site Layout & Design Editor
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Customize the visual appearance and layout of your entire site.
            </DialogDescription>
          </DialogHeader>
          <LayoutEditor onClose={() => setShowLayoutEditor(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}