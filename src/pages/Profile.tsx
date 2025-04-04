
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Mail, Edit, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";

const Profile = () => {
  const { currentUser, signOut, updateUserEmail, updateUserPassword } = useAuth();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsLoading(true);
    try {
      await updateUserEmail(newEmail);
      toast({
        title: "Success",
        description: "Your email has been updated.",
      });
      setIsEditingEmail(false);
      setNewEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setIsLoading(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      toast({
        title: "Success",
        description: "Your password has been updated.",
      });
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50">
        <Header onNewChat={() => navigate('/')} />
        
        <div className="container max-w-2xl mx-auto px-4 py-8 flex-1">
          <div className="bg-slate-900/60 backdrop-blur rounded-lg shadow-lg p-6 border border-slate-700/60">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
            
            <div className="space-y-6">
              {/* User Email */}
              <div className="border-b border-slate-700/60 pb-4">
                <h2 className="text-lg font-medium mb-2 flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-blue-400" />
                  Email
                </h2>
                
                {isEditingEmail ? (
                  <form onSubmit={handleEmailUpdate} className="space-y-2 mt-3">
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder={currentUser?.email || ""}
                      required
                      className="bg-slate-800 border-slate-700"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading} className="gap-1">
                        <Check className="h-4 w-4" />
                        Save
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditingEmail(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300">{currentUser?.email}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingEmail(true)}
                      className="gap-1 text-slate-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Password Change */}
              <div className="border-b border-slate-700/60 pb-4">
                <h2 className="text-lg font-medium mb-2">Password</h2>
                
                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4 mt-3">
                    <div>
                      <label className="text-sm text-slate-400">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="bg-slate-800 border-slate-700 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-slate-800 border-slate-700 mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading} className="gap-1">
                        <Check className="h-4 w-4" />
                        Update Password
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsChangingPassword(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300">••••••••</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsChangingPassword(true)}
                      className="gap-1 text-slate-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                      Change
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Sign Out */}
              <div className="pt-4 flex justify-end">
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Profile;
