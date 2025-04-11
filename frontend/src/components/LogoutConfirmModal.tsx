import { Modal, Button } from 'react-bootstrap';

interface LogoutConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ show, onHide, onConfirm }: LogoutConfirmModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Logout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to log out?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Logout
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 