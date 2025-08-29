export interface User {
  fullName: string;
  username: string;
  email: string;
  profileImage?: string | null;
}

export interface ApiResponse {
  message: string;
}