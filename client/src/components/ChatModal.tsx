import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { Character, ChatMessage } from "@shared/schema";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  userId: string;
}

export default function ChatModal({ isOpen, onClose, character, userId }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", userId],
    enabled: isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        characterId: character.id,
        message: messageText,
        isFromUser: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId] });
      setMessage("");
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponses = [
          "That's really interesting! Tell me more.",
          "I understand how you feel about that.",
          "Thanks for sharing that with me! ✨",
          "You always know what to say to make me smile!",
          "I love talking with you about these things.",
          "That sounds wonderful! I wish I could experience that too.",
          "You have such a unique perspective on things.",
          "I'm here whenever you want to chat! 💕"
        ];
        
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        
        apiRequest("POST", "/api/chat", {
          userId,
          characterId: character.id,
          message: randomResponse,
          isFromUser: false
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/chat", userId] });
        });
      }, 1000 + Math.random() * 2000);
    },
  });

  const handleSend = () => {
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const characterMessages = messages.filter(msg => msg.characterId === character.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900 to-pink-900 text-white border border-purple-500/30 max-w-md h-3/4 flex flex-col p-0">
        
        {/* Chat Header */}
        <DialogHeader className="p-4 border-b border-purple-500/30 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={character.imageUrl} 
                alt={character.name}
                className="object-cover"
              />
            </Avatar>
            <div>
              <DialogTitle className="font-bold text-white">{character.name}</DialogTitle>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {characterMessages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>Start a conversation with {character.name}!</p>
                <p className="text-sm">Say hello to get started.</p>
              </div>
            ) : (
              characterMessages.map((msg) => (
                <div key={msg.id} className={`flex space-x-2 ${msg.isFromUser ? 'justify-end' : ''}`}>
                  {!msg.isFromUser && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage 
                        src={character.imageUrl} 
                        alt={character.name}
                        className="object-cover"
                      />
                    </Avatar>
                  )}
                  <div className={`rounded-2xl p-3 max-w-xs ${
                    msg.isFromUser 
                      ? 'bg-blue-600/50 rounded-tr-md' 
                      : 'bg-purple-700/50 rounded-tl-md'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-purple-500/30 flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-black/30 rounded-lg text-white placeholder-gray-400 border border-purple-500/30 focus:border-purple-400"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
