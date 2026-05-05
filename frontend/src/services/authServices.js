import api from "../utils/api";

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const googleLogin = (data) => api.post("/auth/google", data);
