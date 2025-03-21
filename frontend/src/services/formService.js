import axios from "axios";
// const baseUrl = `${import.meta.env.BACKEND_API_URL}`;
const baseUrl = "http://localhost:8000";

export const uploadImage = async (formData) => {
  console.log(formData);
  return await axios
    .post(`${baseUrl}/upload-image`, { formData: formData })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};
