import { Outlet } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { classNames } from "primereact/utils";
import useRefreshToken from "../../hooks/useRefreshToken";
import useAuth from "../../hooks/useAuth";
import { ProgressSpinner } from "primereact/progressspinner";
import { LayoutContext } from "../../layout/context/layoutcontext.jsx";

const PersistLogin = () => {
  const [isLoading, setLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const layoutConfig = useContext(LayoutContext);

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    !auth?.accessToken ? setLoading(false) : verifyRefreshToken();
  }, []);

  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  return isLoading ? (
    <ProgressSpinner className={containerClassName} />
  ) : (
    <Outlet />
  );
};

export default PersistLogin;
