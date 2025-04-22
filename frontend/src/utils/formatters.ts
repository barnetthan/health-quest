import { FoodQuest, FitnessQuest } from "../types";

// Helper function to round to 1 decimal place
export const roundToOneDecimal = (num: number) => {
  return Math.round(num * 10) / 10;
};

// Format quest display values
export const formatQuestValue = (quest: FoodQuest | FitnessQuest) => {
  return `${roundToOneDecimal(quest.curAmount)}/${quest.goalAmount}`;
}; 