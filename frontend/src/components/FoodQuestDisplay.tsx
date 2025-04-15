import ProgressBar from "@ramonak/react-progress-bar";
import { FoodQuest } from "../types.ts";
import { FaDroplet } from "react-icons/fa6";
import { FaFire } from "react-icons/fa";
import { GiMeat } from "react-icons/gi";
import { PiBreadFill } from "react-icons/pi";

function FoodQuestDisplay({ quest, i, deleteFoodQuest }: { quest: FoodQuest, i: number, deleteFoodQuest: Function }) {
  const foodIcon = () => {
    if (quest.macro == "Protein") {
      return <GiMeat style={{ color: "#e65100" }} />;
    } else if (quest.macro == "Fat") {
      return <FaDroplet style={{ color: "#e65100" }} />;
    } else if (quest.macro == "Carbs") {
      return <PiBreadFill style={{ color: "#e65100" }} />;
    } else {
      return <FaFire style={{ color: "#e65100" }} />;
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <div className="d-flex align-items-center">
          {foodIcon()} &nbsp;
          <b>
            {quest.macro}: {quest.goalAmount}{" "}
            {quest.macro == "Calories" ? "" : "Grams"}
          </b>
        </div>
        <div className="d-flex align-items-center">
          <b>
            {quest.curAmount}/{quest.goalAmount}
          </b>
          <button
            className="btn btn-xs btn-danger ms-2 d-flex align-items-center"
            style={{ fontSize: "12px", height: "85%" }}
            onClick={() => {deleteFoodQuest(i)}}
          >
            Delete
          </button>
        </div>
      </div>
      <ProgressBar
        bgColor="#e65100"
        className="mb-2"
        completed={(quest.curAmount / quest.goalAmount) * 100}
        isLabelVisible={false}
      />
    </>
  );
}
export default FoodQuestDisplay;
