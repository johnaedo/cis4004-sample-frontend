// src/components/Spinner.jsx
import React from "react";
import PropTypes from "prop-types";

const Spinner = ({ size = 40, color = "#4f46e5" }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `${size / 8}px solid #f3f4f6`, // Light gray
    borderTop: `${size / 8}px solid ${color}`, // Primary color
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  return <div style={spinnerStyle} aria-label="Loading"></div>;
};

Spinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

export default Spinner;
