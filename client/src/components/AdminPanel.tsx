import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ImageManager from "./ImageManager";
import CharacterCreation from "./CharacterCreation";
import WheelGame from "./WheelGame";
import type { User, Character, Upgrade, GameStats, MediaFile } from "@shared/schema";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { toast } = useToast();
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showWheelGame, setShowWheelGame] = useState(false);

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto admin-panel">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              🎮 ClassikLust Admin Panel
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid grid-cols-5 w-full bg-black/20">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="characters">Characters</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="admin-card">
                    <CardHeader>
                      <CardTitle className="text-white">👥 Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{users.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="admin-card">
                    <CardHeader>
                      <CardTitle className="text-white">🎭 Characters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{characters.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="admin-card">
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
                    onClick={() => setShowCharacterCreation(true)}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    Create Character
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {characters.map((character) => (
                    <Card key={character.id} className="admin-card character-card">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{character.name}</div>
                          <div className="text-sm text-gray-300">{character.description}</div>
                          <div className="mt-2 flex justify-center space-x-2">
                            <Badge variant="secondary">Lvl {character.unlockLevel}</Badge>
                            <Badge variant="outline" className="text-white">
                              {character.rarity}
                            </Badge>
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
                    <Card key={user.id} className="admin-card">
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
                    <Card key={media.id} className="admin-card">
                      <CardContent className="p-2">
                        <div className="aspect-square bg-gray-700 rounded mb-2"></div>
                        <div className="text-xs text-white truncate">{media.filename}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="admin-card">
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
                  
                  <Card className="admin-card">
                    <CardHeader>
                      <CardTitle className="text-white">⚙️ System Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Input 
                          placeholder="Global multiplier" 
                          className="bg-black/30 border-white/20 text-white" 
                        />
                        <Button className="w-full">Update Settings</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <CharacterCreation 
        isOpen={showCharacterCreation}
        onClose={() => setShowCharacterCreation(false)}
      />
      
      <ImageManager 
        isOpen={showImageManager}
        onClose={() => setShowImageManager(false)}
      />
      
      <WheelGame 
        isOpen={showWheelGame}
        onClose={() => setShowWheelGame(false)}
      />
    </>
  );
}