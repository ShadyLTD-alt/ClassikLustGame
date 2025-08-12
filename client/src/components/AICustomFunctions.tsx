import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Brain, 
  MessageCircle, 
  Settings, 
  Zap, 
  Plus, 
  Trash2, 
  Save,
  Wand2,
  Sparkles,
  MessageSquare,
  Clock,
  Heart,
  Volume2
} from "lucide-react";

interface AICustomFunctionsProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
}

interface AISettings {
  id: string;
  characterId: string;
  responseStyle: string;
  creativity: number;
  empathy: number;
  humor: number;
  intelligence: number;
  flirtiness: number;
  randomness: number;
  messageLength: 'short' | 'medium' | 'long';
  useEmojis: boolean;
  contextMemory: number;
  personalityTraits: string[];
  customPrompts: CustomPrompt[];
  voiceSettings: VoiceSettings;
  adaptiveResponses: boolean;
  learningMode: boolean;
}

interface CustomPrompt {
  id: string;
  trigger: string;
  response: string;
  mood: string;
  priority: number;
  enabled: boolean;
}

interface VoiceSettings {
  enabled: boolean;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
}

export default function AICustomFunctions({ isOpen, onClose, characterId }: AICustomFunctionsProps) {
  const [activeTab, setActiveTab] = useState("personality");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Default AI settings
  const [aiSettings, setAiSettings] = useState<AISettings>({
    id: `ai-${characterId}`,
    characterId,
    responseStyle: "conversational",
    creativity: 70,
    empathy: 80,
    humor: 60,
    intelligence: 75,
    flirtiness: 40,
    randomness: 50,
    messageLength: "medium",
    useEmojis: true,
    contextMemory: 10,
    personalityTraits: [],
    customPrompts: [],
    voiceSettings: {
      enabled: false,
      voice: "female-1",
      speed: 1.0,
      pitch: 1.0,
      volume: 0.8
    },
    adaptiveResponses: true,
    learningMode: false
  });

  const [newTrait, setNewTrait] = useState("");
  const [newPrompt, setNewPrompt] = useState<Partial<CustomPrompt>>({
    trigger: "",
    response: "",
    mood: "neutral",
    priority: 5,
    enabled: true
  });

  // Save AI settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: AISettings) => {
      const response = await fetch(`/api/character/${characterId}/ai-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to save AI settings');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "AI settings saved successfully!" });
      queryClient.invalidateQueries({ queryKey: [`/api/character/${characterId}/ai-settings`] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save AI settings", variant: "destructive" });
    }
  });

  const addPersonalityTrait = () => {
    if (newTrait.trim() && !aiSettings.personalityTraits.includes(newTrait.trim())) {
      setAiSettings(prev => ({
        ...prev,
        personalityTraits: [...prev.personalityTraits, newTrait.trim()]
      }));
      setNewTrait("");
    }
  };

  const removeTrait = (trait: string) => {
    setAiSettings(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.filter(t => t !== trait)
    }));
  };

  const addCustomPrompt = () => {
    if (newPrompt.trigger && newPrompt.response) {
      const prompt: CustomPrompt = {
        id: `prompt-${Date.now()}`,
        trigger: newPrompt.trigger,
        response: newPrompt.response,
        mood: newPrompt.mood || "neutral",
        priority: newPrompt.priority || 5,
        enabled: true
      };
      
      setAiSettings(prev => ({
        ...prev,
        customPrompts: [...prev.customPrompts, prompt]
      }));
      
      setNewPrompt({ trigger: "", response: "", mood: "neutral", priority: 5, enabled: true });
    }
  };

  const removePrompt = (promptId: string) => {
    setAiSettings(prev => ({
      ...prev,
      customPrompts: prev.customPrompts.filter(p => p.id !== promptId)
    }));
  };

  const updateSetting = (key: keyof AISettings, value: any) => {
    setAiSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateVoiceSetting = (key: keyof VoiceSettings, value: any) => {
    setAiSettings(prev => ({
      ...prev,
      voiceSettings: { ...prev.voiceSettings, [key]: value }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-pink-900/95 text-white border-purple-500/50 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Bot className="w-6 h-6" />
            AI Custom Functions
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid grid-cols-4 w-full bg-black/30">
            <TabsTrigger value="personality" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Personality
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Responses
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-4">
              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Personality Sliders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'creativity', label: 'Creativity', icon: Wand2 },
                    { key: 'empathy', label: 'Empathy', icon: Heart },
                    { key: 'humor', label: 'Humor', icon: Sparkles },
                    { key: 'intelligence', label: 'Intelligence', icon: Brain },
                    { key: 'flirtiness', label: 'Flirtiness', icon: MessageSquare },
                    { key: 'randomness', label: 'Randomness', icon: Zap }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {label}
                        </Label>
                        <span className="text-sm text-purple-300">{aiSettings[key as keyof AISettings] as number}%</span>
                      </div>
                      <Slider
                        value={[aiSettings[key as keyof AISettings] as number]}
                        onValueChange={(value) => updateSetting(key as keyof AISettings, value[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle>Personality Traits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add personality trait..."
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPersonalityTrait()}
                      className="bg-black/30 border-white/20"
                    />
                    <Button onClick={addPersonalityTrait}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiSettings.personalityTraits.map((trait, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {trait}
                        <button onClick={() => removeTrait(trait)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Responses Tab */}
            <TabsContent value="responses" className="space-y-4">
              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle>Response Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Response Style</Label>
                      <Select value={aiSettings.responseStyle} onValueChange={(value) => updateSetting('responseStyle', value)}>
                        <SelectTrigger className="bg-black/30 border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="playful">Playful</SelectItem>
                          <SelectItem value="romantic">Romantic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Message Length</Label>
                      <Select value={aiSettings.messageLength} onValueChange={(value) => updateSetting('messageLength', value)}>
                        <SelectTrigger className="bg-black/30 border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                          <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
                          <SelectItem value="long">Long (4+ sentences)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Context Memory (messages)</Label>
                    <Slider
                      value={[aiSettings.contextMemory]}
                      onValueChange={(value) => updateSetting('contextMemory', value[0])}
                      max={50}
                      min={1}
                      step={1}
                    />
                    <p className="text-sm text-gray-400">Remember last {aiSettings.contextMemory} messages</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Use Emojis</Label>
                    <Switch
                      checked={aiSettings.useEmojis}
                      onCheckedChange={(checked) => updateSetting('useEmojis', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle>Custom Prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      placeholder="Trigger word..."
                      value={newPrompt.trigger || ""}
                      onChange={(e) => setNewPrompt(prev => ({ ...prev, trigger: e.target.value }))}
                      className="col-span-3 bg-black/30 border-white/20"
                    />
                    <Textarea
                      placeholder="AI response..."
                      value={newPrompt.response || ""}
                      onChange={(e) => setNewPrompt(prev => ({ ...prev, response: e.target.value }))}
                      className="col-span-6 bg-black/30 border-white/20"
                      rows={1}
                    />
                    <Select value={newPrompt.mood || "neutral"} onValueChange={(value) => setNewPrompt(prev => ({ ...prev, mood: value }))}>
                      <SelectTrigger className="col-span-2 bg-black/30 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="flirty">Flirty</SelectItem>
                        <SelectItem value="shy">Shy</SelectItem>
                        <SelectItem value="excited">Excited</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addCustomPrompt} className="col-span-1">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {aiSettings.customPrompts.map((prompt) => (
                      <div key={prompt.id} className="flex items-center justify-between p-3 border border-white/20 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{prompt.trigger}</Badge>
                            <span className="text-sm">→</span>
                            <span className="text-sm truncate">{prompt.response}</span>
                            <Badge variant="secondary">{prompt.mood}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removePrompt(prompt.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Tab */}
            <TabsContent value="voice" className="space-y-4">
              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Voice Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Voice Responses</Label>
                    <Switch
                      checked={aiSettings.voiceSettings.enabled}
                      onCheckedChange={(checked) => updateVoiceSetting('enabled', checked)}
                    />
                  </div>

                  {aiSettings.voiceSettings.enabled && (
                    <>
                      <div>
                        <Label>Voice Type</Label>
                        <Select value={aiSettings.voiceSettings.voice} onValueChange={(value) => updateVoiceSetting('voice', value)}>
                          <SelectTrigger className="bg-black/30 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female-1">Female Voice 1</SelectItem>
                            <SelectItem value="female-2">Female Voice 2</SelectItem>
                            <SelectItem value="male-1">Male Voice 1</SelectItem>
                            <SelectItem value="male-2">Male Voice 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Speech Speed: {aiSettings.voiceSettings.speed}x</Label>
                          <Slider
                            value={[aiSettings.voiceSettings.speed]}
                            onValueChange={(value) => updateVoiceSetting('speed', value[0])}
                            max={2}
                            min={0.5}
                            step={0.1}
                          />
                        </div>

                        <div>
                          <Label>Pitch: {aiSettings.voiceSettings.pitch}x</Label>
                          <Slider
                            value={[aiSettings.voiceSettings.pitch]}
                            onValueChange={(value) => updateVoiceSetting('pitch', value[0])}
                            max={2}
                            min={0.5}
                            step={0.1}
                          />
                        </div>

                        <div>
                          <Label>Volume: {Math.round(aiSettings.voiceSettings.volume * 100)}%</Label>
                          <Slider
                            value={[aiSettings.voiceSettings.volume]}
                            onValueChange={(value) => updateVoiceSetting('volume', value[0])}
                            max={1}
                            min={0}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle>Advanced AI Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Adaptive Responses</Label>
                      <p className="text-sm text-gray-400">AI learns from conversation patterns</p>
                    </div>
                    <Switch
                      checked={aiSettings.adaptiveResponses}
                      onCheckedChange={(checked) => updateSetting('adaptiveResponses', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Learning Mode</Label>
                      <p className="text-sm text-gray-400">AI continuously improves responses</p>
                    </div>
                    <Switch
                      checked={aiSettings.learningMode}
                      onCheckedChange={(checked) => updateSetting('learningMode', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/20">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => saveSettingsMutation.mutate(aiSettings)}
            disabled={saveSettingsMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}