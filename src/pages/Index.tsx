
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import ChatPage from "@/components/ChatPage";
import ContactPage from "@/components/ContactPage";

const Index = () => {
  const [showContact, setShowContact] = useState(false);

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
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 to-white/80 dark:from-slate-900/80 dark:to-slate-900/90 backdrop-blur-[2px]" />
        </div>
        
        <Header showContact={showContact} setShowContact={setShowContact} />

        <main className="flex-1 overflow-y-auto container max-w-4xl mx-auto p-4">
          {showContact ? <ContactPage /> : <ChatPage />}
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default Index;
