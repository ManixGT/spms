import cron from "node-cron";
import Student from "../models/studentModel.js";
import { fetchCodeforcesData } from "../services/codeforcesService.js";

const setupCronJobs = () => {
  // Daily sync at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("Running daily Codeforces data sync...");
    try {
      const students = await Student.find();
      for (const student of students) {
        try {
          await fetchCodeforcesData(student._id, student.codeforcesHandle);
          console.log(`Updated data for ${student.codeforcesHandle}`);
        } catch (error) {
          console.error(
            `Error updating ${student.codeforcesHandle}:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error("Error in daily sync:", error);
    }
  });
};

export default setupCronJobs;
