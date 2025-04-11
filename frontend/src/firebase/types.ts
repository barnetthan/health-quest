// src/firebase/types.ts
import { Timestamp } from "firebase/firestore";

export interface FirebaseUser {
  uid: string;
  name: string;
  username: string;
  avatarUrl: string;
  email: string;
  createdAt: Timestamp;
}

export interface FirebaseGroup {
  id: string;
  name: string;
  code: string;
  icon: "family" | "dumbbell";
  createdBy: string; // User ID of creator
  createdAt: Timestamp;
  members: string[]; // Array of user IDs
  status: "Active" | "Inactive";
}

export interface FirebaseHealthStats {
  userId: string;
  groupId: string;
  healthyFats: number;
  veggies: number;
  cardio: number;
  strength: number;
  updatedAt: Timestamp;
}

export interface FirebaseUserStats {
  userId: string;
  activeGoals: number;
  completion: number;
  totalGroups: number;
  goalsCompleted: number;
  workoutSessions: number;
  healthyMeals: number;
  updatedAt: Timestamp;
}