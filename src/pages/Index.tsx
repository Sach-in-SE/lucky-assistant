
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
    <div className="absolute inset-0 -z-10">
      {theme === "light" ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-white/60 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100/20 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-950/70 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-circuit-pattern opacity-20" />
        </div>
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
