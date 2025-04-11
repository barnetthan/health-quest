// src/firebase/groups.ts
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    arrayUnion, 
    arrayRemove, 
    updateDoc, 
    serverTimestamp,
    increment
  } from "firebase/firestore";
  import { db } from "./config";
  import { FirebaseGroup } from "./types";
  
  // Generate a random group code
  const generateGroupCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };
  
  // Create a new group
  export const createGroup = async (
    name: string, 
    userId: string, 
    icon: "family" | "dumbbell" = "family"
  ): Promise<string> => {
    try {
      // Generate a unique group code
      const groupCode = generateGroupCode();
      
      // Create a new group document
      const groupRef = doc(collection(db, "groups"));
      const groupId = groupRef.id;
      
      const groupData: FirebaseGroup = {
        id: groupId,
        name,
        code: groupCode,
        icon,
        createdBy: userId,
        createdAt: serverTimestamp(),
        members: [userId],
        status: "Active"
      };
      
      await setDoc(groupRef, groupData);
      
      // Update user's stats to increment totalGroups
      const userStatsRef = doc(db, "userStats", userId);
      await updateDoc(userStatsRef, {
        totalGroups: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Create initial health stats for the user in this group
      await setDoc(doc(db, "healthStats", `${userId}_${groupId}`), {
        userId,
        groupId,
        healthyFats: 0,
        veggies: 0,
        cardio: 0,
        strength: 0,
        updatedAt: serverTimestamp()
      });
      
      return groupId;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };
  
  // Get a group by ID
  export const getGroupById = async (groupId: string): Promise<FirebaseGroup | null> => {
    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (groupDoc.exists()) {
        return groupDoc.data() as FirebaseGroup;
      }
      return null;
    } catch (error) {
      console.error("Error getting group:", error);
      throw error;
    }
  };
  
  // Get a group by code
  export const getGroupByCode = async (code: string): Promise<FirebaseGroup | null> => {
    try {
      const q = query(collection(db, "groups"), where("code", "==", code));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { 
          id: querySnapshot.docs[0].id, 
          ...querySnapshot.docs[0].data() 
        } as FirebaseGroup;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting group by code:", error);
      throw error;
    }
  };
  
  // Get all groups for a user
  export const getUserGroups = async (userId: string): Promise<FirebaseGroup[]> => {
    try {
      const q = query(collection(db, "groups"), where("members", "array-contains", userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseGroup));
    } catch (error) {
      console.error("Error getting user groups:", error);
      throw error;
    }
  };
  
  // Join a group
  export const joinGroup = async (groupId: string, userId: string): Promise<void> => {
    try {
      // Add user to group members
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(userId)
      });
      
      // Update user's stats
      const userStatsRef = doc(db, "userStats", userId);
      await updateDoc(userStatsRef, {
        totalGroups: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Create initial health stats for the user in this group
      await setDoc(doc(db, "healthStats", `${userId}_${groupId}`), {
        userId,
        groupId,
        healthyFats: 0,
        veggies: 0,
        cardio: 0,
        strength: 0,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error joining group:", error);
      throw error;
    }
  };
  
  // Leave a group
  export const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
    try {
      // Remove user from group members
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(userId)
      });
      
      // Update user's stats
      const userStatsRef = doc(db, "userStats", userId);
      await updateDoc(userStatsRef, {
        totalGroups: increment(-1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      throw error;
    }
  };