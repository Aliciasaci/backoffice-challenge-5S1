import { useContext, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { LayoutContext } from "../../layout/context/layoutcontext.jsx";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Toast } from "primereact/toast";
import { useLocation } from "react-router-dom";
import axios from "../../api/axios";
import { ProgressSpinner } from "primereact/progressspinner";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const location = useLocation();
  const from = location.state?.from?.pathname || "/backoffice-challenge-5S1/";
  const { setAuth } = useAuth();
  const toast = useRef(null);
  const { layoutConfig } = useContext(LayoutContext);
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/login", {
        email: email,
        password: password,
      });
      if (response.data.token) {
        const accessToken = response.data.token;
        const refreshToken = response.data.refresh_token;
        verifyUserRole(accessToken, refreshToken);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: `Error ${error.response.data.code}`,
        detail: error.response.data.message,
        life: 3000,
      });
    }
  };

  const verifyUserRole = async (accessToken, refreshToken) => {
    try {
      const response = await axios.post(
        `/verify-role`,
        {
          email: email,
          refreshToken: refreshToken,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        setAuth({
          email: email,
          accessToken,
          userId: response.data.id,
          role: response.data.roles,
          nom: response.data.nom,
          prenom: response.data.prenom,
          refreshToken: refreshToken,
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: `Error ${error.response.data.code}`,
        detail: error.response.data.message,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  return (
    <div className={containerClassName}>
      <Toast ref={toast} />
      <div className="flex flex-column align-items-center justify-content-center">
        {isLoading && (
          <ProgressSpinner
            style={{ width: "50px", height: "50px" }}
          ></ProgressSpinner>
        )}
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)",
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8"
            style={{ borderRadius: "53px" }}
          >
            <div className="text-center mb-5">
              <span className="text-600 font-medium">
                Connectez-vous pour continuer
              </span>
            </div>

            <div>
              <label
                htmlFor="email1"
                className="block text-900 text-xl font-medium mb-2"
              >
                E-mail
              </label>
              <InputText
                id="email1"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full md:w-30rem mb-5"
                style={{ padding: "1rem" }}
              />

              <label
                htmlFor="password1"
                className="block text-900 font-medium text-xl mb-2"
              >
                Mot de passe
              </label>
              <Password
                inputId="password1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                toggleMask
                className="w-full mb-5"
                inputClassName="w-full p-3 md:w-30rem"
              ></Password>
              <div className="flex align-items-center justify-content-between mb-5 gap-5"></div>
              <Button
                label="Se connecter"
                className="w-full p-3 text-xl"
                onClick={handleSubmit}
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
