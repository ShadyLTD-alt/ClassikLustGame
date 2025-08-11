import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  characterId: string;
  characterName: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  characterId: string | null;
  message: string;
  isFromUser: boolean;
  createdAt: Date;
}

export default function ChatModal({ isOpen, onClose, userId, characterId, characterName }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", userId, characterId],
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/chat/send", {
        userId,
        characterId,
        message: userMessage,
        isFromUser: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId, characterId] });
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Message Failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-none max-w-sm p-6 rounded-3xl h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">💬</span>
            </div>
            <h2 className="text-xl font-bold text-pink-300">Chat</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/20 p-1 h-8 w-8 rounded-full"
          >
            ✕
          </Button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white/10 rounded-2xl p-4 mb-4 overflow-y-auto backdrop-blur-sm">
          {isLoading ? (
            <div className="text-center text-white/70">Loading messages...</div>
          ) : !messages || messages.length === 0 ? (
            <div className="text-center text-white/70">Start a conversation with {characterName || "Character"}!</div>
          ) : (
            <div className="space-y-3">
              {messages?.map((msg: ChatMessage) => (
                <div key={msg.id} className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                    msg.isFromUser 
                      ? 'bg-blue-500 text-white rounded-br-md' 
                      : 'bg-pink-500 text-white rounded-bl-md'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              
              {/* Sample messages if none exist */}
              {(!messages || messages.length === 0) && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%] text-sm">
                      That's interesting! Tell me more 😊
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-pink-500 text-white px-4 py-2 rounded-2xl rounded-bl-md max-w-[80%] text-sm">
                      Ddd
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%] text-sm">
                      That's interesting! Tell me more 😊
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-pink-500 text-white px-4 py-2 rounded-2xl rounded-bl-md max-w-[80%] text-sm">
                      Hey
                    </div>
                  </div>
                  <div className="text-blue-300 text-sm">
                    Created new character: Brooke
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 border-none text-white placeholder-white/60 rounded-2xl px-4"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 rounded-2xl"
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}