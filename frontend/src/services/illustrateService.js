import axios from "axios";
const backendBaseUrl = import.meta.env.VITE_BACKEND_API_BASE_URL;

export const uploadImage = async (formData) => {
  console.log(formData);
  return await axios
    .post(`${backendBaseUrl}/upload_image`, formData, {
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
  //@Joyce測試改formData
  const formData = new FormData();
  formData.append("image_filename", payload.image_filename);
  formData.append("content", payload.content);
  formData.append("font_size", payload.font_size);

  return await axios
    .post(`${backendBaseUrl}/generate-multiple-images`, formData, {
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
