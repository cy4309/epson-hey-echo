import axios from "axios";
const baseUrl = `${import.meta.env.BACKEND_API_URL}`;

export const postAddUser = async (data) => {
  return await axios
    .post(`${baseUrl}/user/signup`, { user: data })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/LogIn", msg: err };
    });
};

// -------------------------------------------------------------
// export async function postUserLogin(email, password) {
//   const response = await axios.post(`${baseUrl}/auth/login`, {
//     email: email,
//     password: password,
//   });
//   return response.data;
// }
export async function postUserLogin(userData) {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${baseUrl}/user/login`, userData);
      dispatch({ type: "user/loginSuccess", payload: response.data });
    } catch (error) {
      dispatch({ type: "user/loginError", payload: error.message });
    }
  };
}

// export async function postUserLogout() {
//   const response = await axios.post(`/api/auth/logout`);
//   return response.data;
// }
