
# 🚀 LaunchPad – Student Career & Opportunity Platform

LaunchPad is a student-focused career development platform designed to help students organize their career journey, track internship applications, improve technical skills, manage daily tasks, and test their knowledge through interactive quizzes.

The platform provides a centralized workspace to support students in building skills and preparing for future career opportunities.

## ✨ Key Features

### 🔐 Authentication
- User registration and login.
- Secure authentication using Supabase.
- Individual user accounts and protected data.

### 📊 Dashboard
- Overview of internship applications.
- Skills and task statistics.
- Application progress visualization.
- Personalized dashboard.

### 💼 Internship Tracker
- Add, edit, and delete internship applications.
- Track application status.
- Search and filter internship records.
- Manage application deadlines.

### 🎯 Skills Tracker
- Add and manage technical skills.
- Organize skills by category.
- Track proficiency levels.
- Update and delete skills.

### ✅ Task Planner
- Create, edit, and delete tasks.
- Set deadlines and priorities.
- Track pending and completed tasks.
- Identify overdue tasks.

### 🧠 Skill Quiz
- Interactive technology-based quiz.
- Multiple-choice questions.
- Quiz timer and score calculation.
- Save quiz results.

### 👤 Profile Management
- Update personal information.
- Manage educational details.
- Save profile changes.

### ⚙️ Settings
- Switch between dark and light themes.
- View account information.
- Change account password.
- Sign out securely.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive design |
| JavaScript (ES6+) | Interactive functionality |
| Supabase | Authentication and database |
| PostgreSQL | Data storage |
| Chart.js | Dashboard charts |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
LaunchPad/
│
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── internships.html
├── skills.html
├── tasks.html
├── quiz.html
├── profile.html
├── settings.html
│
├── css/
│   ├── dashboard.css
│   ├── auth.css
│   ├── internships.css
│   ├── skills.css
│   ├── tasks.css
│   ├── quiz.css
│   ├── profile.css
│   ├── settings.css
│   └── ...
│
├── js/
│   ├── config.js
│   ├── supabase.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── internships.js
│   ├── skills.js
│   ├── tasks.js
│   ├── quiz.js
│   ├── profile.js
│   ├── settings.js
│   └── theme.js
│
├── assets/
│
├── style.css
├── responsive.css
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the Project

```bash
cd LaunchPad
```

### 3. Configure Supabase

- Create a Supabase project.
- Set up the required database tables.
- Enable email authentication.
- Configure Row Level Security (RLS) policies.
- Add your Supabase project URL and publishable key to `js/config.js`.

**Important:** Never upload secret keys or private credentials to GitHub.

### 4. Run the Project

Open the project in Visual Studio Code and launch `index.html` using the Live Server extension.

## 🗄️ Database

LaunchPad uses Supabase PostgreSQL with the following tables:

- `profiles`
- `internships`
- `skills`
- `tasks`
- `quiz_results`

Row Level Security policies help ensure users can access only their own records.

## 📱 Responsive Design

LaunchPad is designed to work across:
- Desktop computers
- Laptops
- Tablets
- Mobile devices

## 🎯 Project Objective

The main objective of LaunchPad is to provide students with a simple and organized platform to manage their career preparation activities in one place.

## 👩‍💻 Developed By

**Divya Rane**

TY B.Sc. Information Technology Student

Developed as a Full Stack Web Development Internship Capstone Project.

---

⭐ If you find this project useful, feel free to explore and share your feedback!
