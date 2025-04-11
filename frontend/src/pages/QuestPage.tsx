import ProgressBar from "@ramonak/react-progress-bar";
import { PiForkKnifeFill } from "react-icons/pi";
import {
  FaDroplet,
  FaCarrot,
  FaDumbbell,
  FaPersonRunning,
} from "react-icons/fa6";
import { GiMuscleFat } from "react-icons/gi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { getHealthStats, updateHealthStats, updateCompletionPercentage } from "../firebase/health";
import { getUserGroups, getGroupById } from "../firebase/groups";
import { FirebaseGroup, FirebaseHealthStats } from "../firebase/types";

function QuestPage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [healthyFats, setHealthyFats] = useState<number>(0);
  const [veggies, setVeggies] = useState<number>(0);
  const [cardio, setCardio] = useState<number>(0);
  const [strength, setStrength] = useState<number>(0);
  const [group, setGroup] = useState<FirebaseGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Get user's groups
        const groups = await getUserGroups(currentUser.uid);

        if (groups.length === 0) {
          setLoading(false);
          return;
        }

        // Get active group - either from localStorage or first group
        const storedGroupId = localStorage.getItem("activeGroupId");
        const activeGroup = storedGroupId
          ? await getGroupById(storedGroupId)
          : groups[0];

        if (activeGroup) {
          setGroup(activeGroup);
          localStorage.setItem("activeGroupId", activeGroup.id);

          // Get health stats for this group
          const stats = await getHealthStats(currentUser.uid, activeGroup.id);

          if (stats) {
            setHealthyFats(stats.healthyFats);
            setVeggies(stats.veggies);
            setCardio(stats.cardio);
            setStrength(stats.strength);
          }
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

  // Function to update health stats in Firebase
  const updateStats = async (
    field: "healthyFats" | "veggies" | "cardio" | "strength",
    value: number
  ) => {
    if (!currentUser || !group) return;

    try {
      await updateHealthStats(currentUser.uid, group.id, field, value);
      await updateCompletionPercentage(currentUser.uid, group.id);

      // Update local state
      switch (field) {
        case "healthyFats":
          setHealthyFats(healthyFats + value);
          break;
        case "veggies":
          setVeggies(veggies + value);
          break;
        case "cardio":
          setCardio(cardio + value);
          break;
        case "strength":
          setStrength(strength + value);
          break;
      }
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      setError(`Failed to update ${field}. Please try again.`);
    }
  };

  const handleJoinGroup = () => {
    navigate("/health-quest/group");
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
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
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
    <div className="container mt-4 mb-5 pb-5">
      <div>
        <div className="card mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <h2 className="m-0">{group.name}</h2>
            <img
              src={userData?.avatarUrl || "/health-quest/profile.png"}
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
            onClick={() => updateStats("healthyFats", 1)}
            disabled={healthyFats >= 12}
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
            onClick={() => updateStats("veggies", 1)}
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
            onClick={() => updateStats("cardio", 1)}
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
          onClick={() => updateStats("strength", 1)}
          disabled={strength >= 3}
        >
          + Log Workout
        </button>
      </div>
    </div>
  );
}

export default QuestPage;