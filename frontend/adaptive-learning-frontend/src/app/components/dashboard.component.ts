import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CourseService } from '../services/course.service';
import { User, UserRole } from '../models/user.model';
import { Course, Module } from '../models/course.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container">
        <a class="navbar-brand fw-bold" href="#">
          <i class="fas fa-graduation-cap me-2"></i>Adaptive Learning Platform
        </a>
        <div class="navbar-nav ms-auto">
          <span class="navbar-text me-3">
            <i class="fas fa-user-circle me-1"></i>Welcome, <strong>{{ currentUser?.name }}</strong>!
          </span>
          <button class="btn btn-outline-light rounded-pill" (click)="logout()">
            <i class="fas fa-sign-out-alt me-1"></i>Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="bg-light py-5 mb-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="display-5 fw-bold text-primary mb-3">
              {{ currentUser?.role === UserRole.Student ? '🚀 Your Learning Journey' : '👨‍🏫 Instructor Dashboard' }}
            </h1>
            <p class="lead text-muted">
              {{ currentUser?.role === UserRole.Student ? 
                'Discover personalized courses and track your progress with AI-powered recommendations.' :
                'Manage your courses and monitor student progress.' }}
            </p>
          </div>
          <div class="col-md-4 text-center">
            <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 120px; height: 120px;">
              <i class="fas {{ currentUser?.role === UserRole.Student ? 'fa-user-graduate' : 'fa-chalkboard-teacher' }} text-white" style="font-size: 3rem;"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- Student View -->
        <div class="col-md-8" *ngIf="currentUser?.role === UserRole.Student">
          <!-- My Enrolled Courses -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-primary mb-0">
              <i class="fas fa-book-open me-2"></i>My Enrolled Courses
            </h2>
            <span class="badge bg-primary rounded-pill">{{ enrolledCourses.length }} Active</span>
          </div>
          
          <div class="row" *ngIf="enrolledCourses.length > 0; else noEnrollments">
            <div class="col-md-6 mb-4" *ngFor="let enrollment of enrolledCourses">
              <div class="card border-0 shadow-sm h-100 hover-card">
                <div class="card-header bg-gradient text-white" style="background: linear-gradient(45deg, #28a745, #20c997);">
                  <h5 class="card-title mb-0 text-white">
                    <i class="fas fa-graduation-cap me-2"></i>{{ enrollment.courseTitle }}
                  </h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                      <small class="text-muted">Progress</small>
                      <small class="text-muted">{{ enrollment.progress }}%</small>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                           [style.width.%]="enrollment.progress">
                      </div>
                    </div>
                  </div>
                  <button class="btn btn-primary rounded-pill w-100" (click)="viewCourse(enrollment.courseId)">
                    <i class="fas fa-play me-2"></i>Continue Learning
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <ng-template #noEnrollments>
            <div class="text-center py-5">
              <i class="fas fa-book text-muted" style="font-size: 4rem;"></i>
              <h4 class="text-muted mt-3">No Enrolled Courses Yet</h4>
              <p class="text-muted">Start your learning journey by enrolling in a course below!</p>
            </div>
          </ng-template>
          
          <!-- Available Courses -->
          <div class="d-flex justify-content-between align-items-center mb-4 mt-5">
            <h3 class="text-primary mb-0">
              <i class="fas fa-store me-2"></i>Course Catalog
            </h3>
            <span class="badge bg-info rounded-pill">{{ availableCourses.length }} Available</span>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-4" *ngFor="let course of availableCourses">
              <div class="card border-0 shadow-sm h-100 hover-card">
                <div class="card-header bg-gradient text-white" style="background: linear-gradient(45deg, #007bff, #6610f2);">
                  <h5 class="card-title mb-0 text-white">
                    <i class="fas fa-laptop-code me-2"></i>{{ course.title }}
                  </h5>
                </div>
                <div class="card-body d-flex flex-column">
                  <p class="card-text flex-grow-1">{{ course.description }}</p>
                  <div class="mb-3">
                    <small class="text-muted">
                      <i class="fas fa-user-tie me-1"></i>{{ course.instructor }} • 
                      <i class="fas fa-layer-group me-1"></i>{{ course.moduleCount }} modules
                    </small>
                  </div>
                  <button class="btn btn-success rounded-pill" 
                          (click)="enrollInCourse(course.id)"
                          [disabled]="enrollingCourseId === course.id">
                    <i class="fas {{ enrollingCourseId === course.id ? 'fa-spinner fa-spin' : 'fa-plus' }} me-2"></i>
                    {{ enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll Now' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Instructor View -->
        <div class="col-md-8" *ngIf="currentUser?.role === UserRole.Instructor">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-primary mb-0">
              <i class="fas fa-chalkboard-teacher me-2"></i>My Courses
            </h2>
            <div>
              <button class="btn btn-success rounded-pill me-2" (click)="showCreateCourse = true">
                <i class="fas fa-plus me-2"></i>Add Course
              </button>
              <span class="badge bg-primary rounded-pill">{{ courses.length }} Courses</span>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-4" *ngFor="let course of courses">
              <div class="card border-0 shadow-sm h-100 hover-card">
                <div class="card-header bg-gradient text-white" style="background: linear-gradient(45deg, #fd7e14, #e83e8c);">
                  <h5 class="card-title mb-0 text-white">
                    <i class="fas fa-book me-2"></i>{{ course.title }}
                  </h5>
                </div>
                <div class="card-body d-flex flex-column">
                  <p class="card-text flex-grow-1">{{ course.description }}</p>
                  <div class="mb-3">
                    <small class="text-muted">
                      <i class="fas fa-layer-group me-1"></i>{{ course.moduleCount }} modules
                    </small>
                  </div>
                  <button class="btn btn-warning rounded-pill" (click)="manageCourse(course.id)">
                    <i class="fas fa-cog me-2"></i>Manage Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <!-- Course Content for Students -->
          <div class="card border-0 shadow-sm mb-4" *ngIf="selectedCourse && currentUser?.role === UserRole.Student">
            <div class="card-header bg-gradient text-white" style="background: linear-gradient(45deg, #6f42c1, #e83e8c);">
              <h5 class="mb-0 text-white">
                <i class="fas fa-book-open me-2"></i>{{ selectedCourse.title }} - Modules
              </h5>
            </div>
            <div class="card-body">
              <div *ngFor="let module of courseModules; let i = index" class="mb-3">
                <div class="card border-0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
                  <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                      <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style="width: 30px; height: 30px; font-size: 0.8rem; color: white;">
                        {{ i + 1 }}
                      </div>
                      <h6 class="mb-0 text-primary">{{ module.title }}</h6>
                    </div>
                    <p class="text-muted mb-3">{{ module.content }}</p>
                    <button class="btn btn-primary btn-sm rounded-pill" 
                            (click)="getModuleQuiz(module.id)" 
                            *ngIf="module.order === 1">
                      <i class="fas fa-question-circle me-2"></i>Take Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Learning Preferences - Always visible for students -->
          <div class="card border-0 shadow-sm mb-4" *ngIf="currentUser?.role === UserRole.Student">
            <div class="card-header bg-gradient text-white" style="background: linear-gradient(45deg, #17a2b8, #6f42c1);">
              <h5 class="mb-0 text-white">
                <i class="fas fa-user-cog me-2"></i>Learning Preferences
              </h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <div class="d-flex align-items-center mb-2">
                  <i class="fas fa-play-circle text-info me-2"></i>
                  <strong>Format:</strong>
                  <span class="badge bg-info ms-2">{{ currentUser?.preferredFormat }}</span>
                </div>
                <div class="d-flex align-items-start mb-3">
                  <i class="fas fa-bullseye text-success me-2 mt-1"></i>
                  <div>
                    <strong>Goals:</strong>
                    <p class="mb-0 text-muted">{{ currentUser?.learningGoals || 'Not specified' }}</p>
                  </div>
                </div>
              </div>
              <div class="alert alert-info border-0" style="background: rgba(23, 162, 184, 0.1);">
                <i class="fas fa-lightbulb me-2"></i>
                <small>Your goals are used for personalized AI quiz recommendations</small>
              </div>
              <button class="btn btn-gradient rounded-pill w-100" 
                      style="background: linear-gradient(45deg, #28a745, #20c997); border: none; color: white;"
                      (click)="generateAIQuiz(1)">
                <i class="fas fa-robot me-2"></i>Generate AI Quiz
              </button>
            </div>
          </div>
          
          <!-- Instructor Stats -->
          <div class="card border-0 shadow-sm" *ngIf="currentUser?.role === UserRole.Instructor">
            <div class="card-header bg-gradient text-white" style="background: linear-gradient(45deg, #fd7e14, #e83e8c);">
              <h5 class="mb-0 text-white">
                <i class="fas fa-chart-bar me-2"></i>Course Statistics
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6">
                  <div class="bg-primary rounded p-3 text-white mb-2">
                    <i class="fas fa-book fa-2x mb-2"></i>
                    <h3 class="mb-0">{{ courses.length }}</h3>
                  </div>
                  <small class="text-muted">Total Courses</small>
                </div>
                <div class="col-6">
                  <div class="bg-success rounded p-3 text-white mb-2">
                    <i class="fas fa-users fa-2x mb-2"></i>
                    <h3 class="mb-0">{{ totalStudents }}</h3>
                  </div>
                  <small class="text-muted">Total Students</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Course Form -->
    <div class="card border-0 shadow-lg mt-4" *ngIf="showCreateCourse && currentUser?.role === UserRole.Instructor">
      <div class="card-header bg-gradient text-white" style="background: linear-gradient(45deg, #28a745, #20c997);">
        <h5 class="mb-0 text-white">
          <i class="fas fa-plus-circle me-2"></i>Create New Course
        </h5>
      </div>
      <div class="card-body">
        <form #courseForm="ngForm">
          <div class="mb-3">
            <label class="form-label fw-semibold">
              <i class="fas fa-book me-2 text-primary"></i>Course Title
            </label>
            <input type="text" class="form-control" [(ngModel)]="newCourse.title" name="title" required
                   placeholder="e.g., Advanced JavaScript Programming">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">
              <i class="fas fa-align-left me-2 text-primary"></i>Description
            </label>
            <textarea class="form-control" [(ngModel)]="newCourse.description" name="description" 
                      rows="3" required placeholder="Describe what students will learn in this course..."></textarea>
          </div>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-secondary rounded-pill" (click)="showCreateCourse = false">
              <i class="fas fa-times me-2"></i>Cancel
            </button>
            <button type="button" class="btn btn-success rounded-pill" 
                    (click)="createCourse()" [disabled]="!courseForm.valid || creatingCourse">
              <i class="fas {{ creatingCourse ? 'fa-spinner fa-spin' : 'fa-check' }} me-2"></i>
              {{ creatingCourse ? 'Creating...' : 'Create Course' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  courses: Course[] = [];
  enrolledCourses: any[] = [];
  availableCourses: Course[] = [];
  selectedCourse: Course | null = null;
  courseModules: Module[] = [];
  totalStudents = 0;
  enrollingCourseId: number | null = null;
  newCourse = { title: '', description: '' };
  creatingCourse = false;
  showCreateCourse = false;
  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.currentUser.role === UserRole.Student) {
      this.loadStudentData();
    } else {
      this.loadInstructorData();
    }
  }

  loadStudentData() {
    // Load enrolled courses first
    this.courseService.getProgress(this.currentUser!.id).subscribe({
      next: (progress) => {
        this.enrolledCourses = progress;
        // Then load all courses and filter out enrolled ones
        this.courseService.getCourses().subscribe({
          next: (allCourses) => {
            const enrolledIds = this.enrolledCourses.map(e => e.courseId);
            this.availableCourses = allCourses.filter(c => !enrolledIds.includes(c.id));
          },
          error: (error) => console.error('Error loading courses:', error)
        });
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        // If no enrollments, show all courses
        this.courseService.getCourses().subscribe({
          next: (courses) => this.availableCourses = courses,
          error: (error) => console.error('Error loading courses:', error)
        });
      }
    });
  }

  loadInstructorData() {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses.filter(c => c.instructor === this.currentUser?.name);
        this.totalStudents = Math.floor(Math.random() * 50) + 10; // Mock data
      },
      error: (error) => console.error('Error loading courses:', error)
    });
  }

  enrollInCourse(courseId: number) {
    if (this.currentUser) {
      this.enrollingCourseId = courseId;
      const course = this.availableCourses.find(c => c.id === courseId);
      
      this.courseService.enrollInCourse(this.currentUser.id, courseId).subscribe({
        next: (response) => {
          console.log('Enrollment response:', response);
          alert(`🎉 Successfully enrolled in "${course?.title}"!`);
          this.enrollingCourseId = null;
          this.loadStudentData();
        },
        error: (error) => {
          console.error('Enrollment error:', error);
          const errorMsg = error.error?.message || error.error || error.message || 'Enrollment failed';
          alert(`❌ ${errorMsg}`);
          this.enrollingCourseId = null;
        }
      });
    }
  }

  viewCourse(courseId: number) {
    // Find course from enrolled courses
    const enrollment = this.enrolledCourses.find(e => e.courseId === courseId);
    if (enrollment) {
      this.selectedCourse = { id: courseId, title: enrollment.courseTitle, description: '', instructor: '', moduleCount: 0 };
      this.courseService.getCourseModules(courseId).subscribe({
        next: (modules) => this.courseModules = modules,
        error: (error) => console.error('Error loading modules:', error)
      });
    }
  }

  manageCourse(courseId: number) {
    alert('Course management feature coming soon!');
  }

  takeQuiz(quizId: number) {
    this.router.navigate(['/quiz', quizId]);
  }

  getModuleQuiz(moduleId: number) {
    // For now, use quiz ID 1 (from seeded data)
    // In a real app, you'd call an API to get quizzes for this module
    this.takeQuiz(1);
  }

  generateAIQuiz(moduleId: number) {
    if (!this.currentUser) return;
    
    const confirmed = confirm('🤖 Generate a personalized AI quiz based on your learning goals?');
    if (!confirmed) return;
    
    this.courseService.generateAIQuiz(this.currentUser.id, moduleId, 3).subscribe({
      next: (response) => {
        alert(`✨ AI Quiz generated successfully! Taking you to the new quiz...`);
        this.takeQuiz(response.quizId);
      },
      error: (error) => {
        console.error('AI Quiz generation error:', error);
        alert('❌ Failed to generate AI quiz. Please try again.');
      }
    });
  }

  createCourse() {
    if (!this.currentUser || !this.newCourse.title || !this.newCourse.description) return;
    
    this.creatingCourse = true;
    
    this.courseService.createCourse({
      title: this.newCourse.title,
      description: this.newCourse.description,
      instructorId: this.currentUser.id
    }).subscribe({
      next: () => {
        alert('✨ Course created successfully!');
        this.newCourse = { title: '', description: '' };
        this.creatingCourse = false;
        this.showCreateCourse = false;
        this.loadInstructorData();
      },
      error: (error) => {
        console.error('Course creation error:', error);
        alert('❌ Failed to create course. Please try again.');
        this.creatingCourse = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}