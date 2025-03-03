
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import ChatPage from "@/components/ChatPage";
import ContactPage from "@/components/ContactPage";
import { useTheme } from "@/components/ThemeProvider";

// Create a new Background component for better organization
const Background = () => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-50"
      style={{ 
        backgroundImage: 'url("/lovable-uploads/cb0bbf4b-ecfe-4acd-8f12-0e6c3508e84f.png")',
        backgroundBlendMode: 'overlay',
      }}
    >
      {theme === "light" ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 to-white/80 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/90 backdrop-blur-[2px]" />
      )}
    </div>
  );
};

const Index = () => {
  const [showContact, setShowContact] = useState(false);

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <div className="flex flex-col h-screen">
        <Background />
        
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
