import jwt from "jsonwebtoken";
import Student from "../models/studentModel.js";
import Admin from "../models/adminModel.js";

/**
 * @desc    Protect routes with JWT
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is admin or student
      req.user =
        (await Admin.findById(decoded.id)) ||
        (await Student.findById(decoded.id));

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Not authorized, user not found",
        });
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({
        success: false,
        error: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: "Not authorized, no token",
    });
  }
};

/**
 * @desc    Admin-only access
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: "Not authorized as an admin",
    });
  }
};
