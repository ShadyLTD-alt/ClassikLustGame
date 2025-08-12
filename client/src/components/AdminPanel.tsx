import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Gamepad2, Coins } from "lucide-react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Queries
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isOpen,
  });

  const { data: characters = [] } = useQuery({
    queryKey: ["/api/admin/characters"],
    enabled: isOpen,
  });

  // Future: Add mutations for wheel management

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            ⚡ Admin Panel
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-purple-600">Users</TabsTrigger>
            <TabsTrigger value="characters" className="text-white data-[state=active]:bg-green-600">Characters</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-400/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-200">{users.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-400/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Gamepad2 className="w-5 h-5" />
                    Characters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-200">{characters.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-400/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Coins className="w-5 h-5" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-green-200">Online</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="space-y-4">
              {users.map((user: any) => (
                <Card key={user.id} className="bg-slate-800/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{user.username}</h3>
                        <p className="text-slate-400">Level {user.level} • {user.points} points</p>
                      </div>
                      <div className="flex gap-2">
                        {user.isAdmin && <Badge className="bg-red-500">Admin</Badge>}
                        <Badge className="bg-blue-500">Energy: {user.energy}/{user.maxEnergy}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="characters" className="space-y-4">
            <div className="space-y-4">
              {characters.map((character: any) => (
                <Card key={character.id} className="bg-slate-800/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{character.name}</h3>
                        <p className="text-slate-400">{character.personality} • Level {character.requiredLevel}</p>
                        <p className="text-slate-500 text-sm">{character.bio}</p>
                      </div>
                      <div className="flex gap-2">
                        {character.isNsfw && <Badge className="bg-red-500">NSFW</Badge>}
                        {character.isVip && <Badge className="bg-yellow-500">VIP</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>


        </Tabs>
      </DialogContent>
    </Dialog>
  );
}