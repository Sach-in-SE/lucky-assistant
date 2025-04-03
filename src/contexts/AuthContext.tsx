
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Auth,
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextProps {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
}

export interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLogin: string;
  bio?: string;
  location?: string;
  website?: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or update user document in Firestore
  const createUserDocument = async (user: User) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    const timestamp = new Date().toISOString();
    
    if (!userSnap.exists()) {
      // Create a new user document
      const newUser: UserData = {
        uid: user.uid,
        displayName: user.displayName || "Anonymous User",
        email: user.email,
        photoURL: user.photoURL,
        createdAt: timestamp,
        lastLogin: timestamp,
      };
      
      await setDoc(userRef, newUser);
      setUserData(newUser);
    } else {
      // Update last login
      const existingUser = userSnap.data() as UserData;
      await updateDoc(userRef, { lastLogin: timestamp });
      setUserData({...existingUser, lastLogin: timestamp});
    }
  };
  
  // Fetch user data from Firestore
  const fetchUserData = async (user: User) => {
    if (!user) return null;
    
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserData;
      setUserData(userData);
      return userData;
    }
    
    return null;
  };
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };
  
  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
      throw error;
    }
  };
  
  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user);
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };
  
  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with the display name
      if (result.user) {
        await firebaseUpdateProfile(result.user, {
          displayName: displayName
        });
        
        // Refresh the user to get the updated profile
        const updatedUser = auth.currentUser;
        if (updatedUser) {
          await createUserDocument(updatedUser);
        }
      }
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { ...data });
      
      // Update display name in Firebase Auth if provided
      if (data.displayName && currentUser) {
        await firebaseUpdateProfile(currentUser, {
          displayName: data.displayName
        });
      }
      
      // Update local state
      setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const value: AuthContextProps = {
    currentUser,
    userData,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
