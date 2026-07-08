// src/components/EditProfileModal.jsx

import React, { useState, useEffect } from "react";

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await onUpdate({ username, email, currentPassword });
      onClose();
    } catch (err) {
      setError(err.error || "Failed to update profile");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">
          ✕
        </button>
        <h2 className="modal-title">Edit Profile</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleUpdate}>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="modal-input"
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modal-input"
            />
          </label>
          <label>
            Current Password:
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="modal-input"
              required
            />
          </label>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            width: "100%",
            marginTop: "1.5rem"
          }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                width: isMobile ? "100%" : "auto",
                maxWidth: isMobile ? "200px" : "none",
                order: isMobile ? "2" : "1"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#d1d5db"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#e5e7eb"}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                width: isMobile ? "100%" : "auto",
                maxWidth: isMobile ? "200px" : "none",
                order: isMobile ? "1" : "2"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4338ca"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4f46e5"}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
