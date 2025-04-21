import ProgressBar from "@ramonak/react-progress-bar";
import { PiForkKnifeFill } from "react-icons/pi";
import { FaDumbbell } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { getUserGroups, getGroupById, leaveGroup } from "../firebase/groups";
import { FirebaseGroup } from "../firebase/types";
import FitnessQuestDisplay from "../components/FitnessQuestDisplay";
import { FitnessQuest, FoodQuest } from "../types";
import LogActivityModal from "../components/LogActivityModal";
import LogFoodModal from "../components/LogFoodModal";
import AddGoalModal from "../components/AddGoalModal";
import FoodQuestDisplay from "../components/FoodQuestDisplay";
import {
  updateGoalProgress,
  deleteGoal,
  getUserGoals,
} from "../firebase/goals";

function QuestPage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<FirebaseGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [foodQuests, setFoodQuests] = useState<FoodQuest[]>([]);
  const [fitnessQuests, setFitnessQuests] = useState<FitnessQuest[]>([]);
  const [foodModalOpen, setFoodModalOpen] = useState<boolean>(false);
  const [fitnessModalOpen, setFitnessModalOpen] = useState<boolean>(false);
  const [goalModalOpen, setGoalModalOpen] = useState<boolean>(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Calculate total progress using percentages
  const calculateTotalProgress = () => {
    // Calculate food quest percentages
    const foodPercentages = foodQuests.map((q) =>
      q.goalAmount > 0 ? (q.curAmount / q.goalAmount) * 100 : 0
    );

    // Calculate fitness quest percentages
    const fitnessPercentages = fitnessQuests.map((q) =>
      q.goalAmount > 0 ? (q.curAmount / q.goalAmount) * 100 : 0
    );

    // Combine all percentages
    const allPercentages = [...foodPercentages, ...fitnessPercentages];

    // Calculate average percentage
    if (allPercentages.length === 0) return 0;
    const totalPercentage = allPercentages.reduce((sum, p) => sum + p, 0);
    return Math.round(totalPercentage / allPercentages.length);
  };

  const totalProgress = calculateTotalProgress();

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's groups
        const groups = await getUserGroups(currentUser.uid);

        if (groups.length === 0) {
          setLoading(false);
          setGroup(null);
          setFoodQuests([]);
          setFitnessQuests([]);
          localStorage.removeItem("activeGroupId");
          return;
        }

        // Get active group - either from localStorage or first group
        const storedGroupId = localStorage.getItem("activeGroupId");
        let activeGroup = null;

        if (storedGroupId) {
          // Verify if the stored group still exists in user's groups
          activeGroup = groups.find(g => g.id === storedGroupId);
          if (!activeGroup) {
            localStorage.removeItem("activeGroupId");
            activeGroup = groups[0];
          }
        } else {
          activeGroup = groups[0];
        }

        if (activeGroup) {
          setGroup(activeGroup);
          localStorage.setItem("activeGroupId", activeGroup.id);

          // Get goals for this group
          const { foodGoals, fitnessGoals } = await getUserGoals(
            currentUser.uid,
            activeGroup.id
          );
          setFoodQuests(foodGoals);
          setFitnessQuests(fitnessGoals);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleJoinGroup = () => {
    navigate("/health-quest/group");
  };

  const handleLeaveGroup = async () => {
    if (!currentUser || !group) return;
    
    try {
      setIsLeaving(true);
      await leaveGroup(currentUser.uid, group.id);
      localStorage.removeItem("activeGroupId");
      
      // Clear local state
      setGroup(null);
      setFoodQuests([]);
      setFitnessQuests([]);
      
      // Navigate to group page with refresh flag
      navigate("/health-quest/group", { 
        state: { refresh: true },
        replace: true 
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      setError("Failed to leave group. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  const updateFoodMacros = async (
    calories: number,
    fat: number,
    protein: number,
    carbs: number
  ) => {
    // Update local state
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

    // Update database
    try {
      for (const quest of foodQuests) {
        if (quest.id) {
          let amountToAdd = 0;
          if (quest.macro === "Calories") amountToAdd = calories;
          else if (quest.macro === "Fat") amountToAdd = fat;
          else if (quest.macro === "Protein") amountToAdd = protein;
          else if (quest.macro === "Carbs") amountToAdd = carbs;

          if (amountToAdd > 0) {
            await updateGoalProgress(quest.id, quest.curAmount + amountToAdd);
          }
        }
      }
    } catch (error) {
      console.error("Error updating food goals in database:", error);
      // Optionally show an error message to the user
    }
  };

  const addFoodQuest = (quest: FoodQuest) => {
    setFoodQuests((prev) => [...prev, quest]);
  };

  const deleteFoodQuest = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setFoodQuests((prev) => prev.filter((q) => q.id !== goalId));
    } catch (error) {
      console.error("Error deleting food goal:", error);
      setError("Failed to delete goal. Please try again.");
    }
  };

  const updateFitnessProgress = async (
    cardio: number,
    strength: number,
    sleep: number
  ) => {
    // Update local state
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

    // Update database
    try {
      for (const quest of fitnessQuests) {
        if (quest.id) {
          let amountToAdd = 0;
          if (quest.activity === "Cardio Workouts") amountToAdd = cardio;
          else if (quest.activity === "Strength Workouts")
            amountToAdd = strength;
          else if (quest.activity === "Sleep") amountToAdd = sleep;

          if (amountToAdd > 0) {
            await updateGoalProgress(quest.id, quest.curAmount + amountToAdd);
          }
        }
      }
    } catch (error) {
      console.error("Error updating fitness goals in database:", error);
      // Optionally show an error message to the user
    }
  };

  const addFitnessQuest = (quest: FitnessQuest) => {
    setFitnessQuests((prev) => [...prev, quest]);
  };

  const deleteFitnessQuest = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setFitnessQuests((prev) => prev.filter((q) => q.id !== goalId));
    } catch (error) {
      console.error("Error deleting fitness goal:", error);
      setError("Failed to delete goal. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        className="container mt-4 d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <p className="text-center">Loading your health quest data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container mt-4 d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!group) {
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
        <div className="card mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <h2 className="m-0">{group.name}</h2>
            <div className="d-flex align-items-center gap-3">
              <img
                src={userData?.avatarUrl || "/health-quest/profile.png"}
                alt="Profile"
                className="rounded-circle"
                width={35}
                height={35}
              />
              <button
                className="btn btn-outline-danger"
                onClick={handleLeaveGroup}
                disabled={isLeaving}
              >
                {isLeaving ? "Leaving..." : "Leave Group"}
              </button>
            </div>
          </div>
        </div>
        <div className="mb-2">
          <h4>Family Progress</h4>
          <ProgressBar bgColor="#D85B6A" completed={totalProgress} />
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
            <FoodQuestDisplay
              quest={q}
              onDelete={deleteFoodQuest}
              key={q.id || index}
            />
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
            <FitnessQuestDisplay
              quest={q}
              onDelete={deleteFitnessQuest}
              key={q.id || index}
            />
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
    </>
  );
}

export default QuestPage;
