import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { User, Character, Upgrade } from "@shared/schema";

export default function AdminPanel() {
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  return (
    <div className="p-6 space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Daily Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.dailyActiveUsers || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Total Taps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalTaps?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Characters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalCharacters || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/20">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card className="bg-black/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">{user.username}</div>
                      <div className="text-sm text-gray-400">
                        Level {user.level} • {user.points.toLocaleString()} points
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-400 py-8">
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="characters" className="space-y-4">
          <Card className="bg-black/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Character Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                <p>Character management interface</p>
                <p className="text-sm">Add, edit, and manage game characters</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-black/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Game Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                <p>Game configuration settings</p>
                <p className="text-sm">Energy rates, rewards, and game balance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <Card className="bg-black/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Data Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                <p>Export game data</p>
                <p className="text-sm">Download user data, stats, and game state</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
