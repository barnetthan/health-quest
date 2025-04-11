import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

const DEFAULT_AVATARS = [
  '/health-quest/avatars/fitness-woman1.jpg',
  '/health-quest/avatars/fitness-man1.jpg',
  '/health-quest/avatars/fitness-woman2.jpg',
  '/health-quest/avatars/fitness-man2.jpg'
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
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    username?: string;
  }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setName(currentName);
      setUsername(currentUsername);
      setSelectedAvatar(currentAvatar);
      setError(null);
      setValidationErrors({});
    }
  }, [show, currentName, currentUsername, currentAvatar]);

  const validateForm = () => {
    const errors: { name?: string; username?: string } = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update user document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        username: username.trim(),
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
                    padding: '2px',
                    transition: 'all 0.2s ease-in-out',
                    transform: selectedAvatar === avatar ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: selectedAvatar === avatar ? '0 0 10px rgba(0,123,255,0.5)' : 'none'
                  }}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      transition: 'all 0.2s ease-in-out',
                      filter: selectedAvatar === avatar ? 'brightness(1.1)' : 'brightness(1)'
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
              isInvalid={!!validationErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              isInvalid={!!validationErrors.username}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.username}
            </Form.Control.Feedback>
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