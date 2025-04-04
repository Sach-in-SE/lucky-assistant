
import React, { useState } from "react";
import { Contact, Home, LogIn, LogOut, Menu, MessageSquarePlus, Sparkles, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  showContact?: boolean;
  setShowContact?: (show: boolean) => void;
  onNewChat?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showContact, setShowContact, onNewChat }) => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
      setIsSidebarOpen(false);
    } else {
      // If we're on profile page, navigate to home and reset chat
      navigate('/');
      setIsSidebarOpen(false);
    }
  };

  const handleContactToggle = () => {
    if (setShowContact) {
      setShowContact(!showContact);
      setIsSidebarOpen(false);
    } else {
      // If we're on profile page, navigate to home and show contact
      navigate('/', { state: { showContact: true } });
      setIsSidebarOpen(false);
    }
  };

  const handleHomeClick = () => {
    if (setShowContact && showContact) {
      setShowContact(false);
      setIsSidebarOpen(false);
    } else {
      navigate('/');
      setIsSidebarOpen(false);
    }
  };

  return (
    <header className="relative border-b border-slate-700/70 bg-slate-900/60 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="w-[250px] bg-slate-900 text-slate-100 border-r border-slate-700/70">
                <div className="flex flex-col gap-6 mt-6">
                  <Link
                    to="/"
                    className="text-xl font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity mb-4"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                      Lucky's Assistant
                    </span>
                  </Link>
                  
                  <button
                    onClick={handleNewChat}
                    className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-800 transition-colors w-full text-left"
                  >
                    <MessageSquarePlus className="h-5 w-5" />
                    New Chat
                  </button>
                  
                  <button
                    onClick={handleHomeClick}
                    className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-800 transition-colors w-full text-left"
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </button>

                  <button
                    onClick={handleContactToggle}
                    className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-800 transition-colors w-full text-left"
                  >
                    <Contact className="h-5 w-5" />
                    Contact Us
                  </button>
                  
                  {currentUser ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-800 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        Profile
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-800 transition-colors w-full text-left mt-4"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/signin"
                      className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-800 transition-colors"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo - visible on all screen sizes */}
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span className="hidden lg:inline">New Chat</span>
            </button>
            
            {showContact ? (
              <button
                onClick={handleHomeClick}
                className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden lg:inline">Home</span>
              </button>
            ) : (
              <button
                onClick={handleContactToggle}
                className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Contact className="h-4 w-4" />
                <span className="hidden lg:inline">Contact Us</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Profile</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="flex items-center gap-2 font-medium text-slate-300 hover:text-white transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden lg:inline">Sign In</span>
              </Link>
            )}
          </div>
          
          {/* Mobile Icons - Minimal UI for small screens */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={handleNewChat}
              className="p-2 text-slate-300 hover:text-white"
              aria-label="New Chat"
            >
              <MessageSquarePlus className="h-5 w-5" />
            </button>
            
            {currentUser && (
              <Link to="/profile" className="p-2 text-slate-300 hover:text-white">
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
