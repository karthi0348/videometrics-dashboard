class StorageService {
    public static clear = () => {
        window.localStorage.clear();
    }

    public static saveUserData(user: any): void {
        window.localStorage.setItem("user", JSON.stringify(user));
    }

    public static getUserData(): any {
        let user: any = window.localStorage.getItem("user");
        if (user) {
            return JSON.parse(user);
        }
    }

    public static getUserName = () => {
        let user = this.getUserData();
        if (user) {
            return user['userName'] || user['username'] || user['full_name'];
        }
    }

    public static getRole = () => {
        let role = this.getUserData();
        if (role) {
            return role['role'] || role['is_superuser'];
        }
    }

    public static setToken(token: string) {
        if (!token) {
            return;
        }
        // Store token in multiple formats for compatibility
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('accessToken', token);
        window.localStorage.setItem('authToken', token);
    }

    public static getToken() {
        // Check multiple token storage keys for compatibility
        return window.localStorage.getItem('token') || 
               window.localStorage.getItem('accessToken') || 
               window.localStorage.getItem('authToken');
    }

    public static isLoggedIn() {
        const token = this.getToken();
        return token && token !== null && token !== 'null';
    }

    public static getUserDataFromSessionStorage(): any {
        let user: any = sessionStorage.getItem('userData');
        if (user) {
            return JSON.parse(user);
        }
    }

    // New method to handle incoming auth messages
    public static handleAuthMessage(authData: any): void {
        if (authData.token || authData.accessToken) {
            const token = authData.token || authData.accessToken;
            this.setToken(token);
            console.log('Token stored from auth message:', token);
        }
        
        if (authData.user) {
            this.saveUserData(authData.user);
            console.log('User data stored from auth message:', authData.user);
        }
    }
}

export default StorageService;