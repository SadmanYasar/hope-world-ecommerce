"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";
import { Authenticated } from "@refinedev/core";
import Link from "next/link";
import { supabaseBrowserClient } from "@utils/supabase/client";

type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Thanks for your message! This is a demo response. In a real implementation, this would be connected to your backend API.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed rounded-full shadow-lg bottom-6 right-6 h-14 w-14"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[90vw] sm:w-[380px] p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <Avatar className="w-8 h-8 mr-2">
              <AvatarImage src="/bot-avatar.png" alt="Bot" />
              <AvatarFallback>HW</AvatarFallback>
            </Avatar>
            Hope World Assistant
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <Authenticated
          key={"chat-auth"}
          fallback={
            <Link href={"/login"}>
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Sign in to chat</p>
              </div>
            </Link>
          }
        >
          <SheetFooter className="p-4 border-t">
            <form
              className="flex items-center w-full space-x-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!inputValue.trim()) return;

                const userMessage: Message = {
                  id: Date.now().toString(),
                  content: inputValue,
                  sender: "user",
                  timestamp: new Date(),
                };

                setMessages((prev) => [...prev, userMessage]);
                setInputValue("");

                const mockedData: string = `This is a simulated conversation data. ${
                  messages.length
                } messages were passed in this session ${messages
                  .map((m) => m.content)
                  .join(", ")}`;

                console.log(messages);

                const latestMessage = userMessage.content;

                try {
                  const response = await supabaseBrowserClient.functions.invoke(
                    "search",
                    {
                      body: {
                        search: latestMessage,
                      },
                      method: "POST",
                    }
                  );

                  const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content:
                      response.data?.response ??
                      "Sorry, I am not sure how to help with that.",
                    sender: "bot",
                    timestamp: new Date(),
                  };

                  setMessages((prev) => [...prev, botMessage]);
                } catch (error) {
                  console.error("Error invoking function:", error);
                  const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: "An error occurred. Please try again later.",
                    sender: "bot",
                    timestamp: new Date(),
                  };

                  setMessages((prev) => [...prev, botMessage]);
                }
              }}
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </SheetFooter>
        </Authenticated>
      </SheetContent>
    </Sheet>
  );
}

export default ChatBot;
