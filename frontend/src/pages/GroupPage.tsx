import { useState } from 'react';
import { IoSettingsOutline, IoChevronBack, IoQrCode, IoKeypad } from "react-icons/io5";
import { FaPlus } from 'react-icons/fa6';

function GroupPage() {
  const [groupCode, setGroupCode] = useState<string>('');

  const openCamera = () => {
    console.log("Camera opened (mock)");
  };

  const createGroup = () => {
    console.log("Redirecting to group creation...");
  };

  return (
    <div className="container mt-4 mb-5 pb-5">
      {/* Header */}
      <div className="card mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <IoChevronBack size={24} className="text-primary" style={{ cursor: 'pointer' }} />
          <h2 className="m-0">Join Group</h2>
          <IoSettingsOutline size={24} className="text-primary" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Input Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text">
              <IoKeypad className="text-primary" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Enter group code"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
            />
          </div>
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
          <button
            className="btn btn-primary w-100"
            onClick={openCamera}
          >
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
            onClick={createGroup}
          >
            <FaPlus />
            Create New Group
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupPage;
