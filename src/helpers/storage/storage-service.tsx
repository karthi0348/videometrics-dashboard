// Define interfaces for better type safety
export interface UserData {
    userName?: string;
    role?: string;
    [key: string]: unknown; // Allow additional properties
}

class StorageService {

    public static clear = (): void => {
        window.localStorage.clear();
    }

    public static saveUserData(user: UserData): void {
        window.localStorage.setItem("user", JSON.stringify(user));
    }

    public static getUserData(): UserData | null {
        const user: string | null = window.localStorage.getItem("user");
        if (user) {
            return JSON.parse(user) as UserData;
        }
        return null;
    }

    public static getUserName = (): string | undefined => {
        const user = this.getUserData();
        if (user) {
            return user.userName;
        }
        return undefined;
    }

    public static getRole = (): string | undefined => {
        const role = this.getUserData();
        if (role) {
            return role.role;
        }
        return undefined;
    }

    public static setToken(token: string): void {
        if (!token) {
            return;
        }
        window.localStorage.setItem('token', token);
    }

    public static getToken(): string | null {
        return window.localStorage.getItem('token');
    }

    public static isLoggedIn(): boolean {
        const token = this.getToken();
        return token !== null && token !== '';
    }

    public static getUserDataFromSessionStorage(): UserData | null {
        const user: string | null = sessionStorage.getItem('userData');
        if (user) {
            return JSON.parse(user) as UserData;
        }
        return null;
    }
}

export default StorageService;