import ProgressBar from "@ramonak/react-progress-bar";
import { profileData } from "../data/profileData";
import { PiForkKnifeFill } from "react-icons/pi";
import { FaDumbbell } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import LogFoodModal from "../components/LogFoodModal";
import { FitnessQuest, FoodQuest } from "../types";
import FoodQuestDisplay from "../components/FoodQuestDisplay";
import AddGoalModal from "../components/AddGoalModal";
import FitnessQuestDisplay from "../components/FitnessQuestDisplay";
import LogActivityModal from "../components/LogActivityModal";

function QuestPage() {
  const navigate = useNavigate();
  const { user } = profileData;

  const [foodQuests, setFoodQuests] = useState<FoodQuest[]>([]);
  const [fitnessQuests, setFitnessQuests] = useState<FitnessQuest[]>([]);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [foodModalOpen, setFoodModalOpen] = useState<boolean>(false);
  const [fitnessModalOpen, setFitnessModalOpen] = useState<boolean>(false);
  const [goalModalOpen, setGoalModalOpen] = useState<boolean>(false);

  const totalProgress = foodQuests.reduce((sum, q) => sum + q.curAmount, 0);
  const totalGoal = foodQuests.reduce((sum, q) => sum + q.goalAmount, 0);

  useEffect(() => {
    const storedGroupName = localStorage.getItem("groupName");
    setGroupName(storedGroupName);
  }, []);

  const handleJoinGroup = () => {
    navigate("/health-quest/group");
  };

  const updateFoodMacros = (
    calories: number,
    fat: number,
    protein: number,
    carbs: number
  ) => {
    setFoodQuests((prev) =>
      prev.map((q) => {
        if (q.macro === "Calories") {
          return { ...q, curAmount: q.curAmount + calories };
        } else if (q.macro === "Fat") {
          return { ...q, curAmount: q.curAmount + fat };
        } else if (q.macro === "Protein") {
          return { ...q, curAmount: q.curAmount + protein };
        } else if (q.macro === "Carbs") {
          return { ...q, curAmount: q.curAmount + carbs };
        } else {
          return q;
        }
      })
    );
  };

  const addFoodQuest = (quest: FoodQuest) => {
    setFoodQuests((prev) => [...prev, quest]);
  };

  const updateFitnessProgress = (
    cardio: number,
    strength: number,
    sleep: number
  ) => {
    setFitnessQuests((prev) =>
      prev.map((q) => {
        if (q.activity === "Cardio Workouts") {
          return { ...q, curAmount: q.curAmount + cardio };
        } else if (q.activity === "Strength Workouts") {
          return { ...q, curAmount: q.curAmount + strength };
        } else if (q.activity === "Sleep") {
          return { ...q, curAmount: q.curAmount + sleep };
        } else {
          return q;
        }
      })
    );
  };

  const addFitnessQuest = (quest: FitnessQuest) => {
    setFitnessQuests((prev) => [...prev, quest]);
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
    <>
      {goalModalOpen && (
        <AddGoalModal
          setGoalModalOpen={setGoalModalOpen}
          addFoodQuest={addFoodQuest}
          addFitnessQuest={addFitnessQuest}
        />
      )}

      {foodModalOpen && (
        <LogFoodModal
          setFoodModalOpen={setFoodModalOpen}
          updateFoodMacros={updateFoodMacros}
        />
      )}

      {fitnessModalOpen && (
        <LogActivityModal
          setFitnessModalOpen={setFitnessModalOpen}
          updateFitnessProgress={updateFitnessProgress}
        />
      )}

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
          <div className="mb-2">
            <h4>Family Progress</h4>
            <ProgressBar
              bgColor="#D85B6A"
              completed={
                totalGoal === 0
                  ? 0
                  : Math.round((totalProgress / totalGoal) * 100)
              }
            />
          </div>

          <button
            onClick={() => setGoalModalOpen(true)}
            className="btn w-100 ms-1 mb-3"
            style={{ backgroundColor: "#f0fcf4", color: "green" }}
          >
            + Add Goal
          </button>

          <div>
            <h4
              className="d-flex align-items-center"
              style={{ color: "#e65100" }}
            >
              <PiForkKnifeFill /> &nbsp; Nutrition
            </h4>
          </div>
          <div className="card mb-2 p-2">
            {foodQuests.map((q, index) => (
              <FoodQuestDisplay quest={q} key={index} />
            ))}
            <button
              onClick={() => setFoodModalOpen(true)}
              className="btn me-1"
              style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
            >
              + Log Food
            </button>
          </div>

          <div>
            <h4
              className="d-flex align-items-center"
              style={{ color: "#7b39ec" }}
            >
              <FaDumbbell />
              &nbsp; Fitness
            </h4>
          </div>
          <div className="card mb-2 p-2">
            {fitnessQuests.map((q, index) => (
              <FitnessQuestDisplay quest={q} key={index} />
            ))}
            <button
              onClick={() => setFitnessModalOpen(true)}
              className="btn me-1"
              style={{ backgroundColor: "#f0f4fc", color: "#3c82f6" }}
            >
              + Log Activity
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuestPage;
