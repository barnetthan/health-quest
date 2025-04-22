import ProgressBar from "@ramonak/react-progress-bar";
import { FitnessQuest } from "../types";
import { FaPersonRunning } from "react-icons/fa6";
import { GiMuscleFat } from "react-icons/gi";
import { FaBed } from "react-icons/fa";
import { roundToOneDecimal } from "../utils/formatters";

interface FitnessQuestDisplayProps {
  quest: FitnessQuest;
  onDelete: (id: string) => void;
}

const FitnessQuestDisplay = ({ quest, onDelete }: FitnessQuestDisplayProps) => {
  const activityIcon = () => {
    if (quest.activity == "Strength Workouts") {
      return <GiMuscleFat style={{ color: "#7b39ec" }} />;
    } else if (quest.activity == "Cardio Workouts") {
      return <FaPersonRunning style={{ color: "#7b39ec" }} />;
    } else {
      return <FaBed style={{ color: "#7b39ec" }} />;
    }
  };

  const handleDelete = () => {
    if (quest.id) {
      onDelete(quest.id);
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
            {roundToOneDecimal(quest.curAmount)}/{quest.goalAmount}
          </b>
          <button
            className="btn btn-xs btn-danger ms-2 d-flex align-items-center"
            style={{ fontSize: "12px", height: "85%" }}
            onClick={handleDelete}
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
};

export default FitnessQuestDisplay;
