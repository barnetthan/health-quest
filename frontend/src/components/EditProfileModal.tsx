import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

const DEFAULT_AVATARS = [
  '/health-quest/avatars/avatar1.png',
  '/health-quest/avatars/avatar2.png',
  '/health-quest/avatars/avatar3.png',
  '/health-quest/avatars/avatar4.png',
];

interface EditProfileModalProps {
  show: boolean;
  onHide: () => void;
  currentName: string;
  currentUsername: string;
  currentAvatar: string;
  onUpdate: () => void;
}

export function EditProfileModal({ 
  show, 
  onHide, 
  currentName, 
  currentUsername, 
  currentAvatar,
  onUpdate 
}: EditProfileModalProps) {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentName);
  const [username, setUsername] = useState(currentUsername);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Update user document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        name,
        username,
        avatarUrl: selectedAvatar
      });
      
      onUpdate();
      onHide();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}
        
        <Form>
          <div className="text-center mb-4">
            <h6 className="mb-3">Choose an Avatar</h6>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {DEFAULT_AVATARS.map((avatar, index) => (
                <div
                  key={index}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                  style={{
                    cursor: 'pointer',
                    border: selectedAvatar === avatar ? '3px solid #007bff' : '3px solid transparent',
                    borderRadius: '50%',
                    padding: '2px'
                  }}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 