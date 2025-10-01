import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isAuthenticated } from "../lib/auth";

import { toast } from "../lib/toast";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!isAuthenticated() && !hasShownToast.current) {
      toast.warning("Please log in to access this page");
      hasShownToast.current = true;
    }
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
