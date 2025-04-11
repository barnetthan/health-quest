import { useState } from "react";
import { FitnessModalProps } from "../types.ts";

function LogActivityModal({ setFitnessModalOpen, updateFitnessProgress }: FitnessModalProps) {
  const [strength, setStrength] = useState<number>(0);
  const [cardio, setCardio] = useState<number>(0);
  const [sleep, setSleep] = useState<number>(0);

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
            <h5 className="modal-title">Log Activity</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setFitnessModalOpen(false)}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label htmlFor="strength" className="form-label">
                  Strength Workouts
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="strength"
                  placeholder="Enter number of strength workouts"
                  value={strength === 0 ? "" : strength}
                  onChange={(e) =>
                    setStrength(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="cardio" className="form-label">
                  Cardio Workouts
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="cardio"
                  placeholder="Enter number of cardio workouts"
                  value={cardio === 0 ? "" : cardio}
                  onChange={(e) =>
                    setCardio(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="sleep" className="form-label">
                  Sleep (hours)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="sleep"
                  placeholder="Enter hours of sleep"
                  value={sleep === 0 ? "" : sleep}
                  onChange={(e) =>
                    setSleep(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-danger"
              onClick={() => setFitnessModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={() => {
                // Reuse updateFoodMacros if it handles activity names like "Cardio Workouts"
                updateFitnessProgress(cardio, strength, sleep);
                setFitnessModalOpen(false);
              }}
            >
              Log Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogActivityModal;
