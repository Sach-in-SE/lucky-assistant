
import React from "react";
import { Contact, Home, LogIn, LogOut, MessageSquarePlus, Sparkles, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showContact?: boolean;
  setShowContact?: (show: boolean) => void;
  onNewChat?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showContact, setShowContact, onNewChat }) => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      // If we're on profile page, navigate to home and reset chat
      navigate('/');
    }
  };

  const handleContactToggle = () => {
    if (setShowContact) {
      setShowContact(!showContact);
    } else {
      // If we're on profile page, navigate to home and show contact
      navigate('/', { state: { showContact: true } });
    }
  };

  const handleHomeClick = () => {
    if (setShowContact && showContact) {
      setShowContact(false);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="relative border-b border-slate-700/70 bg-slate-900/60 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-xl font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Lucky's Assistant
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Chat
            </button>
            
            {showContact ? (
              <button
                onClick={handleHomeClick}
                className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
            ) : (
              <button
                onClick={handleContactToggle}
                className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Contact className="h-4 w-4" />
                Contact Us
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
