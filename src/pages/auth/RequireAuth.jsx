import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AccessDeniedPage from "../../(full-page)/access/AccessDeniedPage";
import SimpleLayout from "../../(full-page)/layout";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();
  const isAllowed =
    auth?.role && allowedRoles.some((role) => auth.role.includes(role));

  return (
    <>
      {isAllowed ? (
        <Outlet />
      ) : auth ? (
        <SimpleLayout>
          <AccessDeniedPage />
        </SimpleLayout>
      ) : (
        <Navigate to="/login" state={{ from: location }} replace />
      )}
    </>
  );
};

export default RequireAuth;
