import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Module, Quiz, QuizResult } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`);
  }

  enrollInCourse(userId: number, courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/courses/enroll`, { userId, courseId });
  }

  getCourseModules(courseId: number): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.apiUrl}/courses/${courseId}/modules`);
  }

  getQuiz(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/quiz/${quizId}`);
  }

  submitQuiz(userId: number, quizId: number, answers: number[]): Observable<QuizResult> {
    return this.http.post<QuizResult>(`${this.apiUrl}/quiz/submit`, { userId, quizId, answers });
  }

  getProgress(studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/progress/${studentId}`);
  }

  generateAIQuiz(userId: number, moduleId: number, questionCount: number = 3): Observable<any> {
    return this.http.post(`${this.apiUrl}/aiquiz/generate`, { userId, moduleId, questionCount });
  }

  createCourse(course: { title: string, description: string, instructorId: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/courses`, course);
  }
}