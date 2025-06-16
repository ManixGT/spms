import express from "express";
import {
  getStudents,
  getStudentDetails,
  addStudent,
  updateStudent,
  deleteStudent,
  toggleNotifications,
} from "../controllers/studentController.js";
import {
  refreshCodeforcesData,
  getContestHistory,
  getProblemStats,
} from "../controllers/codeforcesController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, admin, getStudents)
  .post(protect, admin, addStudent);

router
  .route("/:id")
  .get(protect, admin, getStudentDetails)
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

router.route("/:id/notifications").patch(protect, admin, toggleNotifications);

// Codeforces data routes
router.route("/:id/refresh-cf").post(protect, admin, refreshCodeforcesData);

router.route("/:id/contests").get(protect, admin, getContestHistory);

router.route("/:id/problems").get(protect, admin, getProblemStats);

export default router;
