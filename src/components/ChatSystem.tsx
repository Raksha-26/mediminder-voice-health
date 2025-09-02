import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/i18n';
import { Send, MessageCircle, Paperclip, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
  participant?: {
    id: string;
    name: string;
    avatar?: string;
    role: 'patient' | 'doctor';
  };
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ isOpen, onClose, participant }) => {
  const { currentUser, language } = useApp();
  const { t } = useTranslation(language);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: participant?.id || 'other',
      senderName: participant?.name || 'Participant',
      senderAvatar: participant?.avatar,
      content: 'Hello! How can I help you today?',
      timestamp: new Date(Date.now() - 60000),
      type: 'text'
    },
    {
      id: '2',
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'You',
      senderAvatar: currentUser?.avatar,
      content: 'Hi, I wanted to discuss my medication schedule.',
      timestamp: new Date(Date.now() - 30000),
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'You',
      senderAvatar: currentUser?.avatar,
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator and response
    if (participant) {
      setIsTyping(true);
      setTimeout(() => {
        const responses = [
          "Thank you for that information. Let me review your current medications.",
          "I understand your concern. Let's discuss this during our next appointment.",
          "That's a good question. Based on your medical history, I would recommend...",
          "Please make sure to take your medications as prescribed. Any side effects?",
          "I'll update your prescription accordingly. Is there anything else you'd like to discuss?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: participant.id,
          senderName: participant.name,
          senderAvatar: participant.avatar,
          content: randomResponse,
          timestamp: new Date(),
          type: 'text'
        };

        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
      }, 1500 + Math.random() * 2000);
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (senderId: string) => senderId === currentUser?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg">{participant?.avatar || '👤'}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">{participant?.name || 'Chat'}</DialogTitle>
              <DialogDescription className="text-left">
                {participant?.role === 'doctor' ? 'Healthcare Provider' : 'Patient'}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${isMyMessage(message.senderId) ? 'justify-end' : 'justify-start'}`}
              >
                {!isMyMessage(message.senderId) && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{message.senderAvatar || '👤'}</span>
                  </div>
                )}
                
                <div className={`max-w-[70%] ${isMyMessage(message.senderId) ? 'order-first' : ''}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      isMyMessage(message.senderId)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>

                {isMyMessage(message.senderId) && (
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{message.senderAvatar || '👤'}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{participant?.avatar || '👤'}</span>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};