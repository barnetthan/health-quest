// src/firebase/auth.ts
import { 
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User as FirebaseAuthUser
  } from "firebase/auth";
  import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
  import { auth, db } from "../firebase/config";
  import { FirebaseUser } from "./types";
  
  // Google provider
  const googleProvider = new GoogleAuthProvider();
  
  // Sign in with Google
  export const signInWithGoogle = async (): Promise<FirebaseAuthUser> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if this is a new user
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Create a new user document in Firestore
        const userData: FirebaseUser = {
          uid: user.uid,
          name: user.displayName || "User",
          username: `@${user.displayName?.toLowerCase().replace(/\s+/g, '') || user.uid.substring(0, 8)}`,
          email: user.email || "",
          avatarUrl: user.photoURL || "/health-quest/profile.png",
          createdAt: serverTimestamp()
        };
        
        await setDoc(doc(db, "users", user.uid), userData);
        
        // Create initial user stats
        await setDoc(doc(db, "userStats", user.uid), {
          userId: user.uid,
          activeGoals: 0,
          completion: 0,
          totalGroups: 0,
          goalsCompleted: 0,
          workoutSessions: 0,
          healthyMeals: 0,
          updatedAt: serverTimestamp()
        });
      }
      
      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };
  
  // Logout user
  export const logoutUser = async (): Promise<void> => {
    return signOut(auth);
  };
  
  // Get user data
  export const getUserData = async (userId: string): Promise<FirebaseUser | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data() as FirebaseUser;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      throw error;
    }
  };

import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/health-quest');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h2 className="mb-4">Welcome to Health Quest</h2>
          <button 
            className="btn btn-primary"
            onClick={handleLogin}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;