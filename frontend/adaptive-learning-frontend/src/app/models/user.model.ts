export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  preferredFormat?: string;
  learningGoals?: string;
}

export enum UserRole {
  Student = 0,
  Instructor = 1
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  preferredFormat?: string;
  learningGoals?: string;
}