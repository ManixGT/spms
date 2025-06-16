import Student from "../models/studentModel.js";
import CodeforcesData from "../models/codeForcesDataModel.js";
import { fetchCodeforcesData } from "../services/codeforcesService.js";

/**
 * @desc    Force update Codeforces data for a student
 * @route   POST /api/students/:id/refresh-cf
 * @access  Private/Admin
 */
export const refreshCodeforcesData = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    const codeforcesData = await fetchCodeforcesData(
      student._id,
      student.codeforcesHandle
    );

    res.status(200).json({
      success: true,
      data: codeforcesData,
    });
  } catch (error) {
    console.error("Error refreshing CF data:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to refresh Codeforces data",
    });
  }
};

/**
 * @desc    Get contest history for a student
 * @route   GET /api/students/:id/contests
 * @access  Private/Admin
 */
export const getContestHistory = async (req, res) => {
  try {
    const { days } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days || 365));

    const data = await CodeforcesData.findOne({ studentId: req.params.id })
      .select("contestHistory")
      .lean();

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Codeforces data not found",
      });
    }

    const filteredHistory = data.contestHistory
      .filter((contest) => new Date(contest.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: filteredHistory.length,
      data: filteredHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Get problem solving stats for a student
 * @route   GET /api/students/:id/problems
 * @access  Private/Admin
 */
export const getProblemStats = async (req, res) => {
  try {
    const { days } = req.query;
    const data = await CodeforcesData.findOne({ studentId: req.params.id })
      .select("problemStats submissionHeatmap")
      .lean();

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Codeforces data not found",
      });
    }

    // Filter heatmap data if days parameter is provided
    let filteredHeatmap = data.submissionHeatmap;
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      filteredHeatmap = data.submissionHeatmap.filter(
        (entry) => new Date(entry.date) >= cutoffDate
      );
    }

    res.status(200).json({
      success: true,
      data: {
        stats: data.problemStats,
        heatmap: filteredHeatmap,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
