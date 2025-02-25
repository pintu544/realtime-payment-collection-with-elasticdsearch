import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "../utils/api";

// Create the context with a default value
export const AuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    if (loggedUser && loggedUser !== "undefined") {
      try {
        setUser(JSON.parse(loggedUser));
        const token = localStorage.getItem("token");
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async ({ username, password }) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      if (response.data) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;
        }
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const register = async ({ username, password }) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        password,
      });
      if (response.data) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/");
      }
    } catch (error) {
      console.error("Error registering:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
