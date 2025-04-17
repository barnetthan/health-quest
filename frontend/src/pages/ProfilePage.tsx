import { useState, useEffect } from 'react';
import { IoSettingsOutline, IoChevronBack } from "react-icons/io5";
import { FaFlag, FaDumbbell } from "react-icons/fa";
import { PiUsers } from "react-icons/pi";
import { GiMeal } from "react-icons/gi";
import { AiOutlineTrophy } from "react-icons/ai";
import { useAuth } from '../contexts/AuthContext';
import { EditProfileModal } from '../components/EditProfileModal';
import { SettingsModal } from '../components/SettingsModal';
import { getUserStats, getHealthStats } from '../firebase/health';
import { getUserGroups } from '../firebase/groups';
import { FirebaseUserStats, FirebaseGroup, FirebaseHealthStats } from '../firebase/types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useLocation } from 'react-router-dom';

// Add this helper function to calculate group completion
const calculateGroupCompletion = (stats: FirebaseHealthStats) => {
  const { healthyFats = 0, veggies = 0, cardio = 0, strength = 0, customGoals = {} } = stats;
  
  // Calculate total from default goals
  const defaultTotal = healthyFats + veggies + cardio + strength;
  const defaultMaxTotal = 
    (healthyFats !== undefined ? 12 : 0) + 
    (veggies !== undefined ? 16 : 0) + 
    (cardio !== undefined ? 3 : 0) + 
    (strength !== undefined ? 3 : 0);
  
  // Calculate total from custom goals
  const customTotal = Object.values(customGoals).reduce((acc, goal) => acc + (goal.current || 0), 0);
  const customMaxTotal = Object.values(customGoals).reduce((acc, goal) => acc + goal.target, 0);
  
  // Calculate overall completion percentage
  const totalCompleted = defaultTotal + customTotal;
  const totalGoals = defaultMaxTotal + customMaxTotal;
  
  return totalGoals === 0 ? 0 : Math.round((totalCompleted / totalGoals) * 100);
};

function ProfilePage() {
  const { userData, currentUser } = useAuth();
  const location = useLocation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [stats, setStats] = useState<FirebaseUserStats | null>(null);
  const [groups, setGroups] = useState<FirebaseGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to load user data
  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userStats = await getUserStats(currentUser.uid);
      const userGroups = await getUserGroups(currentUser.uid);
      
      // Calculate total completion across all groups
      let totalCompletion = 0;
      let activeGoalsCount = 0;

      for (const group of userGroups) {
        const groupStats = await getHealthStats(currentUser.uid, group.id);
        if (groupStats) {
          totalCompletion += calculateGroupCompletion(groupStats);
          
          // Count active goals (both default and custom)
          const defaultGoals = [
            'healthyFats' in groupStats && groupStats.healthyFats !== undefined,
            'veggies' in groupStats && groupStats.veggies !== undefined,
            'cardio' in groupStats && groupStats.cardio !== undefined,
            'strength' in groupStats && groupStats.strength !== undefined
          ].filter(Boolean).length;
          
          const customGoalsCount = Object.keys(groupStats.customGoals || {}).length;
          activeGoalsCount += defaultGoals + customGoalsCount;
        }
      }

      // Update stats with calculated values
      const averageCompletion = userGroups.length > 0 
        ? Math.round(totalCompletion / userGroups.length) 
        : 0;

      if (userStats) {
        setStats({
          ...userStats,
          activeGoals: activeGoalsCount,
          completion: averageCompletion
        });
      }
      
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or when currentUser changes
  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  // Refresh data when navigating back to this page
  useEffect(() => {
    // Check if we're navigating back to this page
    if (location.state?.refresh) {
      loadUserData();
    }
  }, [location]);

  if (!userData || !stats) return null;
  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="container mt-4 mb-5 pb-5">
      {/* Header */}
      <div className="card mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <IoChevronBack size={24} className="text-primary" style={{ cursor: 'pointer' }} />
          <h2 className="m-0">Profile</h2>
          <IoSettingsOutline 
            size={24} 
            className="text-primary" 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowSettingsModal(true)}
          />
        </div>
      </div>

      {/* User Info */}
      <div className="card mb-4">
        <div className="card-body text-center position-relative">
          <button
            className="btn btn-link position-absolute top-0 end-0 mt-2 me-2"
            onClick={() => setShowEditModal(true)}
          >
            Edit
          </button>
          <img
            src={userData.avatarUrl}
            alt="Profile"
            className="rounded-circle mb-3"
            width={100}
            height={100}
          />
          <h3 className="mb-1">{userData.name}</h3>
          <p className="text-primary">{userData.username}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="row mb-4 g-3">
        <div className="col-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3 className="text-success mb-2">{stats.activeGoals}</h3>
              <div className="text-muted small">Active Goals</div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3 className="text-primary mb-2">{stats.completion}%</h3>
              <div className="text-muted small">Completion</div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3 className="text-warning mb-2">{stats.totalGroups}</h3>
              <div className="text-muted small">Groups</div>
            </div>
          </div>
        </div>
      </div>

      {/* My Groups */}
      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">My Groups</h5>
        </div>
        <div className="list-group list-group-flush">
          {groups.map((group) => (
            <div key={group.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                {group.icon === 'family' ? (
                  <PiUsers size={24} className="text-primary me-2" />
                ) : (
                  <FaDumbbell size={24} className="text-danger me-2" />
                )}
                <span>{group.name}</span>
              </div>
              <div>
                <span className="badge bg-primary me-2">{group.members.length} members</span>
                <span className="badge bg-success">{group.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0">Lifetime Stats</h5>
        </div>
        <div className="list-group list-group-flush">
          <div className="list-group-item d-flex align-items-center">
            <AiOutlineTrophy className="text-warning me-3" size={28} />
            <div>
              <div className="fw-bold">Goals Completed</div>
              <div className="text-success">{stats.goalsCompleted}</div>
            </div>
          </div>
          <div className="list-group-item d-flex align-items-center">
            <FaFlag className="text-danger me-3" size={28} />
            <div>
              <div className="fw-bold">Workout Sessions</div>
              <div className="text-success">{stats.workoutSessions}</div>
            </div>
          </div>
          <div className="list-group-item d-flex align-items-center">
            <GiMeal className="text-primary me-3" size={28} />
            <div>
              <div className="fw-bold">Healthy Meals</div>
              <div className="text-success">{stats.healthyMeals}</div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        currentName={userData.name}
        currentUsername={userData.username}
        currentAvatar={userData.avatarUrl}
        onUpdate={() => {
          // Refresh user data if needed
          window.location.reload();
        }}
      />

      <SettingsModal
        show={showSettingsModal}
        onHide={() => setShowSettingsModal(false)}
      />
    </div>
  );
}

export default ProfilePage;
