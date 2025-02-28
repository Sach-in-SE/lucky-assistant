
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatHistory, type Message } from "@/components/ChatHistory";
import { ChatInput } from "@/components/ChatInput";
import { Sparkles, Contact, Mail, Github, Instagram, MapPin, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// API key for Gemini
const GEMINI_API_KEY = "AIzaSyB9iorVKvP5UQlD7G4uREkYFfLIlPzrklk"; 
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent";

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
      // Direct API call to Gemini
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: content
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      let generatedText = "";
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        generatedText = data.candidates[0].content.parts[0].text || "";
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generatedText,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      toast({
        title: "Error",
        description: "I apologize, but I encountered an error. Please try again in a moment.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error processing your request. Please try again.",
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
