import ProgressBar from "@ramonak/react-progress-bar";
import { profileData } from "../data/profileData";
import { PiForkKnifeFill } from "react-icons/pi";
import {
  FaDroplet,
  FaCarrot,
  FaDumbbell,
  FaPersonRunning,
} from "react-icons/fa6";
import { GiMuscleFat } from "react-icons/gi";
import { useState, useEffect } from "react";

function QuestPage() {
  const { user } = profileData;

  const [healthyFats, setHealthyFats] = useState<number>(0);
  const [veggies, setVeggies] = useState<number>(0);
  const [cardio, setCardio] = useState<number>(0);
  const [strength, setStrength] = useState<number>(0);
  const [groupName, setGroupName] = useState<string | null>(null);

  useEffect(() => {
    const storedGroupName = localStorage.getItem("groupName");
    setGroupName(storedGroupName);
  }, []);

  const handleJoinGroup = () => {
    window.location.href = `/health-quest/group`;
  };

  if (!groupName) {
    return (
      <div
        className="container mt-4 d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <p className="mb-3 text-center" style={{ fontSize: "1.5rem" }}>
          You are not in a group. Please join or create a group to see your
          tasks.
        </p>
        <button className="btn btn-primary" onClick={handleJoinGroup}>
          Join a Group
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5 pb-5">
      <div>
        <div className="card mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <h2 className="m-0">{groupName}</h2>
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
          <ProgressBar
            bgColor="#D85B6A"
            completed={parseFloat(
              (
                ((healthyFats + veggies + cardio + strength) /
                  (12 + 16 + 3 + 3)) *
                100
              ).toFixed(0)
            )}
          />
        </div>
        <div>
          <h4
            className="d-flex align-items-center"
            style={{ color: "#e65100" }}
          >
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
              <b>{healthyFats}/12</b>
            </div>
          </div>
          <ProgressBar
            bgColor="#e65100"
            className="mb-2"
            completed={(healthyFats / 12) * 100}
            isLabelVisible={false}
          />
          <button
            className="btn"
            style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
            onClick={() => {
              setHealthyFats(healthyFats + 1);
            }}
            disabled={healthyFats >= 16}
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
              <b>{veggies}/16</b>
            </div>
          </div>
          <ProgressBar
            bgColor="green"
            className="mb-2"
            completed={(veggies / 16) * 100}
            isLabelVisible={false}
          />
          <button
            className="btn"
            style={{ backgroundColor: "#f0fcf4", color: "green" }}
            onClick={() => {
              setVeggies(veggies + 1);
            }}
            disabled={veggies >= 16}
          >
            + Add Serving
          </button>
        </div>
        <div>
          <h4
            className="d-flex align-items-center"
            style={{ color: "#7b39ec" }}
          >
            <FaDumbbell />
            Fitness
          </h4>
        </div>
        <div className="card mb-3 p-2">
          <div className="d-flex justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <FaPersonRunning style={{ color: "#7b39ec" }} />
              <b>Cardio: 3 Workouts</b>
            </div>
            <b>{cardio}/3</b>
          </div>
          <div></div>
          <ProgressBar
            bgColor="#7b39ec"
            className="mb-2"
            completed={(cardio / 3) * 100}
            isLabelVisible={false}
          />
          <button
            className="btn"
            style={{ backgroundColor: "#f8f4fc", color: "#7b39ec" }}
            onClick={() => {
              setCardio(cardio + 1);
            }}
            disabled={cardio >= 3}
          >
            + Log Workout
          </button>
        </div>
      </div>
      <div className="card mb-3 p-2">
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <GiMuscleFat style={{ color: "#3c82f6" }} /> &nbsp;
            <b>Strength: 3 Workouts</b>
          </div>
          <div>
            <b>{strength}/3</b>
          </div>
        </div>
        <ProgressBar
          bgColor="#3c82f6"
          className="mb-2"
          completed={(strength / 3) * 100}
          isLabelVisible={false}
        />
        <button
          className="btn"
          style={{ backgroundColor: "#f0f4fc", color: "#3c82f6" }}
          onClick={() => {
            setStrength(strength + 1);
          }}
          disabled={strength >= 3}
        >
          + Log Workout
        </button>
      </div>
    </div>
  );
}

export default QuestPage;
