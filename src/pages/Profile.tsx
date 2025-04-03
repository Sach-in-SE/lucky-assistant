import React, { useState } from 'react';
import { useAuth, UserData } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';

const Background = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-950/70 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-circuit-pattern opacity-20" />
      </div>
    </div>
  );
};

const Profile = () => {
  const { userData, updateUserProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<UserData>>({
    displayName: userData?.displayName || '',
    bio: userData?.bio || '',
    location: userData?.location || '',
    website: userData?.website || '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen">
        <Background />
        
        <Header />
        
        <div className="container max-w-4xl mx-auto p-4 pt-8 flex-1 overflow-y-auto">
          <div className="modern-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Profile</h1>
              <Button 
                variant="outline" 
                onClick={signOut} 
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-2 border-blue-500/30">
                    {userData?.photoURL ? (
                      <img 
                        src={userData.photoURL} 
                        alt={userData.displayName || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-3xl font-bold">
                        {userData?.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-lg font-medium text-center">
                  {userData?.displayName || 'Anonymous User'}
                </p>
                <p className="text-sm text-slate-400 text-center">
                  {userData?.email || ''}
                </p>
              </div>
              
              {/* Profile Details Section */}
              <div className="md:col-span-2">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        name="displayName"
                        value={formData.displayName || ''}
                        onChange={handleChange}
                        className="glass-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        rows={3}
                        className="glass-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        className="glass-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website || ''}
                        onChange={handleChange}
                        className="glass-input"
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Display Name</h3>
                      <p className="mt-1 text-lg">
                        {userData?.displayName || 'Anonymous User'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Bio</h3>
                      <p className="mt-1">
                        {userData?.bio || 'No bio provided.'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Location</h3>
                      <p className="mt-1">
                        {userData?.location || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Website</h3>
                      <p className="mt-1">
                        {userData?.website ? (
                          <a 
                            href={userData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {userData.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Profile;
