export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  moduleCount: number;
}

export interface Module {
  id: number;
  title: string;
  content: string;
  contentType: string;
  order: number;
  courseId: number;
}

export interface Quiz {
  id: number;
  title: string;
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  recommendation: string;
}