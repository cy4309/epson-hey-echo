import axios from "axios";
// const baseUrl = `${import.meta.env.BACKEND_API_URL}`;
// const baseUrl = "http://localhost:8000";
const baseUrl = "https://epson-hey-echo.onrender.com";

export const uploadImage = async (formData) => {
  console.log(formData);
  return await axios
    // .post(`${baseUrl}/upload-image`, { formData: formData })
    .post(`${baseUrl}/upload-image`, formData, {
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
    // .post(`${baseUrl}/upload-image`, { formData: formData })
    .post(`${baseUrl}/generate-multiple-pdfs`, payload, {
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
