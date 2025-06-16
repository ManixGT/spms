import nodemailer from "nodemailer";
import Student from "../models/studentModel.js";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @desc    Send inactivity reminder email
 */
export const sendReminderEmail = async (student) => {
  if (!student.emailNotifications || !student.email) return;

  const mailOptions = {
    from: `"Codeforces Tracker" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: "Keep Up Your Coding Practice!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Hi ${student.name},</h2>
        <p style="font-size: 16px;">
          We noticed you haven't submitted any problems on Codeforces in the last 7 days.
        </p>
        <p style="font-size: 16px;">
          Regular practice is key to improving your problem-solving skills and competitive programming abilities.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://codeforces.com/problemset" 
             style="background-color: #3498db; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Solve Problems Now
          </a>
        </div>
        <p style="font-size: 14px; color: #7f8c8d;">
          You can disable these reminders in your student profile settings.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Update reminder count and last sent date
    student.reminderCount += 1;
    student.lastReminderSent = new Date();
    await student.save();

    console.log(`Reminder email sent to ${student.email}`);
  } catch (error) {
    console.error(`Error sending email to ${student.email}:`, error);
  }
};

/**
 * @desc    Send welcome email to new students
 */
export const sendWelcomeEmail = async (student) => {
  if (!student.email) return;

  const mailOptions = {
    from: `"Codeforces Tracker" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: "Welcome to Student Progress Tracker",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome, ${student.name}!</h2>
        <p style="font-size: 16px;">
          Your Codeforces progress (handle: ${
            student.codeforcesHandle
          }) will now be tracked automatically.
        </p>
        <p style="font-size: 16px;">
          You'll receive weekly reminders if you haven't submitted any problems for 7 days.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
             style="background-color: #3498db; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Your Dashboard
          </a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${student.email}`);
  } catch (error) {
    console.error(`Error sending welcome email to ${student.email}:`, error);
  }
};
