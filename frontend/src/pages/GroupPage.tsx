import { useState, useEffect } from "react";
import {
  IoSettingsOutline,
  IoChevronBack,
  IoQrCode,
  IoKeypad,
} from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createGroup, getGroupByCode, joinGroup, getUserGroups, leaveGroup } from "../firebase/groups";
import { FirebaseGroup } from "../firebase/types";

function GroupPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [groupCode, setGroupCode] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [generatedGroupCode, setGeneratedGroupCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<FirebaseGroup[]>([]);

  // Fetch user's groups on component mount
  useEffect(() => {
    if (!currentUser) return;
    
    const loadUserGroups = async () => {
      try {
        const groups = await getUserGroups(currentUser.uid);
        setUserGroups(groups);
      } catch (err) {
        console.error("Error loading groups:", err);
        setError("Failed to load your groups. Please try again.");
      }
    };
    
    loadUserGroups();
  }, [currentUser]);

  const openCamera = () => {
    // For a real implementation, you would integrate a QR code scanner library
    console.log("Camera opened (mock)");
  };

  const prepareCreateGroup = () => {
    setShowModal(true);
    // Generate random code for the new group - using the same method as in groups.ts
    setGeneratedGroupCode(
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  };

  const handleCreateGroup = async () => {
    if (!currentUser || !newGroupName.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Create group in Firebase with the generated code
      const groupId = await createGroup(newGroupName, currentUser.uid);
      
      // Get the created group to verify the code
      const createdGroup = await getUserGroups(currentUser.uid);
      const newGroup = createdGroup.find(g => g.id === groupId);
      
      if (newGroup) {
        console.log("Created group with code:", newGroup.code);
      }
      
      // Store active group ID
      localStorage.setItem("activeGroupId", groupId);
      
      // Close modal and navigate to quest page
      setShowModal(false);
      navigate("/health-quest/");
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!currentUser) {
      setError("You must be logged in to join a group");
      return;
    }

    if (!groupCode.trim()) {
      setError("Please enter a group code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(`Attempting to join group with code: ${groupCode}`);
      const group = await getGroupByCode(groupCode.trim().toUpperCase());
      
      if (!group) {
        console.log(`No group found with code: ${groupCode}`);
        setError("Invalid group code. Please check and try again.");
        return;
      }

      console.log(`Found group: ${group.name} with ID: ${group.id}`);
      
      // Check if user is already a member
      if (group.members.includes(currentUser.uid)) {
        console.log("User is already a member of this group");
        setError("You are already a member of this group");
        return;
      }

      await joinGroup(group.id, currentUser.uid);
      console.log(`Successfully joined group: ${group.name}`);
      
      // Refresh user's groups
      const updatedGroups = await getUserGroups(currentUser.uid);
      setUserGroups(updatedGroups);
      
      // Clear the input and show success message
      setGroupCode("");
      setSuccess("Successfully joined the group!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      
    } catch (error) {
      console.error("Error joining group:", error);
      setError(error instanceof Error ? error.message : "Failed to join group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) {
      setError("You must be logged in to leave a group");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await leaveGroup(currentUser.uid, groupId);
      console.log(`Successfully left group: ${groupId}`);
      
      // Refresh user's groups
      const updatedGroups = await getUserGroups(currentUser.uid);
      setUserGroups(updatedGroups);
      
      // Show success message
      setSuccess("Successfully left the group!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      
    } catch (error) {
      console.error("Error leaving group:", error);
      setError(error instanceof Error ? error.message : "Failed to leave group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewGroupName("");
  };

  const navigateBack = () => {
    navigate("/health-quest/");
  };

  return (
    <div className="container mt-4 mb-5 pb-5">
      {/* Header */}
      <div className="card mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <IoChevronBack
            size={24}
            className="text-primary"
            style={{ cursor: "pointer" }}
            onClick={navigateBack}
          />
          <h2 className="m-0">Join Group</h2>
          <IoSettingsOutline
            size={24}
            className="text-primary"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="alert alert-success mb-4" role="alert">
          {success}
        </div>
      )}

      {/* Existing Groups Section (if user has groups) */}
      {userGroups.length > 0 && (
        <div className="card mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">Your Groups</h5>
          </div>
          <div className="list-group list-group-flush">
            {userGroups.map((group) => (
              <div
                key={group.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <button
                  className="btn btn-link text-decoration-none flex-grow-1 text-start"
                  onClick={() => {
                    localStorage.setItem("activeGroupId", group.id);
                    navigate("/health-quest/");
                  }}
                >
                  <span>{group.name}</span>
                  <span className="badge bg-primary rounded-pill ms-2">
                    {group.members.length} members
                  </span>
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleLeaveGroup(group.id)}
                  disabled={loading}
                >
                  Leave
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <IoKeypad className="text-primary" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Enter group code"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJoinGroup();
                }
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleJoinGroup}
              disabled={loading || !groupCode.trim()}
            >
              {loading ? "Joining..." : "Submit"}
            </button>
          </div>
          <small className="text-muted mt-2 d-block">
            Enter the 6-character code shared with you by a group member
          </small>
        </div>
      </div>

      {/* Divider */}
      <div className="position-relative text-center mb-4">
        <hr className="position-absolute w-100 top-50" />
        <span className="bg-white px-3 position-relative text-muted">OR</span>
      </div>

      {/* QR Code Scanner */}
      <div className="card mb-4 text-center">
        <div className="card-body">
          <IoQrCode size={100} className="text-primary mb-3" />
          <h5>Scan QR Code</h5>
          <button className="btn btn-primary w-100" onClick={openCamera}>
            Open Camera
          </button>
        </div>
      </div>

      {/* Create Group Section */}
      <div className="card">
        <div className="card-body text-center">
          <p className="mb-3">Don't have a group to join?</p>
          <button
            className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={prepareCreateGroup}
            disabled={loading}
          >
            <FaPlus />
            Create New Group
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="groupName" className="form-label">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              className="form-control"
              placeholder="Enter group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
          </div>
          <div className="alert alert-info">
            <strong>Generated Group Code:</strong> {generatedGroupCode}
            <p className="small mt-2 mb-0">
              Share this code with others to let them join your group
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateGroup}
            disabled={loading || !newGroupName.trim()}
          >
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default GroupPage;