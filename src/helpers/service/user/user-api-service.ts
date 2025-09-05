// src/helpers/service/user/user-api-service.ts

import HttpClientWrapper from "@/helpers/http-client-wrapper";

// Define interfaces for better type safety
export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  email: string;
  full_name: string;
  current_password?: string;
  new_password?: string;
}

export interface SendCodeResponse {
  message: string;
}

export interface VerifyResetPasswordResponse {
  message: string;
}

class UserApiService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  // Get Current User Info
  getCurrentUser = async (): Promise<User> => {
    try {
      const data = await this.httpClientWrapper.get<User>("auth/me");
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Update Current User Info
  updateCurrentUser = async (payload: UpdateUserPayload): Promise<User> => {
    try {
      const data = await this.httpClientWrapper.put<User>("auth/me", payload);
      return data; // ✅ backend already returns full updated user object
    } catch (error) {
      throw error;
    }
  };

  // Send Code (POST /auth/send-code)
  sendCode = async (email: string): Promise<SendCodeResponse> => {
    try {
      const payload = { email };
      const data = await this.httpClientWrapper.post<SendCodeResponse>("auth/send-code", payload);
      return data; // { message: "string" }
    } catch (error) {
      throw error;
    }
  };

  // Verify & Reset Password (POST /auth/verify-and-reset-password)
  verifyAndResetPassword = async (
    email: string,
    verificationCode: string,
    newPassword: string
  ): Promise<VerifyResetPasswordResponse> => {
    try {
      const payload = {
        email,
        verification_code: verificationCode,
        new_password: newPassword,
      };
      const data = await this.httpClientWrapper.post<VerifyResetPasswordResponse>(
        "auth/verify-and-reset-password",
        payload
      );
      return data; // { message: "string" }
    } catch (error) {
      throw error;
    }
  };
}

export default UserApiService;