
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import CharacterCreation from "@/components/CharacterCreation";
import CharacterEditor from "@/components/CharacterEditor";
import ImageManager from "@/components/ImageManager";
import AICustomFunctions from "@/components/AICustomFunctions";
import LayoutEditor from "@/components/LayoutEditor";
import { 
  Edit3, 
  Trash2, 
  Plus, 
  Users, 
  Gamepad2, 
  Settings, 
  Database, 
  BarChart3,
  DollarSign,
  Zap,
  Gift,
  MessageCircle,
  Image,
  Layers,
  Monitor,
  Edit,
  Bot,
  Brain
} from "lucide-react";

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

  const [activeTab, setActiveTab] = useState("overview");
  const [editingCharacter, setEditingCharacter] = useState<any>(null);
  const [editingUpgrade, setEditingUpgrade] = useState<any>(null);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showWheelGame, setShowWheelGame] = useState(false);
  const [showAIFunctions, setShowAIFunctions] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [selectedCharacterForAI, setSelectedCharacterForAI] = useState<string>("");
  const [newTriggerWord, setNewTriggerWord] = useState("");
  const [triggerResponse, setTriggerResponse] = useState("");
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
    enabled: isOpen,
  });

  const { data: wheelPrizes = [] } = useQuery({
    queryKey: ["/api/admin/wheel-prizes"],
    enabled: isOpen,
  });

  // Overview stats
  const stats = {
    totalUsers: users.length,
    totalCharacters: characters.length,
    totalUpgrades: upgrades.length,
    activeWheelPrizes: wheelPrizes.length
  };

  // Update upgrade mutation
  const updateUpgradeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/admin/upgrades/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/upgrades"] });
      setEditingUpgrade(null);
      toast({ title: "Upgrade updated successfully" });
    },
  });

  // Delete upgrade mutation
  const deleteUpgradeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/upgrades/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/upgrades"] });
      toast({ title: "Upgrade deleted successfully" });
    },
  });

  // Create wheel prize mutation
  const createWheelPrizeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/wheel-prizes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wheel-prizes"] });
      toast({ title: "Wheel prize created successfully" });
    },
  });

  // Save trigger word mutation
  const saveTriggerWordMutation = useMutation({
    mutationFn: async (data: { word: string; response: string; characterId?: string }) => {
      const response = await apiRequest("POST", "/api/admin/trigger-words", data);
      return response.json();
    },
    onSuccess: () => {
      setNewTriggerWord("");
      setTriggerResponse("");
      toast({ title: "Trigger word saved successfully" });
    },
  });

  const handleEditCharacter = (character: any) => {
    setEditingCharacter(character);
    setActiveTab("character-editor");
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
        <DialogContent className="max-w-7xl h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700">
          <DialogHeader className="border-b border-slate-700 pb-4">
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎮 ClassikLust Admin Panel
            </DialogTitle>
            <DialogDescription className="text-center text-slate-300">
              Comprehensive management system for users, characters, economy, and game settings
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-7 bg-slate-800 border-slate-700">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="characters" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
                <Gamepad2 className="w-4 h-4" />
                Characters
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-green-600">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2 data-[state=active]:bg-orange-600">
                <Image className="w-4 h-4" />
                Media
              </TabsTrigger>
              <TabsTrigger value="economy" className="flex items-center gap-2 data-[state=active]:bg-yellow-600">
                <DollarSign className="w-4 h-4" />
                Economy
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-pink-600">
                <MessageCircle className="w-4 h-4" />
                Chat & AI
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-red-600">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="character-editor" className="flex items-center gap-2 data-[state=active]:bg-indigo-600">
                <Edit className="w-4 h-4" />
                Editor
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-blue-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-200 text-sm font-medium">Total Users</p>
                          <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Characters</p>
                          <p className="text-3xl font-bold text-white">{stats.totalCharacters}</p>
                        </div>
                        <Gamepad2 className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border-yellow-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-200 text-sm font-medium">Upgrades</p>
                          <p className="text-3xl font-bold text-white">{stats.totalUpgrades}</p>
                        </div>
                        <Zap className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-600/20 to-green-700/20 border-green-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-200 text-sm font-medium">Media Files</p>
                          <p className="text-3xl font-bold text-white">{Array.isArray(mediaFiles) ? mediaFiles.length : 0}</p>
                        </div>
                        <Gift className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Database</span>
                        <Badge className="bg-green-600 text-white">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Energy System</span>
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Wheel Game</span>
                        <Badge className="bg-green-600 text-white">Operational</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Characters Tab */}
              <TabsContent value="characters" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Character Management</h3>
                  <Button 
                    onClick={() => setShowCharacterCreationState(true)}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Character
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {characters.map((character: any) => (
                    <Card key={character.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden">
                            <img 
                              src={character.imageUrl || '/api/placeholder-image'} 
                              alt={character.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
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
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Management
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Monitor and manage user accounts, levels, and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{user.username}</p>
                              <p className="text-sm text-slate-300">
                                Level {user.level} • {user.points?.toLocaleString()} LP • {user.energy}/4500 Energy
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.isAdmin && <Badge className="bg-red-600">Admin</Badge>}
                            {user.isVip && <Badge className="bg-yellow-600">VIP</Badge>}
                            <Button size="sm" variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-600">
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Media Management</h3>
                  <Button 
                    onClick={() => setShowImageManager(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Open Image Manager
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.isArray(mediaFiles) && mediaFiles.map((media) => (
                    <Card key={media.id || media.filename} className="bg-slate-800/50 border-slate-700">
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

              {/* Economy Tab */}
              <TabsContent value="economy" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upgrades Management */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Upgrade Management
                          </CardTitle>
                          <CardDescription className="text-slate-300">
                            Configure upgrade costs, bonuses, and requirements
                          </CardDescription>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Upgrade
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {upgrades.map((upgrade) => (
                            <div key={upgrade.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-white">{upgrade.name}</h3>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingUpgrade(upgrade)}
                                    className="border-slate-500 text-slate-300 hover:bg-slate-600"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => deleteUpgradeMutation.mutate(upgrade.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                                <p>Cost: <span className="text-yellow-400">{upgrade.cost} LP</span></p>
                                <p>Level: <span className="text-blue-400">{upgrade.level}/{upgrade.maxLevel}</span></p>
                                <p>Tap Bonus: <span className="text-green-400">+{upgrade.tapBonus}</span></p>
                                <p>Hourly: <span className="text-purple-400">+{upgrade.hourlyBonus}</span></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Energy Settings */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Energy System</CardTitle>
                      <CardDescription className="text-slate-300">Configure energy regeneration settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="energy-regen-amount">Energy Per Regeneration</Label>
                        <Input
                          id="energy-regen-amount"
                          type="number"
                          defaultValue={3}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="energy-regen-interval">Regeneration Interval (seconds)</Label>
                        <Input
                          id="energy-regen-interval"
                          type="number"
                          defaultValue={5}
                          className="bg-slate-700 border-slate-600 text-white"
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
                              queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
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
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        Update Energy Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Chat & AI Tab */}
              <TabsContent value="chat" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Trigger Word Management
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Configure custom trigger words and responses for AI characters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-slate-300">Trigger Word</Label>
                          <Input 
                            value={newTriggerWord}
                            onChange={(e) => setNewTriggerWord(e.target.value)}
                            placeholder="Enter trigger word..." 
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Response</Label>
                          <Textarea 
                            value={triggerResponse}
                            onChange={(e) => setTriggerResponse(e.target.value)}
                            placeholder="Enter response..." 
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <Button 
                          onClick={() => saveTriggerWordMutation.mutate({ 
                            word: newTriggerWord, 
                            response: triggerResponse 
                          })}
                          disabled={!newTriggerWord || !triggerResponse}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Save Trigger Word
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Global Chat Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <Label className="text-slate-300">Enable Auto Responses</Label>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <Label className="text-slate-300">Save Conversation Snippets</Label>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <Label className="text-slate-300">Dynamic Mood System</Label>
                            <Switch />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Game Economy Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-slate-300">Global Point Multiplier</Label>
                        <Input 
                          type="number" 
                          placeholder="1.0" 
                          className="bg-slate-700 border-slate-600 text-white"
                          defaultValue={settings?.globalMultiplier || 1}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-300">Energy Regeneration Rate</Label>
                        <Input 
                          type="number" 
                          placeholder="3" 
                          className="bg-slate-700 border-slate-600 text-white"
                          defaultValue={settings?.energyRegenRate || 3}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-300">Max Energy</Label>
                        <Input 
                          type="number" 
                          placeholder="4500" 
                          className="bg-slate-700 border-slate-600 text-white"
                          defaultValue={settings?.maxEnergy || 4500}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">UI & Display Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <Label className="text-slate-300">Dark Mode</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <Label className="text-slate-300">NSFW Content</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <Label className="text-slate-300">Floating Animations</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <Label className="text-slate-300">Sound Effects</Label>
                        <Switch />
                      </div>
                      <div className="mt-4">
                        <Button 
                          onClick={() => setShowLayoutEditor(true)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Layers className="w-4 h-4 mr-2" />
                          Open Layout Editor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-center">🎭 Character Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-center text-white space-y-4">
                        <p>Select a character to edit from the Characters tab, or create a new one.</p>
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
                                  Edit Character
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
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <Dialog open={showCharacterCreationState} onOpenChange={setShowCharacterCreationState}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🎭 Create New Character
            </DialogTitle>
            <DialogDescription className="text-slate-300">
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              📷 Image Manager
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Upload, manage and organize your game images and media files.
            </DialogDescription>
          </DialogHeader>
          <ImageManager 
            isOpen={showImageManager} 
            onClose={() => setShowImageManager(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAIFunctions} onOpenChange={setShowAIFunctions}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🧠 AI Custom Functions for {characters.find(char => char.id === selectedCharacterForAI)?.name || 'Selected Character'}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Configure and manage custom AI functions for your characters.
            </DialogDescription>
          </DialogHeader>
          <AICustomFunctions characterId={selectedCharacterForAI} onClose={() => setShowAIFunctions(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showLayoutEditor} onOpenChange={setShowLayoutEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🎨 Site Layout & Design Editor
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Customize the visual appearance and layout of your entire site.
            </DialogDescription>
          </DialogHeader>
          <LayoutEditor onClose={() => setShowLayoutEditor(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
