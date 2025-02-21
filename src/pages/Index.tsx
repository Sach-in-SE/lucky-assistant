
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatHistory, type Message } from "@/components/ChatHistory";
import { ChatInput } from "@/components/ChatInput";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Contact, Mail, Github, Instagram, MapPin, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isAI: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: { prompt: content }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.generatedText,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
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
    
    // Simple validation
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

    // If all validations pass, show success message
    toast({
      title: "Success",
      description: "Your message has been sent successfully!",
    });

    // Clear form
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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ 
            backgroundImage: 'url("/lovable-uploads/cb0bbf4b-ecfe-4acd-8f12-0e6c3508e84f.png")',
            backgroundBlendMode: 'overlay',
          }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
        
        <header className="relative border-b bg-sky-100 dark:bg-transparent">
          <div className="container max-w-7xl mx-auto">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setShowContact(false)}
                  className="text-xl font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Lucky's Assistant
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                {showContact && (
                  <button
                    onClick={() => setShowContact(false)}
                    className="flex items-center gap-2 font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </button>
                )}
                <button
                  onClick={() => setShowContact(true)}
                  className="flex items-center gap-2 font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
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
            <div className="glass rounded-lg shadow-lg p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Section - Developer Info */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-4">Developer</h2>
                    <div className="flex items-start gap-3">
                      <Github className="h-6 w-6 mt-1 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold">Sachin Kumar</h3>
                        <p className="text-muted-foreground">Full Stack Developer</p>
                        <a href="https://www.instagram.com/official__luc_ky" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          @official__luc_ky
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <a href="mailto:lucky002954@gmail.com" 
                       className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">lucky002954@gmail.com</div>
                      </div>
                    </a>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-sm text-muted-foreground">+91 9917250558</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Address</div>
                        <div className="text-sm text-muted-foreground">Bareilly, Uttar Pradesh</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Contact Form */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-primary">Send us a Message</h2>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name" 
                        className="bg-background/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your email" 
                        className="bg-background/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <Textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Your message" 
                        className="bg-background/50 min-h-[150px]" 
                      />
                    </div>
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" 
                      type="submit"
                    >
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full glass rounded-lg shadow-lg">
              <div className="flex-1 overflow-hidden">
                <ChatHistory messages={messages} />
              </div>
              <div className="border-t">
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
              </div>
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default Index;
