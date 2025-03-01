
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

// API keys
const GEMINI_API_KEY = "AIzaSyAHaZbSb8wYvAFynYnzLzX4PgwVHbRUom4"; 
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Create a state variable to store the user's Perplexity API key
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

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
  const [apiProvider, setApiProvider] = useState<"gemini" | "perplexity">("gemini");
  const [perplexityApiKey, setPerplexityApiKey] = useState("");
  const [showApiSettings, setShowApiSettings] = useState(false);

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
      let generatedText = "";

      if (apiProvider === "gemini") {
        console.log("Using Gemini API");
        generatedText = await callGeminiApi(content);
      } else if (apiProvider === "perplexity") {
        console.log("Using Perplexity API");
        if (!perplexityApiKey) {
          throw new Error("Perplexity API key is required");
        }
        generatedText = await callPerplexityApi(content);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generatedText,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(`Error calling ${apiProvider} API:`, error);
      toast({
        title: "Error",
        description: `I apologize, but I encountered an error with the ${apiProvider} API. Please try again or switch APIs.`,
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I encountered an error processing your request with the ${apiProvider} API. Please try again or try switching the API provider in settings.`,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const callGeminiApi = async (content: string): Promise<string> => {
    console.log("Sending request to Gemini API:", `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`);
    
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
    console.log("Response from Gemini API:", data);
    
    let generatedText = "";
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      generatedText = data.candidates[0].content.parts[0].text || "";
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }

    return generatedText;
  };

  const callPerplexityApi = async (content: string): Promise<string> => {
    console.log("Sending request to Perplexity API");
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Be precise and concise.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ['perplexity.ai'],
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response from Perplexity API:", data);
    
    // Extract the text from the Perplexity response
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content || "";
    } else {
      throw new Error('Unexpected response format from Perplexity API');
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
                {!showContact && (
                  <button
                    onClick={() => setShowApiSettings(!showApiSettings)}
                    className="flex items-center gap-2 font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    API Settings
                  </button>
                )}
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
          {showApiSettings && !showContact && (
            <div className="glass rounded-2xl modern-shadow mb-4 p-6">
              <h2 className="text-xl font-semibold mb-4">API Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1 block">Select API Provider</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setApiProvider("gemini")}
                      className={`px-4 py-2 rounded-lg ${apiProvider === "gemini" 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      Gemini API
                    </button>
                    <button
                      onClick={() => setApiProvider("perplexity")}
                      className={`px-4 py-2 rounded-lg ${apiProvider === "perplexity" 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      Perplexity API
                    </button>
                  </div>
                </div>
                
                {apiProvider === "perplexity" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Perplexity API Key</label>
                    <Input
                      type="password"
                      value={perplexityApiKey}
                      onChange={(e) => setPerplexityApiKey(e.target.value)}
                      placeholder="Enter your Perplexity API key"
                      className="gradient-border focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-xs text-slate-500">
                      You can get your API key from the <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Perplexity API dashboard</a>
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    onClick={() => setShowApiSettings(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        
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
