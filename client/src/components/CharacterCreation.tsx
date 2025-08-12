import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Eye, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Character form schema based on your requirements
const characterSchema = z.object({
  name: z.string().min(1, "Character name is required"),
  bio: z.string().default(""),
  backstory: z.string().default(""),
  interests: z.string().default(""),
  quirks: z.string().default(""),
  imageUrl: z.string().default(""),
  avatarUrl: z.string().default(""),
  requiredLevel: z.number().min(1).default(1),
  personality: z.string().default("friendly"),
  chatStyle: z.string().default("casual"),
  personalityStyle: z.string().default("Sweet & Caring"),
  responseTimeMin: z.number().min(1).default(1),
  responseTimeMax: z.number().min(1).default(3),
  randomPictureSending: z.boolean().default(false),
  pictureSendChance: z.number().min(0).max(100).default(5),
  likes: z.string().default(""),
  dislikes: z.string().default(""),
  isNsfw: z.boolean().default(false),
  isVip: z.boolean().default(false),
  isEvent: z.boolean().default(false),
  isWheelReward: z.boolean().default(false),
  userId: z.string().optional(),
});

type CharacterFormData = z.infer<typeof characterSchema>;

interface MoodDistribution {
  normal: number;
  happy: number;
  flirty: number;
  playful: number;
  mysterious: number;
  shy: number;
}

interface CharacterCreationProps {
  isOpen?: boolean;
  onClose?: () => void;
  editingCharacter?: any;
}

