import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { Button } from "primereact/button";
import useAuth from "../hooks/useAuth";

export const LogOut = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const handleOnClick = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("chartData");
    setAuth(null);
    navigate("/login");
  };
  return (
    <Button
      onClick={handleOnClick}
      icon={<IoIosLogOut />}
      rounded
      text
      raised
      severity="danger"
    />
  );
};
