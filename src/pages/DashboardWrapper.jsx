import React from "react";
import AdminDashboard from "./admin/AdminDashboard";
import PrestataireDashboard from "./prestataire/PrestataireDashboard";
import useAuth from "../hooks/useAuth";

export const DashboardWrapper = () => {
  const { auth } = useAuth();
  const isRoleInArray = (role) => {
    return auth?.role.includes(role);
  };
  return (
    <>
      {isRoleInArray("ROLE_ADMIN") ? (
        <AdminDashboard />
      ) : (
        <PrestataireDashboard />
      )}
    </>
  );
};
