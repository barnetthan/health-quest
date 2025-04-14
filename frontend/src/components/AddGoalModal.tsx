import { useState } from "react";
import { GoalModalProps, FoodQuest, FitnessQuest } from "../types.ts";

function GoalModal({ setGoalModalOpen, addFoodQuest, addFitnessQuest }: GoalModalProps) {
  const [goalType, setGoalType] = useState<"Food" | "Fitness">("Food");

  // Food goal inputs
  const [selectedMacro, setSelectedMacro] = useState("Calories");

  // Fitness goal inputs
  const [selectedFitness, setSelectedFitness] = useState("Strength Workouts");

  const [goalAmount, setGoalAmount] = useState<number>(0);

  return (
    <div
      className="modal show fade"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Goal</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setGoalModalOpen(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Goal Type</label>
              <select
                className="form-select"
                value={goalType}
                onChange={(e) =>
                  setGoalType(e.target.value as "Food" | "Fitness")
                }
              >
                <option value="Food">Food</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>

            {goalType === "Food" ? (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3">
                  <label htmlFor="macro" className="form-label">
                    Macro Type
                  </label>
                  <select
                    className="form-select"
                    id="macro"
                    value={selectedMacro}
                    onChange={(e) => setSelectedMacro(e.target.value)}
                  >
                    <option value="Calories">Calories</option>
                    <option value="Protein">Protein</option>
                    <option value="Fat">Fat</option>
                    <option value="Carbs">Carbs</option>
                  </select>
                </div>
              </form>
            ) : (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3">
                  <label htmlFor="fitness" className="form-label">
                    Fitness Goal
                  </label>
                  <select
                    className="form-select"
                    id="fitness"
                    value={selectedFitness}
                    onChange={(e) => setSelectedFitness(e.target.value)}
                  >
                    <option value="Strength Workouts">Strength Workouts</option>
                    <option value="Cardio Workouts">Cardio Workouts</option>
                    <option value="Sleep">Sleep</option>
                  </select>
                </div>
              </form>
            )}

            <div className="mb-3">
              <label htmlFor="amount" className="form-label">
                Goal Amount{" "}
                {goalType === "Fitness" && selectedFitness === "Sleep"
                  ? "(hours)"
                  : ""}
                {goalType === "Food" && selectedMacro != "Calories"
                  ? "(g)"
                  : ""}
              </label>
              <input
                type="number"
                className="form-control"
                id="amount"
                placeholder="Enter goal amount"
                value={goalAmount === 0 ? "" : goalAmount}
                onChange={(e) =>
                  setGoalAmount(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-danger"
              onClick={() => setGoalModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-success"
              disabled={goalAmount <= 0}
              onClick={() => {
                if (goalType == "Food") {
                  const quest: FoodQuest = {
                    macro: selectedMacro,
                    curAmount: 0,
                    goalAmount: goalAmount,
                  };
                  addFoodQuest(quest);
                } else {
                  const quest: FitnessQuest = {
                    activity: selectedFitness,
                    curAmount: 0,
                    goalAmount: goalAmount,
                  };
                  addFitnessQuest(quest);
                }
                setGoalModalOpen(false);
              }}
            >
              Add Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoalModal;
