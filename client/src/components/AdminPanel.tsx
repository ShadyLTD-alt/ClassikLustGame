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
import MistralDebugger from "@/components/MistralDebugger";
import MistralControls from "@/components/MistralControls";
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
  Brain,
  X,
  Sparkles
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
  const [showMistralDebugger, setShowMistralDebugger] = useState(false);
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
        <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900/95 to-indigo-900/95 backdrop-blur-lg text-white border-0 shadow-2xl overflow-hidden">
          <DialogHeader className="border-b border-white/10 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  🎮 ClassikLust Admin Panel
                </DialogTitle>
                <DialogDescription className="text-slate-300 mt-1">
                  Manage users, characters, media, and game settings
                </DialogDescription>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-white/70 hover:bg-white/10 p-2 h-auto"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 backdrop-blur border border-white/10 flex-shrink-0">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600/80 data-[state=active]:text-white text-xs">
                <BarChart3 className="w-4 h-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="characters" className="data-[state=active]:bg-purple-600/80 data-[state=active]:text-white text-xs">
                <Gamepad2 className="w-4 h-4 mr-1" />
                Characters
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-green-600/80 data-[state=active]:text-white text-xs">
                <Users className="w-4 h-4 mr-1" />
                Users
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-orange-600/80 data-[state=active]:text-white text-xs">
                <Image className="w-4 h-4 mr-1" />
                Media
              </TabsTrigger>
              <TabsTrigger value="economy" className="data-[state=active]:bg-yellow-600/80 data-[state=active]:text-white text-xs">
                <DollarSign className="w-4 h-4 mr-1" />
                Economy
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-red-600/80 data-[state=active]:text-white text-xs">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-400/30 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-200 text-sm font-medium">Total Users</p>
                          <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-400/30 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Characters</p>
                          <p className="text-3xl font-bold text-white">{stats.totalCharacters}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Gamepad2 className="w-6 h-6 text-purple-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border-yellow-400/30 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-200 text-sm font-medium">Upgrades</p>
                          <p className="text-3xl font-bold text-white">{stats.totalUpgrades}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-yellow-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-400/30 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-200 text-sm font-medium">Media Files</p>
                          <p className="text-3xl font-bold text-white">{Array.isArray(mediaFiles) ? mediaFiles.length : 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Image className="w-6 h-6 text-green-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/40 backdrop-blur border-slate-600/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/20">
                        <span className="text-slate-300">Database</span>
                        <Badge className="bg-green-600/80 text-white border-green-500/50">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/20">
                        <span className="text-slate-300">Energy System</span>
                        <Badge className="bg-green-600/80 text-white border-green-500/50">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/20">
                        <span className="text-slate-300">Wheel Game</span>
                        <Badge className="bg-green-600/80 text-white border-green-500/50">Operational</Badge>
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
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Character
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {characters.map((character: any) => (
                    <Card key={character.id} className="bg-slate-800/40 backdrop-blur border-slate-600/30 hover:border-purple-400/50 transition-all">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-purple-400/30">
                            <img 
                              src={character.imageUrl || '/api/placeholder-image'} 
                              alt={character.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-base font-bold text-white mb-2 truncate">{character.name}</div>
                          <div className="text-xs text-slate-300 mb-3 line-clamp-2">{character.bio || character.description}</div>
                          <div className="flex justify-center gap-1 mb-3 flex-wrap">
                            <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                              Lvl {character.requiredLevel || character.unlockLevel || 1}
                            </Badge>
                            <Badge variant="outline" className="border-purple-400/50 text-purple-300 text-xs">
                              {character.personality || 'friendly'}
                            </Badge>
                          </div>
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCharacter(character)}
                              className="border-slate-500/50 text-slate-300 hover:bg-slate-600/50 p-2"
                              title="Edit Character"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCharacterForAI(character.id);
                                setShowAIFunctions(true);
                              }}
                              className="border-blue-500/50 text-blue-300 hover:bg-blue-600/20 p-2"
                              title="AI Functions"
                            >
                              <Bot className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCharacter(character.id)}
                              className="bg-red-600/20 border-red-500/50 hover:bg-red-600/40 p-2"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
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
                <Card className="bg-slate-800/40 backdrop-blur border-slate-600/30">
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
                        <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg border border-slate-600/30 hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
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
                            {user.isAdmin && <Badge className="bg-red-600/80 border-red-500/50">Admin</Badge>}
                            {user.isVip && <Badge className="bg-yellow-600/80 border-yellow-500/50">VIP</Badge>}
                            <Button size="sm" variant="outline" className="border-slate-500/50 text-slate-300 hover:bg-slate-600/50">
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
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Open Image Manager
                  </Button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {Array.isArray(mediaFiles) && mediaFiles.map((media, index) => (
                    <Card key={media.id || media.filename || index} className="bg-slate-800/40 backdrop-blur border-slate-600/30">
                      <CardContent className="p-2">
                        <img 
                          src={media.path || `/uploads/${media.filename}`} 
                          alt={media.originalName || media.filename} 
                          className="w-full h-20 rounded object-cover bg-slate-700/30 mb-2"
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
              <TabsContent value="economy" className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Upgrades Management */}
                  <Card className="bg-slate-800/40 backdrop-blur border-slate-600/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Upgrade Management
                          </CardTitle>
                          <CardDescription className="text-slate-300">
                            Configure upgrade costs and bonuses
                          </CardDescription>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Upgrade
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {upgrades.map((upgrade) => (
                            <div key={upgrade.id} className="p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-white">{upgrade.name}</h3>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingUpgrade(upgrade)}
                                    className="border-slate-500/50 text-slate-300 hover:bg-slate-600/50"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => deleteUpgradeMutation.mutate(upgrade.id)}
                                    className="bg-red-600/20 border-red-500/50 hover:bg-red-600/40"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                                <p>Cost: <span className="text-yellow-300">{upgrade.cost} LP</span></p>
                                <p>Level: <span className="text-blue-300">{upgrade.level}/{upgrade.maxLevel}</span></p>
                                <p>Tap Bonus: <span className="text-green-300">+{upgrade.tapBonus}</span></p>
                                <p>Hourly: <span className="text-purple-300">+{upgrade.hourlyBonus}</span></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Energy Settings */}
                  <Card className="bg-slate-800/40 backdrop-blur border-slate-600/30">
                    <CardHeader>
                      <CardTitle className="text-white">Energy System</CardTitle>
                      <CardDescription className="text-slate-300">Configure energy regeneration settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="energy-regen-amount" className="text-slate-300">Energy Per Regeneration</Label>
                        <Input
                          id="energy-regen-amount"
                          type="number"
                          defaultValue={3}
                          className="bg-slate-700/30 border-slate-600/50 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="energy-regen-interval" className="text-slate-300">Regeneration Interval (seconds)</Label>
                        <Input
                          id="energy-regen-interval"
                          type="number"
                          defaultValue={5}
                          className="bg-slate-700/30 border-slate-600/50 text-white mt-2"
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
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
                      >
                        Update Energy Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* MistralAI Settings */}
                  <Card className="bg-slate-800/40 backdrop-blur border-slate-600/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        MistralAI Integration
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Configure AI debugging and chat assistance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MistralControls />
                    </CardContent>
                  </Card>

                  {/* Trigger Words */}
                  <Card className="bg-slate-800/40 backdrop-blur border-slate-600/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Trigger Word Management
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Configure custom trigger words and responses for AI characters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Trigger Word</Label>
                        <Input 
                          value={newTriggerWord}
                          onChange={(e) => setNewTriggerWord(e.target.value)}
                          placeholder="Enter trigger word..." 
                          className="bg-slate-700/30 border-slate-600/50 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Response</Label>
                        <Textarea 
                          value={triggerResponse}
                          onChange={(e) => setTriggerResponse(e.target.value)}
                          placeholder="Enter response..." 
                          className="bg-slate-700/30 border-slate-600/50 text-white mt-2"
                        />
                      </div>
                      <Button 
                        onClick={() => saveTriggerWordMutation.mutate({ 
                          word: newTriggerWord, 
                          response: triggerResponse 
                        })}
                        disabled={!newTriggerWord || !triggerResponse}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                      >
                        Save Trigger Word
                      </Button>
                    </CardContent>
                  </Card>

                  {/* UI Settings */}
                  <Card className="bg-slate-800/40 backdrop-blur border-slate-600/30">
                    <CardHeader>
                      <CardTitle className="text-white">UI & Display Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg border border-slate-600/30">
                        <Label className="text-slate-300">Dark Mode</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg border border-slate-600/30">
                        <Label className="text-slate-300">NSFW Content</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg border border-slate-600/30">
                        <Label className="text-slate-300">Floating Animations</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg border border-slate-600/30">
                        <Label className="text-slate-300">Sound Effects</Label>
                        <Switch />
                      </div>
                      <div className="mt-4">
                        <div className="space-y-2">
                          <Button 
                            onClick={() => setShowLayoutEditor(true)}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0"
                          >
                            <Layers className="w-4 h-4 mr-2" />
                            Open Layout Editor
                          </Button>
                          <Button 
                            onClick={() => setShowMistralDebugger(true)}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 border-0"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Debug Assistant
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </ScrollArea>
            </div>
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

      <MistralDebugger 
        isOpen={showMistralDebugger} 
        onClose={() => setShowMistralDebugger(false)} 
      />
    </>
  );
}