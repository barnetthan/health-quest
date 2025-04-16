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
    increment,
    Timestamp
  } from "firebase/firestore";
  import { db } from "./config";
  import { FirebaseGroup, GroupInvite } from "./types";
  
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
        createdAt: Timestamp.fromDate(new Date()),
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

  // Invite user to group
  export const inviteToGroup = async (
    groupId: string,
    invitedUserId: string,
    invitedBy: string
  ): Promise<string> => {
    try {
      const invitesRef = collection(db, 'groupInvites');
      const newInviteRef = doc(invitesRef);
      
      const invite: GroupInvite = {
        id: newInviteRef.id,
        groupId,
        invitedBy,
        invitedUserId,
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date())
      };

      await setDoc(newInviteRef, invite);
      return newInviteRef.id;
    } catch (error) {
      console.error('Error creating invite:', error);
      throw error;
    }
  };

  // Handle group invite response
  export const handleGroupInvite = async (
    inviteId: string,
    status: 'accepted' | 'rejected',
    userId: string
  ): Promise<void> => {
    try {
      const inviteRef = doc(db, 'groupInvites', inviteId);
      const invite = await getDoc(inviteRef);
      
      if (!invite.exists()) throw new Error('Invite not found');
      
      const inviteData = invite.data() as GroupInvite;
      
      if (inviteData.invitedUserId !== userId) {
        throw new Error('Unauthorized');
      }

      await updateDoc(inviteRef, { status });

      if (status === 'accepted') {
        await joinGroup(inviteData.groupId, userId);
      }
    } catch (error) {
      console.error('Error handling invite:', error);
      throw error;
    }
  };

  // Get pending invites for a user
  export const getPendingInvites = async (userId: string): Promise<GroupInvite[]> => {
    try {
      const q = query(
        collection(db, 'groupInvites'),
        where('invitedUserId', '==', userId),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GroupInvite));
    } catch (error) {
      console.error('Error getting pending invites:', error);
      throw error;
    }
  };