import axios from "axios";
const backendBaseUrl = import.meta.env.VITE_BACKEND_API_BASE_URL;

export const uploadImage = async (formData) => {
  console.log(formData);
  return await axios
    .post(`${backendBaseUrl}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

export const generateMultiplePdfs = async (payload) => {
  return await axios
    .post(`${backendBaseUrl}/generate-multiple-images`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};
