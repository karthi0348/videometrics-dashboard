// src/helpers/service/user/user-api-service.ts

import HttpClientWrapper from "@/helpers/http-client-wrapper";

class UserApiService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  // Get Current User Info
  getCurrentUser = async () => {
    try {
      const data: any = await this.httpClientWrapper.get("auth/me");
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Update Current User Info
updateCurrentUser = async (payload: {
  email: string;
  full_name: string;
  current_password?: string;
  new_password?: string;
}) => {
  try {
    const data: any = await this.httpClientWrapper.put("auth/me", payload);
    return data; // ✅ backend already returns full updated user object
  } catch (error) {
    throw error;
  }
};

  // Send Code (POST /auth/send-code)
  sendCode = async (email: string) => {
    try {
      const payload = { email };
      const data: any = await this.httpClientWrapper.post("auth/send-code", payload);
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
  ) => {
    try {
      const payload = {
        email,
        verification_code: verificationCode,
        new_password: newPassword,
      };
      const data: any = await this.httpClientWrapper.post(
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
