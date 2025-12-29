import { useState, useEffect, useCallback } from "react";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminStatus = useCallback(() => {
    const verified = sessionStorage.getItem("admin_verified") === "true";
    setIsAdmin(verified);
    setIsLoading(false);
  }, []);

  const clearAdminStatus = useCallback(() => {
    sessionStorage.removeItem("admin_verified");
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return { isAdmin, isLoading, checkAdminStatus, clearAdminStatus };
};
