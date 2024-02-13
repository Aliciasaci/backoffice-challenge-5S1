import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { Button } from "primereact/button";

export const LogOut = () => {
  const navigate = useNavigate();
  const handleOnClick = () => {
    localStorage.removeItem("auth");
    navigate("/login");
    window.location.reload();
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
