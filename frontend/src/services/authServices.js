import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const signup = (data) =>
  axios.post("http://localhost:8000/auth/signup", data);

export const login = (data) =>
  axios.post("http://localhost:8000/auth/login", data);