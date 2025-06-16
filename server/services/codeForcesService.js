import axios from "axios";
import CodeforcesData from "../models/codeForcesDataModel.js";
import Student from "../models/studentModel.js";
import { sendReminderEmail } from "./emailService.js";

/**
 * @desc    Fetch and process Codeforces data for a student
 */
export const fetchCodeforcesData = async (studentId, handle) => {
  try {
    // Fetch user info
    const [userResponse, ratingResponse, submissionsResponse] =
      await Promise.all([
        axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
        axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`),
        axios.get(
          `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`
        ),
      ]);

    const userInfo = userResponse.data.result[0];
    const ratingHistory = ratingResponse.data.result;
    const submissions = submissionsResponse.data.result;

    // Process data
    const processedData = processCodeforcesData(
      handle,
      userInfo,
      ratingHistory,
      submissions
    );
    const lastActive = getLastActiveDate(submissions);

    // Save to database
    const updatedData = await CodeforcesData.findOneAndUpdate(
      { studentId },
      {
        ...processedData,
        lastActive,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update student's lastUpdated field
    await Student.findByIdAndUpdate(studentId, { lastUpdated: new Date() });

    return updatedData;
  } catch (error) {
    console.error(`Error fetching CF data for ${handle}:`, error.message);
    throw error;
  }
};

// Helper functions for processing Codeforces data
const processCodeforcesData = (
  handle,
  userInfo,
  ratingHistory,
  submissions
) => {
  // Process contest history
  const contestHistory = ratingHistory.map((contest) => ({
    contestId: contest.contestId,
    contestName: contest.contestName,
    rank: contest.rank,
    ratingChange: contest.newRating - contest.oldRating,
    problemsUnsolved: calculateUnsolvedProblems(contest, submissions),
    date: new Date(contest.ratingUpdateTimeSeconds * 1000),
  }));

  // Process problem solving stats
  const { problemStats, submissionHeatmap } = processProblemStats(submissions);

  return {
    currentRating: userInfo.rating || 0,
    maxRating: userInfo.maxRating || 0,
    contestHistory,
    problemStats,
    submissionHeatmap,
  };
};

const processProblemStats = (submissions) => {
  const solvedProblems = new Set();
  const ratingDistribution = {};
  let totalRating = 0;
  let solvedCount = 0;
  let mostDifficult = { rating: 0 };
  const heatmapData = {};

  submissions.forEach((submission) => {
    if (submission.verdict === "OK" && submission.problem.rating) {
      const problemKey = `${submission.problem.contestId}${submission.problem.index}`;
      if (!solvedProblems.has(problemKey)) {
        solvedProblems.add(problemKey);
        const rating = submission.problem.rating;

        // Update rating distribution
        const range = Math.floor(rating / 100) * 100;
        const rangeKey = `${range}-${range + 99}`;
        ratingDistribution[rangeKey] = (ratingDistribution[rangeKey] || 0) + 1;

        // Track most difficult problem
        if (rating > mostDifficult.rating) {
          mostDifficult = {
            problemId: submission.problem.contestId + submission.problem.index,
            rating,
            name: submission.problem.name,
          };
        }

        totalRating += rating;
        solvedCount++;
      }
    }

    // Process for heatmap
    if (submission.creationTimeSeconds) {
      const date = new Date(submission.creationTimeSeconds * 1000);
      const dateStr = date.toISOString().split("T")[0];
      heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
    }
  });

  // Convert heatmap data to array
  const submissionHeatmap = Object.entries(heatmapData).map(
    ([date, count]) => ({
      date: new Date(date),
      count,
    })
  );

  return {
    problemStats: {
      totalSolved: solvedProblems.size,
      averageRating:
        solvedCount > 0 ? Math.round(totalRating / solvedCount) : 0,
      averageProblemsPerDay: calculateAveragePerDay(
        solvedProblems.size,
        submissions
      ),
      ratingDistribution: Object.entries(ratingDistribution).map(
        ([range, count]) => ({
          ratingRange: range,
          count,
        })
      ),
      mostDifficultSolved: mostDifficult,
    },
    submissionHeatmap,
  };
};

// Additional helper functions would be here...

export default {
  fetchCodeforcesData,
};
