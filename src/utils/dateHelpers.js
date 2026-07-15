// src/utils/dateUtils.js

/**
 * Formats any date source into YYYY-MM-DD for HTML input fields
 */
export const formatToInputDate = (dateSource) => {
  if (!dateSource) return "";
  const date = new Date(dateSource);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatToUIDate = (dateSource) => {
  if (!dateSource) return "N/A";

  const date = new Date(dateSource);
  // Guard against "Invalid Date"
  if (isNaN(date.getTime())) return "N/A";

  // Use UTC values to format to prevent local timezone shifts
  const month = date.getUTCMonth() + 1; // getUTCMonth is 0-indexed
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${month}/${day}/${year}`;
};
