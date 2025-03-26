import axios from "axios";

const backendBaseUrl = import.meta.env.VITE_BACKEND_API_BASE_URL;

export const generatePrompt = async (input, lang) => {
  return await axios
    .post(
      `${backendBaseUrl}/generate-prompt`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
      { input, lang }
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
