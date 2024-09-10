// MongoDB ISODate example
const isoDate = new Date("2024-09-10T16:42:07.401+00:00"); // Example ISODate from MongoDB

// Convert to normal human-readable time
const normalTime = isoDate.toLocaleString();

console.log("ISODate to normal time:", normalTime);