export default function CharacterCreation({ isOpen, onClose, editingCharacter }: CharacterCreationProps) {
  const [moodDistribution, setMoodDistribution] = useState<MoodDistribution>({
    normal: 70,
    happy: 20,
    flirty: 10,
    playful: 0,
    mysterious: 0,
    shy: 0
  });
  const [customGreetings, setCustomGreetings] = useState<string[]>([]);
  const [customResponses, setCustomResponses] = useState<string[]>([]);
  const [customTriggerWords, setCustomTriggerWords] = useState<{ word: string; response: string; mood: string }[]>([]);
  const [newGreeting, setNewGreeting] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [newTrigger, setNewTrigger] = useState({ word: "", response: "", mood: "neutral" });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: editingCharacter ? {
      name: editingCharacter.name || "",
      bio: editingCharacter.bio || "",
      backstory: editingCharacter.backstory || "",
      interests: editingCharacter.interests || "",
      quirks: editingCharacter.quirks || "",
      imageUrl: editingCharacter.imageUrl || "",
      avatarUrl: editingCharacter.avatarUrl || "",
      requiredLevel: editingCharacter.requiredLevel || 1,
      personality: editingCharacter.personality || "friendly",
      chatStyle: editingCharacter.chatStyle || "casual",
      personalityStyle: editingCharacter.personalityStyle || "Sweet & Caring",
      responseTimeMin: editingCharacter.responseTimeMin || 1,
      responseTimeMax: editingCharacter.responseTimeMax || 3,
      randomPictureSending: editingCharacter.randomPictureSending || false,
      pictureSendChance: editingCharacter.pictureSendChance || 5,
      likes: editingCharacter.likes || "",
      dislikes: editingCharacter.dislikes || "",
      isNsfw: editingCharacter.isNsfw || false,
      isVip: editingCharacter.isVip || false,
      isEvent: editingCharacter.isEvent || false,
      isWheelReward: editingCharacter.isWheelReward || false,
      userId: "mock-user-id"
    } : {
      name: "",
      bio: "",
      backstory: "",
      interests: "",
      quirks: "",
      imageUrl: "",
      avatarUrl: "",
      requiredLevel: 1,
      personality: "friendly",
      chatStyle: "casual",
      personalityStyle: "Sweet & Caring",
      responseTimeMin: 1,
      responseTimeMax: 3,
      randomPictureSending: false,
      pictureSendChance: 5,
      likes: "",
      dislikes: "",
      isNsfw: false,
      isVip: false,
      isEvent: false,
      isWheelReward: false,
      userId: "mock-user-id"
    }
  });

  // Fetch media files for image selection
  const { data: mediaFiles = [] } = useQuery({
    queryKey: ['/api/media'],
    queryFn: () => fetch('/api/media').then(res => res.json())
  });

  const createCharacterMutation = useMutation({
    mutationFn: (data: any) => {
      const url = editingCharacter ? `/api/character/${editingCharacter.id}` : '/api/character';
      const method = editingCharacter ? 'PUT' : 'POST';
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/characters'] });
      toast({ 
        title: "Success", 
        description: editingCharacter ? "Character updated successfully!" : "Character created successfully!" 
      });
      if (!editingCharacter) {
        form.reset();
        setMoodDistribution({ normal: 70, happy: 20, flirty: 10, playful: 0, mysterious: 0, shy: 0 });
        setCustomGreetings([]);
        setCustomResponses([]);
        setCustomTriggerWords([]);
      }
      if (onClose) onClose();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const onSubmit = (data: CharacterFormData) => {
    const characterData = {
      ...data,
      moodDistribution,
      customResponses,
      customGreetings,
      customTriggerWords,
    };
    createCharacterMutation.mutate(characterData);
  };

  const updateMoodDistribution = (mood: keyof MoodDistribution, value: number) => {
    setMoodDistribution(prev => ({ ...prev, [mood]: value }));
  };

  const addGreeting = () => {
    if (newGreeting.trim()) {
      setCustomGreetings(prev => [...prev, newGreeting.trim()]);
      setNewGreeting("");
    }
  };

  const addResponse = () => {
    if (newResponse.trim()) {
      setCustomResponses(prev => [...prev, newResponse.trim()]);
      setNewResponse("");
    }
  };

  const addTriggerWord = () => {
    if (newTrigger.word.trim() && newTrigger.response.trim()) {
      setCustomTriggerWords(prev => [...prev, newTrigger]);
      setNewTrigger({ word: "", response: "", mood: "neutral" });
    }
  };

  const removeGreeting = (index: number) => {
    setCustomGreetings(prev => prev.filter((_, i) => i !== index));
  };

  const removeResponse = (index: number) => {
    setCustomResponses(prev => prev.filter((_, i) => i !== index));
  };

  const removeTriggerWord = (index: number) => {
    setCustomTriggerWords(prev => prev.filter((_, i) => i !== index));
  };

  const totalMoodPercentage = Object.values(moodDistribution).reduce((sum, val) => sum + val, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Character Creation</h2>
          <p className="text-muted-foreground">
            Create detailed characters with full personality customization
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="chat">Chat Settings</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Essential character details and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Character Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Akira" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requiredLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio/Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A confident and athletic anime girl..." 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="backstory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Backstory</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Character background and history..." 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interests</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Fitness, anime, gaming..." 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="quirks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quirks & Personality Traits</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Always flexes when excited, competitive streak..." 
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Image</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select main image" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Select main image</SelectItem>
                              {mediaFiles.map((file: any) => (
                                <SelectItem key={file.id || file.filename} value={file.url || file.path || `/uploads/${file.filename}`}>
                                  {file.originalName || file.filename} - {file.fileType || 'image'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar Image</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select avatar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No avatar selected</SelectItem>
                              {mediaFiles.map((file: any) => (
                                <SelectItem key={file.id || file.filename} value={file.url || file.path || `/uploads/${file.filename}`}>
                                  {file.originalName || file.filename} - {file.fileType || 'image'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personality Settings */}
            <TabsContent value="personality" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personality Configuration</CardTitle>
                  <CardDescription>
                    Define mood distribution and personality traits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalityStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personality Style</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sweet & Caring">Sweet & Caring</SelectItem>
                              <SelectItem value="Mysterious">Mysterious</SelectItem>
                              <SelectItem value="Playful">Playful</SelectItem>
                              <SelectItem value="Confident">Confident</SelectItem>
                              <SelectItem value="Shy">Shy</SelectItem>
                              <SelectItem value="Flirty">Flirty</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chatStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chat Style</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                              <SelectItem value="energetic">Energetic</SelectItem>
                              <SelectItem value="calm">Calm</SelectItem>
                              <SelectItem value="witty">Witty</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">
                      Mood Distribution (%) - Total: {totalMoodPercentage}%
                    </Label>
                    <div className="space-y-4 mt-4">
                      {(Object.entries(moodDistribution) as [keyof MoodDistribution, number][]).map(([mood, value]) => (
                        <div key={mood} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="capitalize">{mood}</Label>
                            <span className="text-sm text-muted-foreground w-12 text-right">{value}%</span>
                          </div>
                          <Slider
                            value={[value]}
                            onValueChange={(newValue) => updateMoodDistribution(mood, newValue[0])}
                            max={100}
                            min={0}
                            step={5}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                    {totalMoodPercentage !== 100 && (
                      <p className="text-sm text-amber-600 mt-2">
                        Warning: Total should equal 100% (currently {totalMoodPercentage}%)
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="likes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Likes (comma separated)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="compliments, romance, movies, music" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dislikes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dislikes (comma separated)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="rudeness, negativity, boring topics" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat Settings */}
            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chat Configuration</CardTitle>
                  <CardDescription>
                    Response timing and picture sending settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="responseTimeMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Response Time (seconds)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="responseTimeMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Response Time (seconds)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="randomPictureSending"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Random Picture Sending</FormLabel>
                            <FormDescription>
                              Allow character to send random pictures during chat
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pictureSendChance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Picture Send Chance: {field.value}%</FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              max={50}
                              min={0}
                              step={1}
                            />
                          </FormControl>
                          <FormDescription>
                            Probability of sending a picture in each message
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Custom Greetings */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Custom Greetings</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a greeting message..."
                        value={newGreeting}
                        onChange={(e) => setNewGreeting(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addGreeting()}
                      />
                      <Button type="button" onClick={addGreeting}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customGreetings.map((greeting, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {greeting}
                          <button 
                            type="button"
                            onClick={() => removeGreeting(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Custom Responses */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Custom Responses</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a response message..."
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addResponse()}
                      />
                      <Button type="button" onClick={addResponse}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customResponses.map((response, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {response}
                          <button 
                            type="button"
                            onClick={() => removeResponse(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trigger Words */}
            <TabsContent value="triggers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Trigger Words</CardTitle>
                  <CardDescription>
                    Define special responses to specific words or phrases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      placeholder="Trigger word..."
                      value={newTrigger.word}
                      onChange={(e) => setNewTrigger({ ...newTrigger, word: e.target.value })}
                      className="col-span-3"
                    />
                    <Input
                      placeholder="Custom response..."
                      value={newTrigger.response}
                      onChange={(e) => setNewTrigger({ ...newTrigger, response: e.target.value })}
                      className="col-span-6"
                    />
                    <Select value={newTrigger.mood} onValueChange={(v) => setNewTrigger({ ...newTrigger, mood: v })}>
                      <SelectTrigger className="col-span-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a mood</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="flirty">Flirty</SelectItem>
                        <SelectItem value="shy">Shy</SelectItem>
                        <SelectItem value="mysterious">Mysterious</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addTriggerWord} className="col-span-1">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {customTriggerWords.map((trigger, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{trigger.word}</Badge>
                            <span className="text-sm">→</span>
                            <span className="text-sm">{trigger.response}</span>
                            <Badge variant="secondary">{trigger.mood}</Badge>
                          </div>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeTriggerWord(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>
                    Character flags and special properties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isNsfw"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">NSFW Content</FormLabel>
                            <FormDescription>
                              Mark as adult content
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isVip"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">VIP Character</FormLabel>
                            <FormDescription>
                              Premium character access
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isEvent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Event Character</FormLabel>
                            <FormDescription>
                              Limited-time availability
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isWheelReward"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Wheel Reward</FormLabel>
                            <FormDescription>
                              Available from wheel spin
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset Form
            </Button>
            <Button type="submit" disabled={createCharacterMutation.isPending}>
              {createCharacterMutation.isPending 
                ? (editingCharacter ? "Updating..." : "Creating...") 
                : (editingCharacter ? "Update Character" : "Create Character")
              }
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}