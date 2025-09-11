export interface User {
  fullName: string;
  username: string;
  email: string;
  profileImage?: string | null;
}

export interface ApiResponse {
  access_token(arg0: string, access_token: any): unknown;
  user(user: any): string;
  expires_in: number;
  message: string;
}