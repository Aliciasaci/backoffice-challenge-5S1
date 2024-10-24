import { classNames } from "primereact/utils";
import { useNavigate } from "react-router-dom";
import React, { useContext, useEffect } from "react";
import { Button } from "primereact/button";
import { LayoutContext } from "../../layout/context/layoutcontext.jsx";
import { useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const { layoutConfig } = useContext(LayoutContext);
  const location = useLocation();
  const { auth } = useAuth();
  const from = location.state?.from?.pathname || "/";
  const to = auth?.accessToken ? from : "/login";
  const label = auth?.accessToken ? "Retour" : "Se connecter";

  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  useEffect(() => {
    if (!auth?.accessToken) return navigate(to);
  }, [auth, navigate, to]);

  return (
    <div className={containerClassName}>
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)",
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center"
            style={{ borderRadius: "53px" }}
          >
            <div
              className="flex justify-content-center align-items-center bg-pink-500 border-circle"
              style={{ height: "3.2rem", width: "3.2rem" }}
            >
              <i className="pi pi-fw pi-exclamation-circle text-2xl text-white"></i>
            </div>
            <h1 className="text-900 font-bold text-5xl mb-2">Accès refusé</h1>
            <div className="text-600 mb-5">
              Vous n&apos;avez pas les droits nécessaires pour accéder à cette
              page.
            </div>
            <Button
              icon="pi pi-arrow-left"
              label={label}
              text
              onClick={() => navigate(to)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
