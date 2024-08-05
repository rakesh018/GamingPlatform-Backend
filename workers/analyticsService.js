const redisClient = require("../configs/redisClient");
const Withdrawal = require("../models/withdrawal");
const ManualDeposit = require("../models/manualDeposit");

// Helper function to get the start and end of a month
const getMonthRange = (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};
// Helper function to get the start and end of a day
const getDayRange = (date) => {
  const start = new Date(date.setHours(0, 0, 0, 0)); // Start of the day
  const end = new Date(date.setHours(23, 59, 59, 999)); // End of the day
  return { start, end };
};
// Compute total withdrawn and deposited amounts for each of the past 12 months
async function computeAnnualAnalytics() {
  try {
    const now = new Date();
    const results = [];

    for (let i = 0; i < 12; i++) {
      const monthOffset = now.getMonth() - i;
      let toBeAdded=monthOffset>=0?0:-1; //either this year or previous year
      const year = now.getFullYear() +toBeAdded;
      const month = ((monthOffset + 12) % 12); // Adjust month to handle negative values
      const { start, end } = getMonthRange(year, month);
      // Aggregate withdrawals for the month
      const withdrawals = await Withdrawal.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalWithdrawn: { $sum: "$amount" },
          },
        },
      ]);

      // Aggregate deposits for the month
      const deposits = await ManualDeposit.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalDeposited: { $sum: "$amount" },
          },
        },
      ]);
      results.push({
        month: `${year}-${String(month + 1).padStart(2, "0")}`,
        totalWithdrawn:
          withdrawals.length > 0 ? withdrawals[0].totalWithdrawn : 0,
        totalDeposited: deposits.length > 0 ? deposits[0].totalDeposited : 0,
      });
    }

    return results;
  } catch (error) {
    console.error("Error computing annual Analytics:", error);
    return [];
  }
}

async function computeMonthlyAnalytics() {
  try {
    const now = new Date();
    const results = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Get each day back from today
      const { start, end } = getDayRange(date);

      // Aggregate withdrawals for the day
      const withdrawals = await Withdrawal.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalWithdrawn: { $sum: "$amount" },
          },
        },
      ]);

      // Aggregate deposits for the day
      const deposits = await ManualDeposit.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalDeposited: { $sum: "$amount" },
          },
        },
      ]);

      results.push({
        date: start.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        totalWithdrawn:
          withdrawals.length > 0 ? withdrawals[0].totalWithdrawn : 0,
        totalDeposited: deposits.length > 0 ? deposits[0].totalDeposited : 0,
      });
    }

    return results;
  } catch (error) {
    console.error("Error computing monthly Analytics:", error);
    return [];
  }
}

const updateAnnualAnalytics = async () => {
  // Compute Analytics for each of the past 12 months
  const annualAnalytics = await computeAnnualAnalytics();

  // Cache the data in Redis without expiry
  redisClient.set("annual-analytics", JSON.stringify(annualAnalytics));
};

const updateMonthlyAnalytics = async () => {
  // Compute Analytics for the past 30 days
  const monthlyAnalytics = await computeMonthlyAnalytics();

  // Cache the data in Redis without expiry
  redisClient.set("monthly-analytics", JSON.stringify(monthlyAnalytics));
};

const getCachedAnalytics = async (type) => {
  try {
    // Get the data from Redis
    let data = await redisClient.get(type);

    if (data) {
      return JSON.parse(data); // Return the parsed data if found
    }

    // Data not found, update cache
    if (type === "annual-analytics") {
      await updateAnnualAnalytics();
    } else if (type === "monthly-analytics") {
      await updateMonthlyAnalytics();
    } else {
      return { totalWithdrawn: 0, totalDeposited: 0 }; // If the type is not recognized
    }
    data = await redisClient.get(type);
    if (data) {
      return JSON.parse(data);
    } else {
      return { totalWithdrawn: 0, totalDeposited: 0 }; // Return default values if data is still not found
    }
  } catch (error) {
    console.error(`Error fetching or updating ${type}:`, error);
    return { totalWithdrawn: 0, totalDeposited: 0 };
  }
};

module.exports = {
  updateAnnualAnalytics,
  updateMonthlyAnalytics,
  getCachedAnalytics,
};
