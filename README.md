Sure! Here's a beautifully structured and styled `README.md` file based on your exact specifications, with every word retained and formatted for clarity and professional presentation.

---

````markdown
# 📚 Student Progress Management System

A full-featured MERN (MongoDB, Express, React, Node.js) web application to track and manage student progress on **Codeforces**.

---

## 🧾 Features

### 📋 Student Table View

- Create a table listing all enrolled students, showing:
  - Name
  - Email
  - Phone Number
  - Codeforces Handle
  - Current Rating
  - Max Rating
- Include options to:
  - ➕ Add students
  - ✏️ Edit students
  - 🗑️ Delete students
  - 📥 Download the entire dataset as CSV
- Provide a "View More Details" option in each row:
  - Clicking it shows the student's **Codeforces progress**

---

### 👤 Student Profile View

#### 🏁 Contest History

- Allow filtering by:
  - Last 30 days
  - Last 90 days
  - Last 365 days
- For the selected filter, show:
  - 📈 Rating graph
  - 📋 List of contests with:
    - Rating changes
    - Ranks
    - Number of problems unsolved by the user in that contest till date

#### 🧠 Problem Solving Data

- Allow filtering by:
  - Last 7 days
  - Last 30 days
  - Last 90 days
- For the selected filter, display:
  - 🧩 Most difficult problem solved (by rating)
  - ✔️ Total problems solved
  - 📊 Average rating
  - 📅 Average problems per day
  - 📉 Bar chart of number of problems solved per rating bucket
  - 🔥 Submission heat map

---

## 🔁 Codeforces Data Sync

- Automatically fetch and store updated Codeforces data **once a day** (e.g., at 2 AM) with a **cron job**
- Avoid real-time API calls during user interaction hours
- Store all required data to ensure the student’s profile data can be shown efficiently
- Provide an option to:
  - Change the **time** at which the cron runs
  - Change the **frequency** of the cron

### ⚠️ Important

- On the main table, show **when the data was last updated** for each user
- If a user’s CF handle is updated in the main table:
  - The CF data must be fetched again in **real-time**, **without** waiting for the cron job

---

## 🚨 Inactivity Detection

- After each sync, identify students who **haven’t made any submissions in the last 7 days**
- Send them an **automatic email** encouraging them to get back to problem solving
- Provide options to:
  - See how many times a **reminder email** has been sent to a user
  - **Disable automatic emails** for individual students

---

## 🌟 Bonus Features

- 📱 UI is **mobile and tablet responsive**
- 🌗 Includes **light and dark mode** with a toggle switch
- 🧾 Code is **well documented**

---

## 🛠️ Tech Stack (MERN)

- **MongoDB** – Database
- **Express.js** – Backend framework
- **React.js** – Frontend library
- **Node.js** – Backend runtime

---

## 📂 Project Structure

```bash
root/
├── client/           # React frontend
├── server/           # Node.js + Express backend
├── models/           # MongoDB data models
├── routes/           # API routes
├── utils/            # Utility functions (e.g., email, cron jobs)
├── config/           # Environment and configuration files
├── scripts/          # Cron jobs and Codeforces data sync
└── README.md         # Project description and documentation
```
````

---

## 🚀 Getting Started

1. Clone the repository
2. Run MongoDB locally or connect to a cloud instance
3. Configure environment variables in `.env`
4. Start both client and server

```bash
# From root directory
npm run dev
```

---

## 📬 Contact & Contribution

Feel free to contribute via pull requests or raise issues for bugs and suggestions.

---

## 📝 License

This project is licensed under the MIT License.

```

---

Let me know if you want this as a downloadable file or if you'd like me to scaffold the MERN structure as a starter project for this.
```
