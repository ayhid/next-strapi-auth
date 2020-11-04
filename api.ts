import Axios from "axios";

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export default api;