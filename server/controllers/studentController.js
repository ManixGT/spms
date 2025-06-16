import Student from "../models/studentModel.js";
import CodeforcesData from "../models/codeForcesDataModel.js";
import { fetchCodeforcesData } from "../services/codeforcesService.js";

/**
 * @desc    Get all students with their Codeforces data
 * @route   GET /api/students
 * @access  Private/Admin
 */
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    const studentsWithData = await Promise.all(
      students.map(async (student) => {
        const cfData = await CodeforcesData.findOne({ studentId: student._id });
        return {
          ...student.toObject(),
          currentRating: cfData?.currentRating || 0,
          maxRating: cfData?.maxRating || 0,
          lastUpdated: cfData?.updatedAt || student.lastUpdated,
        };
      })
    );
    res.status(200).json({
      success: true,
      count: studentsWithData.length,
      data: studentsWithData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Get single student with detailed Codeforces data
 * @route   GET /api/students/:id
 * @access  Private/Admin
 */
export const getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    const codeforcesData = await CodeforcesData.findOne({
      studentId: student._id,
    });

    res.status(200).json({
      success: true,
      data: {
        student,
        codeforcesData: codeforcesData || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Private/Admin
 */
export const addStudent = async (req, res) => {
  try {
    const { codeforcesHandle } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: req.body.email },
        { codeforcesHandle: req.body.codeforcesHandle },
      ],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: "Student with this email or Codeforces handle already exists",
      });
    }

    const student = await Student.create(req.body);

    // Fetch initial Codeforces data
    try {
      await fetchCodeforcesData(student._id, codeforcesHandle);
    } catch (cfError) {
      console.error(
        `Initial CF fetch failed for ${codeforcesHandle}:`,
        cfError.message
      );
    }

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private/Admin
 */
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    const { codeforcesHandle: newHandle } = req.body;
    const handleChanged = newHandle && newHandle !== student.codeforcesHandle;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If Codeforces handle changed, fetch new data
    if (handleChanged) {
      try {
        await fetchCodeforcesData(updatedStudent._id, newHandle);
      } catch (cfError) {
        console.error(`CF update failed for ${newHandle}:`, cfError.message);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private/Admin
 */
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    await student.remove();
    await CodeforcesData.deleteOne({ studentId: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Toggle email notifications for a student
 * @route   PATCH /api/students/:id/notifications
 * @access  Private/Admin
 */
export const toggleNotifications = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    student.emailNotifications = !student.emailNotifications;
    await student.save();

    res.status(200).json({
      success: true,
      data: {
        emailNotifications: student.emailNotifications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
