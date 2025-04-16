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
    return newGoalRef.id;
  } catch (error) {
    console.error("Error creating fitness goal:", error);
    throw error;
  }
};

// Get all goals for a user in a group
export const getUserGoals = async (
  userId: string,
  groupId: string
): Promise<{
  foodGoals: FoodQuest[];
  fitnessGoals: FitnessQuest[];
}> => {
  try {
    const q = query(
      collection(db, "goals"),
      where("userId", "==", userId),
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
    const goalRef = doc(db, "goals", goalId);
    await updateDoc(goalRef, {
      currentAmount,
      updatedAt: serverTimestamp(),
    });
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
