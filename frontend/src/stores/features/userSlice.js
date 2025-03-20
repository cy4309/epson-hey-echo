import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postUserLogin } from "@/services/authService";

export const userLogin = createAsyncThunk(
  "user/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await postUserLogin(userData.email, userData.password);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    loginStatus: null,
    user: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loginStatus = "success";
        state.user = action.payload;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loginStatus = "error";
      });
  },
});

export default userSlice.reducer;
