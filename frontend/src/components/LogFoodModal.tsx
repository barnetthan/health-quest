import { useState } from "react";
import { FoodModalProps } from "../types.ts";

function LogFoodModal({ setFoodModalOpen, updateFoodMacros }: FoodModalProps) {
  const [fatInput, setFatInput] = useState<number>(0);
  const [proteinInput, setProteinInput] = useState<number>(0);
  const [carbInput, setCarbInput] = useState<number>(0);
  const [calorieInput, setCalorieInput] = useState<number>(0);

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
            <h5 className="modal-title">Log Food</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setFoodModalOpen(false)}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label htmlFor="fat" className="form-label">
                  Fat (g)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="fat"
                  placeholder="Enter fat in grams"
                  value={fatInput === 0 ? "" : fatInput}
                  onChange={(e) =>
                    setFatInput(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="protein" className="form-label">
                  Protein (g)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="protein"
                  placeholder="Enter protein in grams"
                  value={proteinInput === 0 ? "" : proteinInput}
                  onChange={(e) =>
                    setProteinInput(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="carbs" className="form-label">
                  Carbohydrates (g)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="carbs"
                  placeholder="Enter carbs in grams"
                  value={carbInput === 0 ? "" : carbInput}
                  onChange={(e) =>
                    setCarbInput(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="mb-3 d-flex align-items-end gap-2">
                <div className="flex-grow-1">
                  <label htmlFor="calories" className="form-label">
                    Calories
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="calories"
                    placeholder="Enter Calories"
                    value={calorieInput === 0 ? "" : calorieInput}
                    onChange={(e) =>
                      setCalorieInput(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-info text-white"
                  onClick={() =>
                    setCalorieInput(
                      fatInput * 9 + proteinInput * 4 + carbInput * 4
                    )
                  }
                >
                  Auto-Calc
                </button>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-danger"
              onClick={() => setFoodModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={() => {
                updateFoodMacros(calorieInput, fatInput, proteinInput, carbInput);
                setFoodModalOpen(false);
              }}
            >
              Log Food
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LogFoodModal;
