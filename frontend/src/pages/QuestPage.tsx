import ProgressBar from "@ramonak/react-progress-bar";
import { PiForkKnifeFill } from "react-icons/pi";
import {
  FaDroplet,
  FaCarrot,
  FaDumbbell,
  FaPersonRunning,
  FaApple,
} from "react-icons/fa6";
import { GiMuscleFat } from "react-icons/gi";
import { useState, useEffect } from "react";
import CV from "../components/CV";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  getHealthStats,
  updateHealthStats,
  updateCompletionPercentage,
  createCustomGoal,
  updateCustomGoalProgress,
  deleteCustomGoal,
  deleteDefaultGoal,
} from "../firebase/health";
import { getUserGroups, getGroupById } from "../firebase/groups";
import { FirebaseGroup, CustomGoal } from "../firebase/types";
import { Modal, Button, Form } from "react-bootstrap";

function QuestPage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [healthyFats, setHealthyFats] = useState<number | undefined>(0);
  const [veggies, setVeggies] = useState<number | undefined>(0);
  const [cardio, setCardio] = useState<number | undefined>(0);
  const [strength, setStrength] = useState<number | undefined>(0);
  const [group, setGroup] = useState<FirebaseGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
  const [newGoal, setNewGoal] = useState({
    name: "",
    category: "nutrition" as "nutrition" | "fitness",
    icon: "FaApple",
    target: 1,
  });

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
            setHealthyFats(stats.healthyFats || 0);
            setVeggies(stats.veggies || 0);
            setCardio(stats.cardio || 0);
            setStrength(stats.strength || 0);
          } else {
            // Initialize stats if they don't exist
            setHealthyFats(0);
            setVeggies(0);
            setCardio(0);
            setStrength(0);
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

  useEffect(() => {
    if (group && currentUser) {
      const loadCustomGoals = async () => {
        const stats = await getHealthStats(currentUser.uid, group.id);
        if (stats?.customGoals) {
          setCustomGoals(Object.values(stats.customGoals));
        }
      };
      loadCustomGoals();
    }
  }, [group, currentUser]);

  // Function to update health stats in Firebase
  const updateStats = async (
    field: "healthyFats" | "veggies" | "cardio" | "strength",
    value: number
  ) => {
    if (!currentUser || !group) return;

    try {
      setLoading(true);
      setError(null);

      await updateHealthStats(currentUser.uid, group.id, field, value);

      // Update local state with proper type checking
      switch (field) {
        case "healthyFats":
          setHealthyFats((prev) => (prev || 0) + value);
          break;
        case "veggies":
          setVeggies((prev) => (prev || 0) + value);
          break;
        case "cardio":
          setCardio((prev) => (prev || 0) + value);
          break;
        case "strength":
          setStrength((prev) => (prev || 0) + value);
          break;
      }

      // Update completion percentage
      await updateCompletionPercentage(currentUser.uid, group.id);
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      setError(`Failed to update ${field}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = () => {
    navigate("/health-quest/group");
  };

  const handleCreateGoal = async () => {
    if (!currentUser || !group) return;

    try {
      setLoading(true);
      setError(null);

      await createCustomGoal(currentUser.uid, group.id, newGoal);

      // Refresh goals
      const stats = await getHealthStats(currentUser.uid, group.id);
      if (stats?.customGoals) {
        setCustomGoals(Object.values(stats.customGoals));
      }

      setShowNewGoalModal(false);
      setNewGoal({
        name: "",
        category: "nutrition",
        icon: "FaApple",
        target: 1,
      });
    } catch (err) {
      console.error("Error creating goal:", err);
      setError("Failed to create goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoalProgress = async (goalId: string, value: number) => {
    if (!currentUser || !group) return;

    try {
      setLoading(true);
      setError(null);

      await updateCustomGoalProgress(currentUser.uid, group.id, goalId, value);

      // Refresh goals
      const stats = await getHealthStats(currentUser.uid, group.id);
      if (stats?.customGoals) {
        setCustomGoals(Object.values(stats.customGoals));
      }
    } catch (err) {
      console.error("Error updating goal progress:", err);
      setError("Failed to update progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser || !group) return;

    try {
      setLoading(true);
      setError(null);

      await deleteCustomGoal(currentUser.uid, group.id, goalId);

      // Refresh goals
      const stats = await getHealthStats(currentUser.uid, group.id);
      if (stats?.customGoals) {
        setCustomGoals(Object.values(stats.customGoals));
      }
    } catch (err) {
      console.error("Error deleting goal:", err);
      setError("Failed to delete goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDefaultGoal = async (
    field: "healthyFats" | "veggies" | "cardio" | "strength"
  ) => {
    if (!currentUser || !group) return;

    try {
      setLoading(true);
      setError(null);

      await deleteDefaultGoal(currentUser.uid, group.id, field);

      // Update local state to undefined instead of 0
      switch (field) {
        case "healthyFats":
          setHealthyFats(undefined);
          break;
        case "veggies":
          setVeggies(undefined);
          break;
        case "cardio":
          setCardio(undefined);
          break;
        case "strength":
          setStrength(undefined);
          break;
      }

      // Update completion percentage
      await updateCompletionPercentage(currentUser.uid, group.id);
    } catch (err) {
      console.error("Error deleting goal:", err);
      setError("Failed to delete goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalProgress = () => {
    // Default goals
    const hf = healthyFats || 0;
    const vg = veggies || 0;
    const cd = cardio || 0;
    const st = strength || 0;

    // Custom goals
    const customTotal = customGoals.reduce(
      (acc, goal) => acc + (goal.current || 0),
      0
    );
    const customMaxTotal = customGoals.reduce(
      (acc, goal) => acc + goal.target,
      0
    );

    const total = hf + vg + cd + st + customTotal;
    const maxTotal =
      (healthyFats !== undefined ? 12 : 0) +
      (veggies !== undefined ? 16 : 0) +
      (cardio !== undefined ? 3 : 0) +
      (strength !== undefined ? 3 : 0) +
      customMaxTotal;

    return maxTotal === 0 ? 0 : (total / maxTotal) * 100;
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
    <div className="container mt-4 mb-5 pb-5">
      {/* <CV></CV> */}
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
          completed={parseFloat(calculateTotalProgress().toFixed(0))}
        />
      </div>

      <div>
        <h4 className="d-flex align-items-center" style={{ color: "#e65100" }}>
          <PiForkKnifeFill /> &nbsp; Nutrition
          <button
            className="btn btn-sm btn-outline-primary ms-auto"
            onClick={() => {
              setNewGoal({ ...newGoal, category: "nutrition" });
              setShowNewGoalModal(true);
            }}
          >
            + Add Goal
          </button>
        </h4>
      </div>

      {/* Healthy Fats - only show if it exists */}
      {healthyFats !== undefined && healthyFats !== null && (
        <div className="card mb-2 p-2">
          <div className="d-flex justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <FaDroplet style={{ color: "#e65100" }} /> &nbsp;
              <b>Healthy Fats: 12 Servings</b>
            </div>
            <div className="d-flex align-items-center">
              <b>{healthyFats}/12</b>
              <button
                className="btn btn-sm btn-link text-danger ms-2"
                onClick={() => handleDeleteDefaultGoal("healthyFats")}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
          <ProgressBar
            bgColor="#e65100"
            className="mb-2"
            completed={(healthyFats / 12) * 100}
            isLabelVisible={false}
          />
          <div className="d-flex gap-2">
            <button
              className="btn flex-grow-1"
              style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
              onClick={() => updateStats("healthyFats", -1)}
              disabled={loading || healthyFats <= 0}
            >
              - Remove Serving
            </button>
            <button
              className="btn flex-grow-1"
              style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
              onClick={() => updateStats("healthyFats", 1)}
              disabled={loading || healthyFats >= 12}
            >
              + Add Serving
            </button>
          </div>
        </div>
      )}

      {/* Vegetables - only show if it exists */}
      {veggies !== undefined && veggies !== null && (
        <div className="card mb-3 p-2">
          <div className="d-flex justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <FaCarrot style={{ color: "green" }} /> &nbsp;
              <b>Vegetables: 16 Servings</b>
            </div>
            <div className="d-flex align-items-center">
              <b>{veggies}/16</b>
              <button
                className="btn btn-sm btn-link text-danger ms-2"
                onClick={() => handleDeleteDefaultGoal("veggies")}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
          <ProgressBar
            bgColor="green"
            className="mb-2"
            completed={(veggies / 16) * 100}
            isLabelVisible={false}
          />
          <div className="d-flex gap-2">
            <button
              className="btn flex-grow-1"
              style={{ backgroundColor: "#f0fcf4", color: "green" }}
              onClick={() => updateStats("veggies", -1)}
              disabled={loading || veggies <= 0}
            >
              - Remove Serving
            </button>
            <button
              className="btn flex-grow-1"
              style={{ backgroundColor: "#f0fcf4", color: "green" }}
              onClick={() => updateStats("veggies", 1)}
              disabled={loading || veggies >= 16}
            >
              + Add Serving
            </button>
          </div>
        </div>
      )}

      {customGoals
        .filter((goal) => goal.category === "nutrition")
        .map((goal) => (
          <div key={goal.id} className="card mb-3 p-2">
            <div className="d-flex justify-content-between mb-2">
              <div className="d-flex align-items-center">
                <FaApple style={{ color: "#e65100" }} /> &nbsp;
                <b>
                  {goal.name}: {goal.target} Servings
                </b>
              </div>
              <div className="d-flex align-items-center">
                <b>
                  {goal.current}/{goal.target}
                </b>
                <button
                  className="btn btn-sm btn-link text-danger ms-2"
                  onClick={() => handleDeleteGoal(goal.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
            <ProgressBar
              bgColor="#e65100"
              className="mb-2"
              completed={(goal.current / goal.target) * 100}
              isLabelVisible={false}
            />
            <div className="d-flex gap-2">
              <button
                className="btn flex-grow-1"
                style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
                onClick={() => handleCustomGoalProgress(goal.id, -1)}
                disabled={loading || goal.current <= 0}
              >
                - Remove Progress
              </button>
              <button
                className="btn flex-grow-1"
                style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
                onClick={() => handleCustomGoalProgress(goal.id, 1)}
                disabled={loading || goal.current >= goal.target}
              >
                + Add Progress
              </button>
            </div>
          </div>
        ))}

      <div>
        <h4 className="d-flex align-items-center" style={{ color: "#7b39ec" }}>
          <FaDumbbell /> &nbsp; Fitness
          <button
            className="btn btn-sm btn-outline-primary ms-auto"
            onClick={() => {
              setNewGoal({ ...newGoal, category: "fitness" });
              setShowNewGoalModal(true);
            }}
          >
            + Add Goal
          </button>
        </h4>
      </div>

      {/* Cardio - only show if it exists */}
      {cardio !== undefined && cardio !== null && (
        <div className="card mb-3 p-2">
          <div className="d-flex justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <FaPersonRunning style={{ color: "#7b39ec" }} />
              <b>Cardio: 3 Workouts</b>
            </div>
            <div className="d-flex align-items-center">
              <b>{cardio}/3</b>
              <button
                className="btn btn-sm btn-link text-danger ms-2"
                onClick={() => handleDeleteDefaultGoal("cardio")}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
          <ProgressBar
            bgColor="#7b39ec"
            className="mb-2"
            completed={(cardio / 3) * 100}
            isLabelVisible={false}
          />
          <div className="d-flex gap-2">
            <button
              className="btn flex-grow-1"
              style={{ backgroundColor: "#f8f4fc", color: "#7b39ec" }}
              onClick={() => updateStats("cardio", -1)}
              disabled={loading || cardio <= 0}
            >
              - Remove Workout
            </button>
            <button
              className="btn flex-grow-1"
              style={{ backgroundColor: "#f8f4fc", color: "#7b39ec" }}
              onClick={() => updateStats("cardio", 1)}
              disabled={loading || cardio >= 3}
            >
              + Log Workout
            </button>
          </div>
        </div>
      )}

      {/* Strength - only show if it exists */}
      {strength !== undefined && strength !== null && (
        <div className="card mb-3 p-2">
          <div className="d-flex justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <GiMuscleFat style={{ color: "#3c82f6" }} /> &nbsp;
              <b>Strength: 3 Workouts</b>
            </div>
            <div className="d-flex align-items-center">
              <b>{strength}/3</b>
              <button
                className="btn btn-sm btn-link text-danger ms-2"
                onClick={() => handleDeleteDefaultGoal("strength")}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
          <ProgressBar
            bgColor="#3c82f6"
            className="mb-2"
            completed={(strength / 3) * 100}
            isLabelVisible={false}
          />
          <div className="d-flex gap-2">
            <button
              className="btn flex-grow-1"
              style={{ backgroundColor: "#f0f4fc", color: "#3c82f6" }}
              onClick={() => updateStats("strength", -1)}
              disabled={loading || strength <= 0}
            >
              - Remove Workout
            </button>
            <button
              className="btn flex-grow-1"
              style={{ backgroundColor: "#f0f4fc", color: "#3c82f6" }}
              onClick={() => updateStats("strength", 1)}
              disabled={loading || strength >= 3}
            >
              + Log Workout
            </button>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Custom Goals</h4>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewGoalModal(true)}
          >
            Add Goal
          </button>
        </div>
        <div className="list-group list-group-flush">
          {customGoals.map((goal) => (
            <div key={goal.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span
                    className={`me-2 text-${
                      goal.category === "nutrition" ? "success" : "primary"
                    }`}
                  >
                    {goal.category === "nutrition" ? (
                      <FaApple size={24} />
                    ) : (
                      <FaDumbbell size={24} />
                    )}
                  </span>
                  <div>
                    <div className="fw-bold">{goal.name}</div>
                    <div className="text-muted small">
                      Progress: {goal.current}/{goal.target}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn flex-grow-1"
                    style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
                    onClick={() => handleCustomGoalProgress(goal.id, -1)}
                    disabled={loading || goal.current <= 0}
                  >
                    - Remove Progress
                  </button>
                  <button
                    className="btn flex-grow-1"
                    style={{ backgroundColor: "#fff6ed", color: "#e65100" }}
                    onClick={() => handleCustomGoalProgress(goal.id, 1)}
                    disabled={loading || goal.current >= goal.target}
                  >
                    + Add Progress
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal show={showNewGoalModal} onHide={() => setShowNewGoalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Goal Name</Form.Label>
              <Form.Control
                type="text"
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, name: e.target.value })
                }
                placeholder="Enter goal name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={newGoal.category}
                onChange={(e) =>
                  setNewGoal({
                    ...newGoal,
                    category: e.target.value as "nutrition" | "fitness",
                  })
                }
              >
                <option value="nutrition">Nutrition</option>
                <option value="fitness">Fitness</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target (number of times)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={newGoal.target}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, target: parseInt(e.target.value) })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewGoalModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateGoal}
            disabled={loading || !newGoal.name.trim() || newGoal.target < 1}
          >
            {loading ? "Creating..." : "Create Goal"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default QuestPage;
