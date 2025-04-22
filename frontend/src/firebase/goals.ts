import {
  doc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";
import { FoodQuest, FitnessQuest } from "../types";

// Create a new food goal
export const createFoodGoal = async (
  userId: string,
  groupId: string,
  goal: FoodQuest
): Promise<string> => {
  try {
    const goalsRef = collection(db, "goals");
    const newGoalRef = doc(goalsRef);

    const goalData = {
      id: newGoalRef.id,
      userId,
      groupId,
      type: "food",
      macro: goal.macro,
      currentAmount: goal.curAmount,
      targetAmount: goal.goalAmount,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newGoalRef, goalData);

    // Update health stats
    const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      await updateDoc(statsRef, {
        [goal.macro.toLowerCase()]: goal.curAmount,
        updatedAt: serverTimestamp(),
      });
    }

    return newGoalRef.id;
  } catch (error) {
    console.error("Error creating food goal:", error);
    throw error;
  }
};

// Create a new fitness goal
export const createFitnessGoal = async (
  userId: string,
  groupId: string,
  goal: FitnessQuest
): Promise<string> => {
  try {
    const goalsRef = collection(db, "goals");
    const newGoalRef = doc(goalsRef);

    const goalData = {
      id: newGoalRef.id,
      userId,
      groupId,
      type: "fitness",
      activity: goal.activity,
      currentAmount: goal.curAmount,
      targetAmount: goal.goalAmount,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newGoalRef, goalData);

    // Update health stats
    const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      await updateDoc(statsRef, {
        [goal.activity.toLowerCase()]: goal.curAmount,
        updatedAt: serverTimestamp(),
      });
    }

    return newGoalRef.id;
  } catch (error) {
    console.error("Error creating fitness goal:", error);
    throw error;
  }
};

// Get all goals for a group
export const getUserGoals = async (
  userId: string,
  groupId: string
): Promise<{
  foodGoals: FoodQuest[];
  fitnessGoals: FitnessQuest[];
}> => {
  try {
    // Query for all goals in the group, not just the current user's
    const q = query(
      collection(db, "goals"),
      where("groupId", "==", groupId)
    );
    const querySnapshot = await getDocs(q);

    const foodGoals: FoodQuest[] = [];
    const fitnessGoals: FitnessQuest[] = [];

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.type === "food") {
        foodGoals.push({
          id: doc.id,
          macro: data.macro,
          curAmount: data.currentAmount,
          goalAmount: data.targetAmount,
        });
      } else {
        fitnessGoals.push({
          id: doc.id,
          activity: data.activity,
          curAmount: data.currentAmount,
          goalAmount: data.targetAmount,
        });
      }
    });

    return { foodGoals, fitnessGoals };
  } catch (error) {
    console.error("Error getting user goals:", error);
    throw error;
  }
};

// Update goal progress
export const updateGoalProgress = async (
  goalId: string,
  currentAmount: number
): Promise<void> => {
  try {
    console.log(`Updating goal ${goalId} to ${currentAmount}`);
    
    const goalRef = doc(db, "goals", goalId);
    const goalDoc = await getDoc(goalRef);
    
    if (!goalDoc.exists()) {
      console.error(`Goal ${goalId} not found`);
      throw new Error("Goal not found");
    }

    const goalData = goalDoc.data();
    const { userId, groupId, type, macro, activity } = goalData;

    // Update goal in goals collection
    await updateDoc(goalRef, {
      currentAmount,
      updatedAt: serverTimestamp(),
    });
    console.log(`Successfully updated goal ${goalId} in database`);

    // Update health stats
    const statsRef = doc(db, "healthStats", `${userId}_${groupId}`);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      const stats = statsDoc.data();
      if (type === "food") {
        // Update food goal in health stats
        await updateDoc(statsRef, {
          [macro.toLowerCase()]: currentAmount,
          updatedAt: serverTimestamp(),
        });
        console.log(`Updated health stats for ${macro} to ${currentAmount}`);
      } else {
        // Update fitness goal in health stats
        await updateDoc(statsRef, {
          [activity.toLowerCase()]: currentAmount,
          updatedAt: serverTimestamp(),
        });
        console.log(`Updated health stats for ${activity} to ${currentAmount}`);
      }
    } else {
      console.warn(`Health stats for user ${userId} in group ${groupId} not found`);
    }
  } catch (error) {
    console.error("Error updating goal progress:", error);
    throw error;
  }
};

// Delete a goal
export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "goals", goalId));
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
};
