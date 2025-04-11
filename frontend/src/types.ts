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
  macro: string;
  curAmount: number;
  goalAmount: number;
}

export interface FitnessQuest {
  activity: string;
  curAmount: number;
  goalAmount: number;
}