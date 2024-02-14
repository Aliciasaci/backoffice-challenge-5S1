import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LayoutProvider } from "./layout/context/layoutcontext.jsx";
import Layout from "./layout/layout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CrudUser from "./pages/admin/CrudUser";
import CrudCategory from "./pages/admin/CrudCategory";
import AdminEtablissement from "./pages/admin/AdminEtablissement";
import CrudEmploye from "./pages/prestataire/CrudEmploye";
import CrudPrestation from "./pages/prestataire/CrudPrestation";
import CrudEtablissement from "./pages/prestataire/CrudEtablissement";
import LogIn from "./(full-page)/login/LogIn.jsx"; // Ensure the casing matches the actual file path
import SimpleLayout from "./(full-page)/layout.jsx";
import RequireAuth from "./pages/auth/RequireAuth.jsx";
import NotFoundPage from "./(full-page)/access/NotFoundPage.jsx";
import HistoriqueReservation from "./pages/prestataire/HistoriqueReservation";
import { DashboardWrapper } from "./pages/DashboardWrapper.jsx";
import PersistLogin from "./(full-page)/login/PersistLogin.jsx";
import { LoadScript } from "@react-google-maps/api";
import ValidationEtablissement from "./pages/admin/ValidationEtablissement.jsx";

function App() {
  const API_KEY = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;
  return (
    <>
      <LoadScript googleMapsApiKey={API_KEY} libraries={["places"]}>
        <Router>
          <LayoutProvider>
            <Routes>
              <Route element={<PersistLogin />}>
                <Route
                  element={
                    <RequireAuth
                      allowedRoles={["ROLE_ADMIN", "ROLE_PRESTATAIRE"]}
                    />
                  }
                >
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <DashboardWrapper />
                      </Layout>
                    }
                  />
                </Route>
                <Route element={<RequireAuth allowedRoles={["ROLE_ADMIN"]} />}>
                  <Route
                    path="/admin/dashboard"
                    element={
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <Layout>
                        <CrudUser />
                      </Layout>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <Layout>
                        <CrudCategory />
                      </Layout>
                    }
                  />
                  <Route
                    path="/admin/etablissements"
                    element={
                      <Layout>
                        <AdminEtablissement />
                      </Layout>
                    }
                  />
                  <Route
                    path="/admin/demandes"
                    element={
                      <Layout>
                        <ValidationEtablissement />
                      </Layout>
                    }
                  />
                </Route>
                <Route
                  element={<RequireAuth allowedRoles={["ROLE_PRESTATAIRE"]} />}
                >
                  <Route
                    path="/prestataire/employes"
                    element={
                      <Layout>
                        <CrudEmploye />
                      </Layout>
                    }
                  />
                  <Route
                    path="/prestataire/prestations"
                    element={
                      <Layout>
                        <CrudPrestation />
                      </Layout>
                    }
                  />
                  <Route
                    path="/prestataire/etablissements"
                    element={
                      <Layout>
                        <CrudEtablissement />
                      </Layout>
                    }
                  />
                  <Route
                    path="/prestataire/reservations"
                    element={
                      <Layout>
                        <HistoriqueReservation />
                      </Layout>
                    }
                  />
                </Route>
              </Route>
              <Route
                path="/login"
                element={
                  <SimpleLayout>
                    <LogIn />
                  </SimpleLayout>
                }
              />
              <Route
                path="*"
                element={
                  <SimpleLayout>
                    <NotFoundPage />
                  </SimpleLayout>
                }
              />
            </Routes>
          </LayoutProvider>
        </Router>
      </LoadScript>
    </>
  );
}

export default App;