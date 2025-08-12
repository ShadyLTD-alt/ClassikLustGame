import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Trash2, Save } from "lucide-react";

// Mock Tailwind CSS for a runnable example
// In a real project, this would be handled by the build process.
// We are using a global CDN link in the main HTML file.

// Mock UI components from shadcn/ui to make the app self-contained.
// In a real-world application, these would be imported from your component library.
const Button = ({ children, onClick, type = "button", variant, disabled = false, className = "" }) => (
  <button 
    type={type} 
    onClick={onClick} 
    disabled={disabled} 
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 
      ${variant === "outline" ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}
      ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-card text-card-foreground rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Input = React.forwardRef(({ type = "text", className = "", ...props }, ref) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);

const Textarea = React.forwardRef(({ className = "", ...props }, ref) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedItem = React.Children.toArray(children).find(child => child.props.value === value) || {};
  return (
    <div className="relative">
      <div 
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedItem.props?.children || "Select..."}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-[15rem] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {React.Children.map(children, child =>
            <div 
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent"
              onClick={() => { onValueChange(child.props.value); setIsOpen(false); }}
            >
              {child.props.children}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ children }) => children;
const SelectValue = () => null;
const SelectContent = ({ children }) => children;
const SelectItem = ({ children, value }) => <>{children}</>;

const Switch = ({ checked, onCheckedChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-primary" : "bg-input"}`}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
    ></span>
  </button>
);

const Slider = ({ value, onValueChange, max, min, step, className = "" }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value[0]}
    onChange={(e) => onValueChange([Number(e.target.value)])}
    className={`w-full appearance-none h-2 bg-muted rounded-lg cursor-pointer ${className}`}
  />
);

const Badge = ({ children, variant, className = "" }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === "secondary" ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"} ${className}`}>
    {children}
  </div>
);

const Form = FormProvider;
const FormControl = ({ children }) => children;
const FormDescription = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;
const FormField = ({ control, name, render }) => render({ field: { ...control.register(name), ...control.getValues(), value: control.getValues(name) }, fieldState: { error: control.formState.errors[name] } });
const FormItem = ({ children, className = "" }) => <div className={`space-y-2 ${className}`}>{children}</div>;
const FormLabel = ({ children, className = "" }) => <Label className={className}>{children}</Label>;
const FormMessage = ({ children }) => <p className="text-sm font-medium text-destructive">{children}</p>;

const Tabs = ({ defaultValue, children, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (child.type === TabsList) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        } else if (child.type === TabsContent) {
          return React.cloneElement(child, { activeTab });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab, className = "" }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab, className = "" }) => (
  <button 
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${activeTab === value ? "bg-background text-foreground shadow-sm" : ""} ${className}`}
    data-state={activeTab === value ? "active" : "inactive"}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab, className = "" }) => (
  <div className={`${activeTab === value ? "block" : "hidden"} mt-2 ${className}`}>{children}</div>
);

const Separator = ({ className = "" }) => <div className={`h-[1px] w-full bg-border ${className}`} />;

// Mock toast hook
const useToast = () => ({
  toast: ({ title, description, variant }) => {
    console.log(`Toast - ${variant}: ${title}, ${description}`);
  }
});

// Mock apiRequest function
const apiRequest = (method, url, data) => {
  return new Promise((resolve) => {
    console.log(`API Request: ${method} to ${url} with data:`, data);
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

// Mock media files data
const mockMediaFiles = [
  { id: '1', filename: 'akira.jpg', originalName: 'Akira Character Image', url: 'https://placehold.co/400x600/png' },
  { id: '2', filename: 'akira_avatar.png', originalName: 'Akira Avatar', url: 'https://placehold.co/150x150/png' },
  { id: '3', filename: 'bg_city.jpg', originalName: 'City Background', url: 'https://placehold.co/1000x800/png' }
];

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

const CharacterCreation = ({ isOpen, onClose, editingCharacter }: CharacterCreationProps) => {
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
    queryFn: () => new Promise(resolve => setTimeout(() => resolve(mockMediaFiles), 500)),
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
    <div className="max-w-4xl mx-auto space-y-6 p-4 bg-background text-foreground min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Character Creation</h2>
          <p className="text-muted-foreground">
            Create detailed characters with full personality customization
          </p>
        </div>
      </div>

      <FormProvider {...form}>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              {mediaFiles.map((file) => (
                                <SelectItem key={file.id} value={file.url}>
                                  {file.originalName}
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
                              <SelectItem value="">Select avatar</SelectItem>
                              {mediaFiles.map((file) => (
                                <SelectItem key={file.id} value={file.url}>
                                  {file.originalName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Mood */}
                  <FormField
                    control={form.control}
                    name="personality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Mood/Personality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/30 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Select a mood</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="happy">Happy</SelectItem>
                              <SelectItem value="flirty">Flirty</SelectItem>
                              <SelectItem value="shy">Shy</SelectItem>
                              <SelectItem value="confident">Confident</SelectItem>
                              <SelectItem value="mysterious">Mysterious</SelectItem>
                              <SelectItem value="playful">Playful</SelectItem>
                              <SelectItem value="romantic">Romantic</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex flex-wrap gap-2 mt-2">
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
                    <div className="flex flex-wrap gap-2 mt-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
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

                  <div className="space-y-2 mt-4">
                    {customTriggerWords.map((trigger, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </FormProvider>
    </div>
  );
};

// Main App component to wrap everything
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterCreation />
    </QueryClientProvider>
  );
}

