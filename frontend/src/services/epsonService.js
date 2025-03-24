import axios from "axios";
const epsonAuthUrl = import.meta.env.VITE_EPSON_API_AUTH_URL;
const epsonBaseUrl = import.meta.env.VITE_EPSON_API_BASE_URL;

export const getAuthorizationCode = async () => {
  return await axios.get(
    `${epsonAuthUrl}/auth/authorize?response_type=code&client_id=${
      import.meta.env.VITE_EPSON_CLIENT_ID
    }&redirect_uri=${import.meta.env.VITE_EPSON_REDIRECT_URI}&scope=device`
  );
};

export const getPrinterInfo = async (accessToken) => {
  return await axios
    .get(`${epsonBaseUrl}/printer`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};
