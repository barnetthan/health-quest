import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../firebase/auth';
import { LoadingSpinner } from './LoadingSpinner';

interface SettingsModalProps {
  show: boolean;
  onHide: () => void;
}

export function SettingsModal({ show, onHide }: SettingsModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      await logoutUser();
      navigate('/health-quest/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}
        
        <div className="d-grid gap-2">
          <Button 
            variant="outline-danger" 
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" /> Logging out...
              </>
            ) : (
              'Logout'
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
} 