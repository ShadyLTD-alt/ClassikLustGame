import React, { useState, useEffect } from "react";
// Mocking shadcn/ui components for a self-contained example
const Dialog = ({ open, onOpenChange, children }) => open ? <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onOpenChange}>{children}</div> : null;
const DialogContent = ({ children, className }) => <div className={`relative bg-black text-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${className}`} onClick={(e) => e.stopPropagation()}>{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
const DialogTitle = ({ children, className }) => <h2 className={`text-2xl font-bold leading-none tracking-tight ${className}`}>{children}</h2>;
const Button = ({ children, className, variant, ...props }) => {
  let styles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  if (variant === "outline") styles += " border border-white/20 hover:bg-white/10";
  if (variant === "ghost") styles += " hover:bg-white/10";
  if (className) styles += ` ${className}`;
  return <button className={styles} {...props}>{children}</button>;
};
const Card = ({ children, className }) => <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Input = ({ ...props }) => <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;
const Textarea = ({ ...props }) => <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props}></textarea>;
const Label = ({ children, ...props }) => <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>{children}</label>;
const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="outline" className="w-full justify-between" onClick={() => setIsOpen(!isOpen)}>
        {value}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-up-down"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      </Button>
      {isOpen && (
        <div className="absolute z-10 w-full bg-black border border-white/20 rounded-md mt-1 p-1">
          {React.Children.map(children, child =>
            React.cloneElement(child, {
              onClick: () => { onValueChange(child.props.value); setIsOpen(false); }
            })
          )}
        </div>
      )}
    </div>
  );
};
const SelectTrigger = ({ children, className }) => <div className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}>{children}</div>;
const SelectValue = () => null;
const SelectContent = ({ children }) => <div className="p-1">{children}</div>;
const SelectItem = ({ value, children, ...props }) => <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" {...props}>{children}</div>;
const Tabs = ({ value, onValueChange, children }) => <div className="w-full">{children}</div>;
const TabsList = ({ children, className }) => <div className={`inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>;
const TabsTrigger = ({ value, children, className, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`} data-state={value === 'personality' ? 'active' : 'inactive'} {...props}>{children}</button>;
const TabsContent = ({ value, children, className }) => <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`} data-state={value === 'personality' ? 'active' : 'inactive'}>{children}</div>;
const Badge = ({ children, className, variant }) => {
  let styles = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  if (variant === "secondary") styles += " border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80";
  if (variant === "outline") styles += " text-foreground";
  return <div className={styles + " " + className}>{children}</div>;
};
const Switch = ({ checked, onCheckedChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`${checked ? 'bg-purple-600' : 'bg-gray-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600`}
  >
    <span
      className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);
const Slider = ({ value, onValueChange, max, min, step, className }) => {
  const [sliderValue, setSliderValue] = useState(value[0]);
  useEffect(() => { setSliderValue(value[0]); }, [value]);
  const handleInput = (e) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={sliderValue}
      onInput={handleInput}
      className={`h-2 w-full rounded-lg appearance-none cursor-pointer bg-purple-500/50 accent-purple-600 ${className}`}
    />
  );
};
// Mocking react-query and useToast hooks for the example to work
const useQuery = (options) => ({ data: {}, isLoading: false, ...options });
const useMutation = (options) => ({
  mutate: (data) => {
    console.log("Saving data...", data);
    options.onSuccess();
  },
  isPending: false,
});
const useQueryClient = () => ({ invalidateQueries: () => {} });
const useToast = () => ({ toast: (options) => console.log("Toast:", options) });

// Mock Lucide React icons
const Bot = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><path d="M22 2H2v20l4-4h16V2zm-2 14h-8"/><path d="M16 12h-4"/></svg>;
const Brain = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"/><path d="M12 8a2 2 0 0 0-2-2h4a2 2 0 0 0-2 2z"/><path d="M2 13a2 2 0 0 0 2-2h4a2 2 0 0 0-2 2z"/><path d="M22 13a2 2 0 0 0-2-2h-4a2 2 0 0 0 2 2z"/><path d="M12 21a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"/><path d="M12 3a2 2 0 0 0-2-2h4a2 2 0 0 0-2 2z"/></svg>;
const MessageCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9.3 9.3 0 0 1 4 16.1V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4.1l-2.4 2.4c-.4.4-1 .4-1.4 0z"/></svg>;
const Settings = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.22a2 2 0 0 1-1.42 1.42l-.22.12a2 2 0 0 0-1.84.88l-.25.31a2 2 0 0 0-.46 2.54l.11.23a2 2 0 0 1-.2 1.83l-.33.66a2 2 0 0 0 0 1.83l.33.66a2 2 0 0 1 .2 1.83l-.11.23a2 2 0 0 0 .46 2.54l.25.31a2 2 0 0 0 1.84.88l.22.12a2 2 0 0 1 1.42 1.42v.22a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.22a2 2 0 0 1 1.42-1.42l.22-.12a2 2 0 0 0 1.84-.88l.25-.31a2 2 0 0 0 .46-2.54l-.11-.23a2 2 0 0 1 .2-1.83l.33-.66a2 2 0 0 0 0-1.83l-.33-.66a2 2 0 0 1-.2-1.83l.11-.23a2 2 0 0 0-.46-2.54l-.25-.31a2 2 0 0 0-1.84-.88l-.22-.12a2 2 0 0 1-1.42-1.42V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const Zap = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const Plus = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const Trash2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const Save = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const Wand2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" x2="15" y1="9" y2="15"/><line x1="15" x2="15" y1="9" y2="15"/></svg>;
const Sparkles = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 15l-6-6"/><path d="M9 15l6-6"/><path d="M12 21l2-2"/><path d="M12 3l2 2"/><path d="M21 12l-2-2"/><path d="M3 12l2 2"/><path d="M17 17l-4 4"/><path d="M7 7l4-4"/><path d="M17 7l4-4"/><path d="M7 17l4 4"/></svg>;
const MessageSquare = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const Heart = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.34 0-2.61.5-3.5 1.35C12.61 3.5 11.34 3 10 3A5.5 5.5 0 0 0 5 8.5c0 2.3 1.5 4.04 3 5.5l7 7z"/></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const Volume2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;


