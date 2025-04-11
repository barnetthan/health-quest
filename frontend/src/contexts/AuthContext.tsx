// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserData } from '../firebase/auth';
import { FirebaseUser } from '../firebase/types';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextProps {
  currentUser: FirebaseAuthUser | null;
  userData: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  userData: null,
  loading: true
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const [userData, setUserData] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}