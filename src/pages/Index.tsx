
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatHistory, type Message } from "@/components/ChatHistory";
import { ChatInput } from "@/components/ChatInput";
import { Contact, Mail, Github, Instagram, MapPin, Phone, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// API URL and key are now hardcoded in the component instead of being configurable via UI
const API_URL = "https://api.together.xyz/v1/chat/completions";
const API_KEY = "f2fb339571bd0265a79f19d7f7f9977e66189670add02b4ad80e1a0fbf2b2b28";

const Index = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! 👋 Lucky is here. How can I help you today?",
      isAI: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isAI: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Direct API call to Together.ai without going through Supabase
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3-8b-chat-hf",
          messages: [
            { role: "system", content: "You are Lucky, a helpful and friendly AI assistant. Respond to users in a conversational, natural way. Keep responses concise but informative." },
            ...messages.map(msg => ({
              role: msg.isAI ? "assistant" : "user",
              content: msg.content
            })),
            { role: "user", content }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(`Error calling API:`, error);
      toast({
        title: "Error",
        description: `I apologize, but I encountered an error processing your request. Please try again.`,
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I encountered an error processing your request. Please try again later.`,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter your message",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your message has been sent successfully!",
    });

    setFormData({ name: "", email: "", message: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <div className="flex flex-col h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-50"
          style={{ 
            backgroundImage: 'url("/lovable-uploads/cb0bbf4b-ecfe-4acd-8f12-0e6c3508e84f.png")',
            backgroundBlendMode: 'overlay',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 to-white/80 backdrop-blur-[2px]" />
        </div>
        
        <header className="relative border-b bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
          <div className="container max-w-7xl mx-auto">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setShowContact(false)}
                  className="text-xl font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Lucky's Assistant
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                {showContact && (
                  <button
                    onClick={() => setShowContact(false)}
                    className="flex items-center gap-2 font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </button>
                )}
                <button
                  onClick={() => setShowContact(true)}
                  className="flex items-center gap-2 font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Contact className="h-4 w-4" />
                  Contact Us
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto container max-w-4xl mx-auto p-4">
          {showContact ? (
            <div className="glass rounded-2xl modern-shadow">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Developer</h2>
                    <div className="flex items-start gap-3">
                      <Github className="h-6 w-6 mt-1 text-slate-700" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Sachin Kumar</h3>
                        <p className="text-slate-600">Full Stack Developer</p>
                        <a href="https://www.instagram.com/official__luc_ky" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                          @official__luc_ky
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <a href="mailto:lucky002954@gmail.com" 
                       className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium text-slate-900">Email</div>
                        <div className="text-sm text-slate-600">lucky002954@gmail.com</div>
                      </div>
                    </a>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                      <Phone className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium text-slate-900">Phone</div>
                        <div className="text-sm text-slate-600">+91 9759938908</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium text-slate-900">Address</div>
                        <div className="text-sm text-slate-600">Bareilly, Uttar Pradesh</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Send us a Message</h2>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900">Name</label>
                      <Input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name" 
                        className="gradient-border focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900">Email</label>
                      <Input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your email" 
                        className="gradient-border focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900">Message</label>
                      <Textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Your message" 
                        className="gradient-border focus:ring-2 focus:ring-blue-500/20 min-h-[150px]" 
                      />
                    </div>
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium" 
                      type="submit"
                    >
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full glass rounded-2xl modern-shadow">
              <div className="flex-1 overflow-hidden">
                <ChatHistory messages={messages} />
              </div>
              <div className="border-t border-slate-200/60">
                <ChatInput onSubmit={handleSendMessage} disabled={isLoading} />
              </div>
            </div>
          )}
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default Index;
