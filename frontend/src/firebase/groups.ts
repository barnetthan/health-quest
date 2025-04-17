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
    Timestamp,
    deleteDoc
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
      console.log("Generated group code:", groupCode);
      
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
      console.log("Created group with code:", groupCode);
      
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
      // Normalize the code to uppercase
      const normalizedCode = code.toUpperCase();
      console.log("Searching for group with code:", normalizedCode);
      
      const q = query(collection(db, "groups"), where("code", "==", normalizedCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const group = { 
          id: querySnapshot.docs[0].id, 
          ...querySnapshot.docs[0].data() 
        } as FirebaseGroup;
        console.log("Found group:", group.name, "with code:", group.code);
        return group;
      }
      
      console.log("No group found with code:", normalizedCode);
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
      console.log(`Attempting to join group ${groupId} for user ${userId}`);
      
      // First check if the group exists
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        console.error(`Group ${groupId} not found`);
        throw new Error("Group not found");
      }
      
      const groupData = groupDoc.data() as FirebaseGroup;
      console.log(`Found group: ${groupData.name} with code: ${groupData.code}`);
      
      // Check if user is already a member
      if (groupData.members.includes(userId)) {
        console.log(`User ${userId} is already a member of group ${groupId}`);
        return;
      }
      
      // Add user to group members
      console.log(`Adding user ${userId} to group ${groupId}`);
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      
      // Update user's stats
      const userStatsRef = doc(db, "userStats", userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (userStatsDoc.exists()) {
        console.log(`Updating existing user stats for ${userId}`);
        await updateDoc(userStatsRef, {
          totalGroups: increment(1),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create user stats if they don't exist
        console.log(`Creating new user stats for ${userId}`);
        await setDoc(userStatsRef, {
          userId,
          activeGoals: 0,
          completion: 0,
          totalGroups: 1,
          goalsCompleted: 0,
          workoutSessions: 0,
          healthyMeals: 0,
          updatedAt: serverTimestamp()
        });
      }
      
      // Create initial health stats for the user in this group
      const healthStatsRef = doc(db, "healthStats", `${userId}_${groupId}`);
      const healthStatsDoc = await getDoc(healthStatsRef);
      
      if (!healthStatsDoc.exists()) {
        console.log(`Creating health stats for user ${userId} in group ${groupId}`);
        await setDoc(healthStatsRef, {
          userId,
          groupId,
          healthyFats: 0,
          veggies: 0,
          cardio: 0,
          strength: 0,
          customGoals: {},
          updatedAt: serverTimestamp()
        });
      } else {
        console.log(`Health stats already exist for user ${userId} in group ${groupId}`);
      }
      
      console.log(`Successfully joined group ${groupId}`);
    } catch (error) {
      console.error("Error joining group:", error);
      throw error;
    }
  };
  
  // Leave a group
  export const leaveGroup = async (userId: string, groupId: string): Promise<void> => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();
      
      // Remove user from members array
      const updatedMembers = groupData.members.filter((memberId: string) => memberId !== userId);
      
      // If user is the creator, transfer ownership to the next member or delete the group
      if (groupData.createdBy === userId) {
        if (updatedMembers.length > 0) {
          // Transfer ownership to the first remaining member
          await updateDoc(groupRef, {
            members: updatedMembers,
            createdBy: updatedMembers[0],
            updatedAt: serverTimestamp()
          });
        } else {
          // No members left, delete the group
          await deleteDoc(groupRef);
        }
      } else {
        // Just update members list
        await updateDoc(groupRef, {
          members: updatedMembers,
          updatedAt: serverTimestamp()
        });
      }

      // Delete user's goals for this group
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        where('groupId', '==', groupId)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const deletePromises = goalsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user's health stats for this group
      const statsRef = doc(db, 'healthStats', `${userId}_${groupId}`);
      await deleteDoc(statsRef);

    } catch (error) {
      console.error('Error leaving group:', error);
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