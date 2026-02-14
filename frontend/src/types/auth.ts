export interface User {
  id: string;
  email: string;
}

export interface SignupResponse {
  id: string;
  email: string;
}

export interface LoginResponse {
  user: User;
}
