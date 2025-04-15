import ProgressBar from "@ramonak/react-progress-bar";
import { FitnessQuest } from "../types.ts";
import { FaPersonRunning } from "react-icons/fa6";
import { GiMuscleFat } from "react-icons/gi";
import { FaBed } from "react-icons/fa";

function FitnessQuestDisplay({ quest, i, deleteFitnessQuest }: { quest: FitnessQuest, i: number, deleteFitnessQuest: Function }) {
  const activityIcon = () => {
    if (quest.activity == "Strength Workouts") {
      return <GiMuscleFat style={{ color: "#7b39ec" }} />;
    } else if (quest.activity == "Cardio Workouts") {
      return <FaPersonRunning style={{ color: "#7b39ec" }} />;
    } else {
      return <FaBed style={{ color: "#7b39ec" }} />;
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <div className="d-flex align-items-center">
          {activityIcon()} &nbsp;
          <b>
            {quest.activity}: {quest.goalAmount}{" "}
            {quest.activity == "Sleep" ? "Hours" : "Workouts"}
          </b>
        </div>
        <div className="d-flex align-items-center">
          <b>
            {quest.curAmount}/{quest.goalAmount}
          </b>
          <button
            className="btn btn-xs btn-danger ms-2 d-flex align-items-center"
            style={{ fontSize: "12px", height: "85%" }}
            onClick={() => {deleteFitnessQuest(i)}}
          >
            Delete
          </button>
        </div>
      </div>
      <ProgressBar
        bgColor="#7b39ec"
        className="mb-2"
        completed={(quest.curAmount / quest.goalAmount) * 100}
        isLabelVisible={false}
      />
    </>
  );
}
export default FitnessQuestDisplay;
