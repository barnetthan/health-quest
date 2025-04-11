// src/firebase/health.ts
import { 
    doc, 
    getDoc, 
    updateDoc, 
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
  } from "firebase/firestore";
  import { db } from "./config";
  import { FirebaseHealthStats, FirebaseUserStats } from "./types";
  
  // Get a user's health stats for a specific group
  export const getHealthStats = async (userId: string, groupId: string): Promise<FirebaseHealthStats | null> => {
    try {
      const statsDoc = await getDoc(doc(db, "healthStats", `${userId}_${groupId}`));
      if (statsDoc.exists()) {
        return statsDoc.data() as FirebaseHealthStats;
      }
      return null;
    } catch (error) {
      console.error("Error getting health stats:", error);
      throw error;
    }
  };
  
  // Get all members' health stats for a group
  export const getGroupHealthStats = async (groupId: string): Promise<FirebaseHealthStats[]> => {
    try {
      const q = query(collection(db, "healthStats"), where("groupId", "==", groupId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data() as FirebaseHealthStats);
    } catch (error) {
      console.error("Error getting group health stats:", error);
      throw error;
    }
  };
  
  // Update a user's health stats for a specific group
  export const updateHealthStats = async (
    userId: string, 
    groupId: string, 
    field: "healthyFats" | "veggies" | "cardio" | "strength", 
    increment: number
  ): Promise<void> => {
    try {
      const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
      
      // Update the specific health stat
      await updateDoc(statsRef, {
        [field]: increment,
        updatedAt: serverTimestamp()
      });
      
      // Update user's lifetime stats
      const userStatsRef = doc(db, "userStats", userId);
      
      if (field === "healthyFats" || field === "veggies") {
        await updateDoc(userStatsRef, {
          healthyMeals: increment,
          updatedAt: serverTimestamp()
        });
      } else if (field === "cardio" || field === "strength") {
        await updateDoc(userStatsRef, {
          workoutSessions: increment,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      throw error;
    }
  };
  
  // Get user stats
  export const getUserStats = async (userId: string): Promise<FirebaseUserStats | null> => {
    try {
      const statsDoc = await getDoc(doc(db, "userStats", userId));
      if (statsDoc.exists()) {
        return statsDoc.data() as FirebaseUserStats;
      }
      return null;
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  };
  
  // Update completion percentage based on health stats
  export const updateCompletionPercentage = async (userId: string, groupId: string): Promise<void> => {
    try {
      const healthStats = await getHealthStats(userId, groupId);
      
      if (healthStats) {
        const { healthyFats, veggies, cardio, strength } = healthStats;
        const totalCompleted = healthyFats + veggies + cardio + strength;
        const totalGoals = 12 + 16 + 3 + 3; // Based on your frontend requirements
        const completionPercentage = Math.round((totalCompleted / totalGoals) * 100);
        
        const userStatsRef = doc(db, "userStats", userId);
        await updateDoc(userStatsRef, {
          completion: completionPercentage,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating completion percentage:", error);
      throw error;
    }
  };