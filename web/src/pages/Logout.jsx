import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../lib/auth";
import { toast } from "../lib/toast";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    clearToken(); // 1. wipe JWT/local-storage
    toast.success("Successfully logged out"); // 2. toast confirmation
    navigate("/login", { replace: true }); // 3. send user to login
  }, [navigate]);

  return null; // nothing to render
}
