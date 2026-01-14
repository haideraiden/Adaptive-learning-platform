import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../services/course.service';
import { AuthService } from '../services/auth.service';
import { Quiz, QuizResult } from '../models/course.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="card" *ngIf="quiz">
        <div class="card-header">
          <h3>{{ quiz.title }}</h3>
        </div>
        <div class="card-body" *ngIf="!submitted">
          <div *ngFor="let question of quiz.questions; let i = index" class="mb-4">
            <h5>{{ i + 1 }}. {{ question.text }}</h5>
            <div *ngFor="let option of question.options; let j = index" class="form-check">
              <input class="form-check-input" type="radio" 
                     [name]="'question_' + i" 
                     [value]="j" 
                     [(ngModel)]="answers[i]">
              <label class="form-check-label">{{ option }}</label>
            </div>
          </div>
          <button class="btn btn-primary" (click)="submitQuiz()" [disabled]="submitting">
            {{ submitting ? 'Submitting...' : 'Submit Quiz' }}
          </button>
        </div>
        
        <div class="card-body" *ngIf="submitted && result">
          <!-- Score Section -->
          <div class="text-center mb-4">
            <div class="score-circle mx-auto mb-3" [ngClass]="{
              'score-excellent': result.percentage >= 80,
              'score-good': result.percentage >= 60 && result.percentage < 80,
              'score-needs-work': result.percentage < 60
            }">
              <div class="score-content">
                <h2 class="mb-0 text-white fw-bold">{{ Math.round(result.percentage) }}%</h2>
                <small class="text-white-50">{{ result.score }}/{{ result.total }}</small>
              </div>
            </div>
            <h3 class="text-primary mb-2">
              <i class="fas fa-trophy me-2"></i>Quiz Completed!
            </h3>
            <p class="text-muted">
              {{ getPerformanceMessage() }}
            </p>
          </div>

          <!-- AI Recommendation Section -->
          <div class="ai-recommendation-card mb-4">
            <div class="card border-0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div class="card-body text-white">
                <div class="d-flex align-items-center mb-3">
                  <div class="ai-icon me-3">
                    <i class="fas fa-robot fa-2x"></i>
                  </div>
                  <div>
                    <h5 class="mb-0 text-white">🤖 AI Learning Assistant</h5>
                    <small class="text-white-50">Personalized recommendation based on your performance</small>
                  </div>
                </div>
                <div class="recommendation-content">
                  <div class="bg-white bg-opacity-10 rounded p-3">
                    <i class="fas fa-quote-left text-white-50 mb-2"></i>
                    <div class="text-white" style="line-height: 1.6;">
                      <ng-container *ngFor="let line of getCleanRecommendation().split('\n'); let i = index">
                        <p [class]="i === 0 ? 'mb-2 fw-semibold' : 'mb-1'" *ngIf="line.trim()">
                          {{ line.trim() }}
                        </p>
                      </ng-container>
                    </div>
                    <i class="fas fa-quote-right text-white-50 mt-2 float-end"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="text-center">
            <button class="btn btn-primary rounded-pill me-3" (click)="goBack()">
              <i class="fas fa-arrow-left me-2"></i>Back to Dashboard
            </button>
            <button class="btn btn-success rounded-pill" (click)="goBack()">
              <i class="fas fa-redo me-2"></i>Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QuizComponent implements OnInit {
  quiz: Quiz | null = null;
  answers: number[] = [];
  submitted = false;
  submitting = false;
  result: QuizResult | null = null;
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuiz(quizId);
  }

  loadQuiz(quizId: number) {
    console.log('Loading quiz with ID:', quizId);
    this.courseService.getQuiz(quizId).subscribe({
      next: (quiz) => {
        console.log('Quiz loaded:', quiz);
        this.quiz = quiz;
        this.answers = new Array(quiz.questions.length).fill(-1);
        // Parse options if they're stored as JSON strings
        this.quiz.questions.forEach(q => {
          if (typeof q.options === 'string') {
            q.options = JSON.parse(q.options);
          }
        });
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
        alert('Quiz not found. Please try again.');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  submitQuiz() {
    const user = this.authService.currentUser;
    if (!user || !this.quiz || this.submitting) return;

    this.submitting = true;
    console.log('Submitting quiz:', { userId: user.id, quizId: this.quiz.id, answers: this.answers });
    
    this.courseService.submitQuiz(user.id, this.quiz.id, this.answers).subscribe({
      next: (result) => {
        console.log('Quiz result with AI:', result);
        this.result = result;
        this.submitted = true;
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz. Please try again.');
        this.submitting = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getPerformanceMessage(): string {
    if (!this.result) return '';
    if (this.result.percentage >= 80) return 'Excellent work! 🎉';
    if (this.result.percentage >= 60) return 'Good job! Keep it up! 👍';
    return 'Keep practicing! You\'re improving! 💪';
  }

  getCleanRecommendation(): string {
    if (!this.result?.recommendation) return '';
    
    return this.result.recommendation
      .replace(/\*\*/g, '')  // Remove ** bold markers
      .replace(/\*/g, '')   // Remove * markers
      .replace(/#/g, '')    // Remove # headers
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[.*?\]/g, '') // Remove [tags]
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .trim();
  }
}