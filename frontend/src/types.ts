export interface GoalModalProps {
  setGoalModalOpen: Function;
  addFoodQuest: Function;
  addFitnessQuest: Function;
}

export interface FoodModalProps {
  setFoodModalOpen: Function;
  updateFoodMacros: Function;
}

export interface FitnessModalProps {
  setFitnessModalOpen: Function;
  updateFitnessProgress: Function;
}

export interface FoodQuest {
  id?: string;
  macro: string;
  curAmount: number;
  goalAmount: number;
}

export interface FitnessQuest {
  id?: string;
  activity: string;
  curAmount: number;
  goalAmount: number;
}