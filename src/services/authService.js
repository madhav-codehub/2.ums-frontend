import axios from "axios";

const BASE_URL = "http://localhost:9001/api"

//CREATE AXIOS INSTANCE
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
})

//RESPONSE INTERCEPTOR FOR ERROR HANDLING
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401: //unauthorized
                    authService.logout();
                    window.location.href = "/login";
                    break;
                case 403: //forbidden
                    console.error("Access Forbidden");
                    break;
                case 404: //resource not found
                    console.error("Resource Not Found");
                    break;
                case 500: //server error
                    console.error("Internal Server Error");
                    break;
            }
        } else if (error.request) {
            console.error("No Response Received", error.request);
        } else {
            console.error("Error in setting up request", error.message)
        }
        return Promise.reject(error);
    }
)

const authService = {
    signupNormalUser: async (username, email, password) => {
        try {
            const response = await api.post('/auth/registerNormalUser', {
                username,
                email,
                password
            });
            return response.data;
        } catch (error) {
            console.error("Signup Failed!");
            throw error;
        }
    },
    login: async (username, password) => {
        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });

            //fetch current user
            const user = await authService.fetchCurrentUser();
            return {
                ...response.data,
                user
            }
        } catch (error) {
            console.error("Login Failed!");
            throw error;
        }
    },
    fetchCurrentUser: async () => {
        try {
            const response = await api.get('/auth/getCurrentUser');
            localStorage.setItem('user', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error('Error fetching user data!');
            if (error.response && error.response.status === 401) {
                await authService.logout();
            }
            return null;
        }
    },
    getCurrentUser: () => {
        const user = localStorage.getItem("user");
        try {
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data', error);
            return null;
        }
    },
    logout: async () => {
        try {
            await api.post('/api/logout');
            localStorage.removeItem('user');
        } catch (error) {
            console.log("Logout failed!")
        }
    },
    isAuthenticated: async () => {
        try {
            const user = await authService.fetchCurrentUser();
            return !!user;
        } catch (error) {
            return false;
        }
    }

}