import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { auth, setAuth } = useAuth();
  const refresh = async () => {
    const response = await axios.post(
      "/token/refresh",
      {
        withCredentials: true,
      },
      {
        headers: {
          Authorization: `Bearer ${auth?.refreshToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    setAuth((prev) => ({
      ...prev,
      accessToken: response.data.accessToken,
    }));
    return response.data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
