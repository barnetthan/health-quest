import ProgressBar from "@ramonak/react-progress-bar";
import { profileData } from "../data/profileData";
import { PiForkKnifeFill } from "react-icons/pi";
import { FaDroplet, FaCarrot, FaDumbbell, FaPersonRunning } from "react-icons/fa6";
import { GiMuscleFat } from "react-icons/gi";

function QuestPage() {
  const { user } = profileData;

  return (
    <div className="container mt-4 mb-5 pb-5">
      <div className="card mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h2 className="m-0">McFamily</h2>
          <img
            src={user.avatarUrl}
            alt="Profile"
            className="rounded-circle"
            width={35}
            height={35}
          />
        </div>
      </div>
      <div className="mb-4">
        <h4>Family Progress</h4>
        <ProgressBar bgColor="#D85B6A" completed={75} />
      </div>
      <div>
        <h4 className="d-flex align-items-center" style={{ color: "#e65100" }}>
          <PiForkKnifeFill /> &nbsp; Nutrition
        </h4>
      </div>
      <div className="card mb-2 p-2">
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <FaDroplet style={{ color: "#e65100" }} /> &nbsp;
            <b>Healthy Fats: 12 Servings</b>
          </div>
          <div>
            <b>8/12</b>
          </div>
        </div>
        <ProgressBar
          bgColor="#e65100"
          className="mb-2"
          completed={(8 / 12) * 100}
          isLabelVisible={false}
        />
        <button
          className="btn"
          style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
        >
          + Add Serving
        </button>
      </div>
      <div className="card mb-3 p-2">
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <FaCarrot style={{ color: "green" }} /> &nbsp;
            <b>Vegetables: 16 Servings</b>
          </div>
          <div>
            <b>10/16</b>
          </div>
        </div>
        <ProgressBar
          bgColor="green"
          className="mb-2"
          completed={(10 / 16) * 100}
          isLabelVisible={false}
        />
        <button
          className="btn"
          style={{ backgroundColor: "#f0fcf4", color: "green" }}
        >
          + Add Serving
        </button>
      </div>
      <div>
        <h4 className="d-flex align-items-center" style={{ color: "#7b39ec" }}>
          <FaDumbbell />
          &nbsp; Fitness
        </h4>
      </div>
      <div className="card mb-2 p-2">
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <FaPersonRunning style={{ color: "#7b39ec" }} /> &nbsp;
            <b>Cardio: 3 Workouts</b>
          </div>
          <div>
            <b>2/3</b>
          </div>
        </div>
        <ProgressBar
          bgColor="#7b39ec"
          className="mb-2"
          completed={(2/3) * 100}
          isLabelVisible={false}
        />
        <button
          className="btn"
          style={{ backgroundColor: "#f8f4fc", color: "#7b39ec" }}
        >
          + Log Workout
        </button>
      </div>
      <div className="card mb-3 p-2">
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <GiMuscleFat style={{ color: "#3c82f6" }} /> &nbsp;
            <b>Strength: 3 Workouts</b>
          </div>
          <div>
            <b>1/3</b>
          </div>
        </div>
        <ProgressBar
          bgColor="#3c82f6"
          className="mb-2"
          completed={(1/3) * 100}
          isLabelVisible={false}
        />
        <button
          className="btn"
          style={{ backgroundColor: "#f0f4fc", color: "#3c82f6" }}
        >
          + Log Workout
        </button>
      </div>
    </div>
  );
}

export default QuestPage;
