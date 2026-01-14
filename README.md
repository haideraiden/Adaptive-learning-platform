# 🎓 Adaptive Learning Platform

A smart learning platform that adapts educational content based on student performance using AI-powered recommendations.

## 🔧 Tech Stack

- **Frontend**: Angular 18 (Standalone Components, Bootstrap)
- **Backend**: .NET 9 Web API with Entity Framework Core
- **Database**: SQL Server LocalDB
- **AI**: Google Gemini API for adaptive recommendations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- .NET 9 SDK
- SQL Server LocalDB

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend/AdaptiveLearningAPI
```

2. Restore packages:
```bash
dotnet restore
```

3. Run the API:
```bash
dotnet run
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend/adaptive-learning-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

The app will be available at `http://localhost:4200`

## 📚 Features

### ✅ Implemented
- User authentication (login/signup)
- Course browsing and enrollment
- Student dashboard with progress tracking
- Quiz system with AI-powered recommendations
- Responsive Bootstrap UI

### 🔄 Core Functionality
- **User Management**: Students and instructors with role-based access
- **Learning Modules**: Text-based content with adaptive recommendations
- **Assessments**: Interactive quizzes with instant AI feedback
- **Progress Tracking**: Visual progress indicators and performance analytics

## 🧠 AI Integration

The platform uses Google Gemini API to provide:
- Personalized study recommendations
- Learning format suggestions (text, video, quiz)
- Encouraging feedback based on performance
- Next topic suggestions

## 🎯 Sample Data

The application includes sample data:
- **Instructor**: instructor@example.com / password123
- **Course**: "Introduction to Programming"
- **Sample Quiz**: Variables and data types

## 🔗 API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/courses` - Get all courses
- `POST /api/courses/enroll` - Enroll in course
- `POST /api/quiz/submit` - Submit quiz (triggers AI analysis)
- `GET /api/progress/{studentId}` - Get student progress

## 🎨 UI Components

- Clean, responsive design with Bootstrap
- Student dashboard with course cards
- Progress tracking with visual indicators
- Adaptive quiz interface
- Role-based navigation

Start exploring the adaptive learning experience! 🚀