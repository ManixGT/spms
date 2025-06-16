import mongoose from "mongoose";

const codeforcesSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  currentRating: { type: Number },
  maxRating: { type: Number },
  contestHistory: [
    {
      contestId: Number,
      contestName: String,
      rank: Number,
      ratingChange: Number,
      problemsUnsolved: Number,
      date: Date,
    },
  ],
  problemStats: {
    totalSolved: Number,
    averageRating: Number,
    averageProblemsPerDay: Number,
    ratingDistribution: [
      {
        ratingRange: String,
        count: Number,
      },
    ],
    mostDifficultSolved: {
      problemId: String,
      rating: Number,
      name: String,
    },
  },
  submissionHeatmap: [
    {
      date: Date,
      count: Number,
    },
  ],
  lastActive: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});

const CodeforcesData = mongoose.model("CodeforcesData", codeforcesSchema);

export default CodeforcesData;
