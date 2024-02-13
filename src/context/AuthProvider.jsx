import { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(
    JSON.parse(localStorage.getItem("auth") || "{}")
  );

  function setAuthData(data) {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth: setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
