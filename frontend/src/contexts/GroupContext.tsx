import React, { createContext, useContext, useState, useEffect } from 'react';
import { FirebaseGroup } from '../firebase/types';
import { useAuth } from './AuthContext';
import { getUserGroups } from '../firebase/groups';

interface GroupContextType {
  currentGroup: FirebaseGroup | null;
  setCurrentGroup: (group: FirebaseGroup | null) => void;
  userGroups: FirebaseGroup[];
  refreshGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [currentGroup, setCurrentGroup] = useState<FirebaseGroup | null>(null);
  const [userGroups, setUserGroups] = useState<FirebaseGroup[]>([]);

  const refreshGroups = async () => {
    if (currentUser) {
      try {
        const groups = await getUserGroups(currentUser.uid);
        setUserGroups(groups);
        
        // If no current group is set, set the first group as current
        if (!currentGroup && groups.length > 0) {
          setCurrentGroup(groups[0]);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    }
  };

  useEffect(() => {
    refreshGroups();
  }, [currentUser]);

  return (
    <GroupContext.Provider 
      value={{ 
        currentGroup, 
        setCurrentGroup, 
        userGroups,
        refreshGroups
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
} 