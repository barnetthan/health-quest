// src/firebase/health.ts
import { 
    doc, 
    getDoc, 
    updateDoc, 
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    increment,
    deleteField
  } from "firebase/firestore";
  import { db } from "./config";
  import { FirebaseHealthStats, FirebaseUserStats } from "./types";
  import { CustomGoal } from "./types";
  import { Timestamp } from "firebase/firestore";
  
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
    value: number
  ): Promise<void> => {
    try {
      const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
      const statsDoc = await getDoc(statsRef);

      if (!statsDoc.exists()) {
        // Create initial stats if they don't exist
        await setDoc(statsRef, {
          userId,
          groupId,
          [field]: value,
          customGoals: {},
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing stats
        const currentStats = statsDoc.data();
        await updateDoc(statsRef, {
          [field]: (currentStats[field] || 0) + value,
          updatedAt: serverTimestamp()
        });
      }

      // Update user's lifetime stats
      const userStatsRef = doc(db, "userStats", userId);
      const userStatsDoc = await getDoc(userStatsRef);

      if (userStatsDoc.exists()) {
        if (field === "healthyFats" || field === "veggies") {
          await updateDoc(userStatsRef, {
            healthyMeals: increment(value),
            updatedAt: serverTimestamp()
          });
        } else if (field === "cardio" || field === "strength") {
          await updateDoc(userStatsRef, {
            workoutSessions: increment(value),
            updatedAt: serverTimestamp()
          });
        }
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
        const { healthyFats = 0, veggies = 0, cardio = 0, strength = 0, customGoals = {} } = healthStats;
        
        // Calculate total from default goals
        const defaultTotal = healthyFats + veggies + cardio + strength;
        const defaultMaxTotal = 
          (healthyFats !== undefined ? 12 : 0) + 
          (veggies !== undefined ? 16 : 0) + 
          (cardio !== undefined ? 3 : 0) + 
          (strength !== undefined ? 3 : 0);
        
        // Calculate total from custom goals
        const customTotal = Object.values(customGoals).reduce((acc, goal) => acc + (goal.current || 0), 0);
        const customMaxTotal = Object.values(customGoals).reduce((acc, goal) => acc + goal.target, 0);
        
        // Calculate overall completion percentage
        const totalCompleted = defaultTotal + customTotal;
        const totalGoals = defaultMaxTotal + customMaxTotal;
        const completionPercentage = totalGoals === 0 ? 0 : Math.round((totalCompleted / totalGoals) * 100);
        
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

  // Create a new custom goal
  export const createCustomGoal = async (
    userId: string,
    groupId: string,
    goal: Omit<CustomGoal, 'id' | 'current' | 'createdAt'>
  ): Promise<string> => {
    try {
      const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
      const statsDoc = await getDoc(statsRef);
      
      const goalId = Math.random().toString(36).substring(2, 15);
      const newGoal: CustomGoal = {
        ...goal,
        id: goalId,
        current: 0,
        createdAt: Timestamp.fromDate(new Date())
      };

      if (!statsDoc.exists()) {
        // Create new stats document with custom goal
        await setDoc(statsRef, {
          userId,
          groupId,
          customGoals: {
            [goalId]: newGoal
          },
          updatedAt: serverTimestamp()
        });
      } else {
        // Add custom goal to existing stats
        await updateDoc(statsRef, {
          [`customGoals.${goalId}`]: newGoal,
          updatedAt: serverTimestamp()
        });
      }

      return goalId;
    } catch (error) {
      console.error("Error creating custom goal:", error);
      throw error;
    }
  };

  // Update progress for a custom goal
  export const updateCustomGoalProgress = async (
    userId: string,
    groupId: string,
    goalId: string,
    value: number
  ): Promise<void> => {
    try {
      const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
      const statsDoc = await getDoc(statsRef);

      if (!statsDoc.exists()) {
        throw new Error("Health stats not found");
      }

      const stats = statsDoc.data() as FirebaseHealthStats;
      const goal = stats.customGoals?.[goalId];
      
      if (!goal) {
        throw new Error("Goal not found");
      }

      await updateDoc(statsRef, {
        [`customGoals.${goalId}.current`]: (goal.current || 0) + value,
        updatedAt: serverTimestamp()
      });

      // Update user's lifetime stats based on category
      const userStatsRef = doc(db, "userStats", userId);
      await updateDoc(userStatsRef, {
        [goal.category === 'nutrition' ? 'healthyMeals' : 'workoutSessions']: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating custom goal progress:", error);
      throw error;
    }
  };

  // Delete a custom goal
  export const deleteCustomGoal = async (
    userId: string,
    groupId: string,
    goalId: string
  ): Promise<void> => {
    try {
      const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
      
      await updateDoc(statsRef, {
        [`customGoals.${goalId}`]: deleteField(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error deleting custom goal:", error);
      throw error;
    }
  };

  // Add this new function
  export const deleteDefaultGoal = async (
    userId: string,
    groupId: string,
    field: "healthyFats" | "veggies" | "cardio" | "strength"
  ): Promise<void> => {
    try {
      const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
      const statsDoc = await getDoc(statsRef);

      if (!statsDoc.exists()) {
        throw new Error("Health stats not found");
      }

      // Delete the field entirely instead of resetting to 0
      await updateDoc(statsRef, {
        [field]: deleteField(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error deleting default goal:", error);
      throw error;
    }
  };