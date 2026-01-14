import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest, UserRole } from '../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-background">
      <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow">
              <div class="card-body p-4">
                <!-- Logo -->
                <div class="text-center mb-4">
                  <i class="fas fa-graduation-cap fa-3x text-primary mb-2"></i>
                  <h3 class="text-primary mb-1">Adaptive Learning</h3>
                  <p class="text-muted small">{{ isLogin ? 'Welcome back' : 'Create account' }}</p>
                </div>
                
                <form (ngSubmit)="onSubmit()" #form="ngForm">
                  <div class="mb-3" *ngIf="!isLogin">
                    <input type="text" class="form-control" [(ngModel)]="name" name="name" required placeholder="Full Name">
                  </div>
                  
                  <div class="mb-3">
                    <input type="email" class="form-control" [(ngModel)]="email" name="email" required placeholder="Email">
                  </div>
                  
                  <div class="mb-3">
                    <input type="password" class="form-control" [(ngModel)]="password" name="password" required placeholder="Password">
                  </div>
                  
                  <div class="mb-3" *ngIf="!isLogin">
                    <select class="form-select" [(ngModel)]="role" name="role" required>
                      <option value="" disabled>Select Role</option>
                      <option [value]="UserRole.Student">Student</option>
                      <option [value]="UserRole.Instructor">Instructor</option>
                    </select>
                  </div>
                  
                  <div *ngIf="!isLogin && role === UserRole.Student">
                    <div class="mb-3">
                      <select class="form-select" [(ngModel)]="preferredFormat" name="preferredFormat">
                        <option value="text">Text Learning</option>
                        <option value="video">Video Learning</option>
                        <option value="quiz">Quiz Learning</option>
                      </select>
                    </div>
                    
                    <div class="mb-3">
                      <textarea class="form-control" [(ngModel)]="learningGoals" name="learningGoals" 
                                rows="2" placeholder="Learning goals (optional)"></textarea>
                    </div>
                  </div>
                  
                  <div class="d-grid mb-3">
                    <button type="submit" class="btn btn-primary" [disabled]="!form.valid || loading">
                      {{ loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up') }}
                    </button>
                  </div>
                  
                  <div class="text-center">
                    <button type="button" class="btn btn-link" (click)="toggleMode()">
                      {{ isLogin ? 'Create account' : 'Sign in instead' }}
                    </button>
                  </div>
                  
                  <div class="alert alert-danger" *ngIf="error">
                    {{ error }}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  isLogin = true;
  email = '';
  password = '';
  name = '';
  role = UserRole.Student;
  preferredFormat = 'text';
  learningGoals = '';
  loading = false;
  error = '';
  
  UserRole = UserRole;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    if (this.isLogin) {
      const loginRequest: LoginRequest = {
        email: this.email,
        password: this.password
      };

      this.authService.login(loginRequest).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.error = 'Invalid credentials';
          this.loading = false;
        }
      });
    } else {
      const signupRequest = {
        email: this.email,
        password: this.password,
        name: this.name,
        role: this.role,
        preferredFormat: this.preferredFormat,
        learningGoals: this.learningGoals
      };

      this.authService.signup(signupRequest).subscribe({
        next: (user) => {
          console.log('User created:', user);
          this.isLogin = true;
          this.error = '';
          this.loading = false;
          alert('Account created successfully! Please login.');
        },
        error: (error) => {
          this.error = error.error || 'Registration failed';
          this.loading = false;
        }
      });
    }
  }
}