// A simple mock for API calls
const mockFetchAISettings = async (characterId) => {
  console.log(`Fetching settings for ${characterId}...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
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
    personalityTraits: ["friendly", "curious", "helpful"],
    customPrompts: [
      { id: "p1", trigger: "hello", response: "Hey there!", mood: "happy", priority: 1, enabled: true }
    ],
    voiceSettings: {
      enabled: false,
      voice: "female-1",
      speed: 1.0,
      pitch: 1.0,
      volume: 0.8
    },
    adaptiveResponses: true,
    learningMode: false
  };
};

const mockSaveAISettings = async (settings) => {
  console.log("Saving settings:", settings);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};


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

const AISettings = ({ isOpen, onClose, characterId }: AICustomFunctionsProps) => {
  const [activeTab, setActiveTab] = useState("personality");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use react-query to fetch initial settings, with a mock call
  const { data: initialSettings, isLoading } = useQuery({
    queryKey: ['ai-settings', characterId],
    queryFn: () => mockFetchAISettings(characterId),
    enabled: isOpen && !!characterId,
  });

  // Use local state to manage the settings being edited
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);

  // Update local state when initial settings are fetched
  useEffect(() => {
    if (initialSettings) {
      setAiSettings(initialSettings);
    }
  }, [initialSettings]);

  // Save AI settings mutation with a mock call
  const saveSettingsMutation = useMutation({
    mutationFn: (settings: AISettings) => mockSaveAISettings(settings),
    onSuccess: () => {
      toast({ title: "Success", description: "AI settings saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ['ai-settings', characterId] });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save AI settings", variant: "destructive" });
    }
  });

  const [newTrait, setNewTrait] = useState("");
  const [newPrompt, setNewPrompt] = useState<Partial<CustomPrompt>>({
    trigger: "",
    response: "",
    mood: "neutral",
    priority: 5,
    enabled: true
  });

  const addPersonalityTrait = () => {
    if (newTrait.trim() && aiSettings && !aiSettings.personalityTraits.includes(newTrait.trim())) {
      setAiSettings(prev => prev ? ({ ...prev, personalityTraits: [...prev.personalityTraits, newTrait.trim()] }) : null);
      setNewTrait("");
    }
  };

  const removeTrait = (trait: string) => {
    setAiSettings(prev => prev ? ({
      ...prev,
      personalityTraits: prev.personalityTraits.filter(t => t !== trait)
    }) : null);
  };

  const addCustomPrompt = () => {
    if (aiSettings && newPrompt.trigger && newPrompt.response) {
      const prompt: CustomPrompt = {
        id: `prompt-${Date.now()}`,
        trigger: newPrompt.trigger,
        response: newPrompt.response,
        mood: newPrompt.mood || "neutral",
        priority: newPrompt.priority || 5,
        enabled: true
      };

      setAiSettings(prev => prev ? ({
        ...prev,
        customPrompts: [...prev.customPrompts, prompt]
      }) : null);

      setNewPrompt({ trigger: "", response: "", mood: "neutral", priority: 5, enabled: true });
    }
  };

  const removePrompt = (promptId: string) => {
    setAiSettings(prev => prev ? ({
      ...prev,
      customPrompts: prev.customPrompts.filter(p => p.id !== promptId)
    }) : null);
  };

  const updateSetting = (key: keyof AISettings, value: any) => {
    setAiSettings(prev => prev ? ({ ...prev, [key]: value }) : null);
  };

  const updateVoiceSetting = (key: keyof VoiceSettings, value: any) => {
    setAiSettings(prev => prev ? ({
      ...prev,
      voiceSettings: { ...prev.voiceSettings, [key]: value }
    }) : null);
  };

  if (isLoading || !aiSettings) return null;

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
                    <Button onClick={addPersonalityTrait} className="bg-purple-500 hover:bg-purple-600">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiSettings.personalityTraits.map((trait, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {trait}
                        <button onClick={() => removeTrait(trait)}>
                          <Trash2 className="w-3 h-3 ml-1" />
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
                    <Button onClick={addCustomPrompt} className="col-span-1 bg-purple-500 hover:bg-purple-600">
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
};

export default AISettings;

