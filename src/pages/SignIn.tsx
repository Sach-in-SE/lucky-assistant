
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Github, Mail } from 'lucide-react';

const SignIn = () => {
  const { currentUser, signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      navigate('/profile');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Success',
        description: 'You have successfully signed in with Google',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign in with Google',
        variant: 'destructive',
      });
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      toast({
        title: 'Success',
        description: 'You have successfully signed in with GitHub',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign in with GitHub',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="modern-card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Sign In to Lucky's Assistant
        </h1>
        
        <div className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full py-6 bg-slate-800 hover:bg-slate-700 gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Continue with Google
          </Button>
          
          <Button 
            onClick={handleGithubSignIn}
            className="w-full py-6 bg-slate-800 hover:bg-slate-700 gap-2"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </Button>
        </div>
        
        <div className="mt-8 text-center text-sm">
          <p className="text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
