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
            return user['userName'];
        }
    }

    public static getRole = () => {
        let role = this.getUserData();
        if (role) {
            return role['role'];
        }
    }

    public static setToken(token: string) {
        if (!token) {
            return;
        }
        window.localStorage.setItem('token', token);
    }

    public static getToken() {
        return window.localStorage.getItem('token');
    }

    public static isLoggedIn() {
        if (this.getToken() || this.getToken() != null) {
            return true;
        } else {
            return false;
        }
    }

    public static getUserDataFromSessionStorage(): any {
        let user: any = sessionStorage.getItem('userData');
        if (user) {
            return JSON.parse(user);
        }
    }
}

export default StorageService;