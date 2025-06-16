import jwt from "jsonwebtoken";

/**
 * @desc    Calculate average problems solved per day
 */
export const calculateAveragePerDay = (totalSolved, submissions) => {
  if (!submissions || submissions.length === 0) return 0;

  const firstSubmission = new Date(
    submissions[submissions.length - 1].creationTimeSeconds * 1000
  );
  const lastSubmission = new Date(submissions[0].creationTimeSeconds * 1000);

  const days = Math.max(
    1,
    (lastSubmission - firstSubmission) / (1000 * 60 * 60 * 24)
  );
  return totalSolved / days;
};

/**
 * @desc    Get last active date from submissions
 */
export const getLastActiveDate = (submissions) => {
  if (!submissions || submissions.length === 0) return null;
  return new Date(submissions[0].creationTimeSeconds * 1000);
};

/**
 * @desc    Calculate unsolved problems in a contest
 */
export const calculateUnsolvedProblems = (contest, submissions) => {
  if (!contest || !submissions) return 0;

  const contestSubmissions = submissions.filter(
    (sub) =>
      sub.contestId === contest.contestId &&
      sub.creationTimeSeconds <= contest.ratingUpdateTimeSeconds
  );

  const solvedProblems = new Set();
  contestSubmissions.forEach((sub) => {
    if (sub.verdict === "OK") {
      solvedProblems.add(`${sub.problem.contestId}${sub.problem.index}`);
    }
  });

  // Assuming 5 problems per contest (this would need actual contest data)
  return Math.max(0, 5 - solvedProblems.size);
};

/**
 * @desc    Generate JWT token
 */
export const generateToken = (id, role) => {
  const secret =
    role === "admin" ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;
  return jwt.sign({ id, role }, secret, {
    expiresIn: "30d",
  });
};
