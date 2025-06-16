import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot be longer than 20 characters"],
    },
    codeforcesHandle: {
      type: String,
      required: [true, "Please add a Codeforces handle"],
      trim: true,
      unique: true,
      maxlength: [24, "Handle cannot be more than 24 characters"],
    },
    password: {
      type: String,
      select: false,
      minlength: 6,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    reminderCount: {
      type: Number,
      default: 0,
    },
    lastReminderSent: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "student",
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual populate codeforces data
studentSchema.virtual("codeforcesData", {
  ref: "CodeforcesData",
  localField: "_id",
  foreignField: "studentId",
  justOne: true,
});

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update lastUpdated when codeforcesHandle changes
studentSchema.pre("save", function (next) {
  if (this.isModified("codeforcesHandle")) {
    this.lastUpdated = new Date();
  }
  next();
});

// Cascade delete codeforces data when student is deleted
studentSchema.pre("remove", async function (next) {
  await this.model("CodeforcesData").deleteMany({ studentId: this._id });
  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
