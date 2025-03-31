import { IoSettingsOutline, IoChevronBack } from "react-icons/io5";
import { FaFlag, FaDumbbell } from "react-icons/fa";
import { PiUsers } from "react-icons/pi";
import { GiMeal } from "react-icons/gi";
import { AiOutlineTrophy } from "react-icons/ai";
import { profileData } from "../data/profileData";

function ProfilePage() {
  const { user, stats, groups } = profileData;

  return (
    <div className="container mt-4 mb-5 pb-5">
      {/* Header */}
      <div className="card mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <IoChevronBack size={24} className="text-primary" style={{ cursor: 'pointer' }} />
          <h2 className="m-0">Profile</h2>
          <IoSettingsOutline size={24} className="text-primary" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* User Info */}
      <div className="card mb-4">
        <div className="card-body text-center">
          <img
            src={user.avatarUrl}
            alt="Profile"
            className="rounded-circle mb-3"
            width={100}
            height={100}
          />
          <h3 className="mb-1">{user.name}</h3>
          <p className="text-primary">{user.username}</p>
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
          {groups.map((group, index) => (
            <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                {group.icon === 'family' ? (
                  <PiUsers size={24} className="text-primary me-2" />
                ) : (
                  <FaDumbbell size={24} className="text-danger me-2" />
                )}
                <span>{group.name}</span>
              </div>
              <div>
                <span className="badge bg-primary me-2">{group.members} members</span>
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
    </div>
  );
}

export default ProfilePage;
