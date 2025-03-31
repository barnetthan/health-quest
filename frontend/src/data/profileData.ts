export interface ProfileData {
  user: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  stats: {
    activeGoals: number;
    completion: number;
    totalGroups: number;
    goalsCompleted: number;
    workoutSessions: number;
    healthyMeals: number;
  };
  groups: {
    name: string;
    members: number;
    status: 'Active' | 'Inactive';
    icon: 'family' | 'dumbbell';
  }[];
}

export const profileData: ProfileData = {
  user: {
    name: "Sarah Johnson",
    username: "@sarahj",
    avatarUrl: "/health-quest/profile.png"
  },
  stats: {
    activeGoals: 12,
    completion: 87,
    totalGroups: 4,
    goalsCompleted: 248,
    workoutSessions: 156,
    healthyMeals: 392
  },
  groups: [
    {
      name: "McFamily",
      members: 5,
      status: "Active",
      icon: "family"
    },
    {
      name: "Gym Buddies",
      members: 3,
      status: "Active",
      icon: "dumbbell"
    }
  ]
}; 