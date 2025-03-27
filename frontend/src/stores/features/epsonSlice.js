import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authCode: "",
  // accessToken: "",
  // refreshToken: "",
  // jobId: "",
  // uploadUri: "",
  // printExecutionStatus: "",
  // printJobCreationStatus: "",
  // fileUploadStatus: "",
};

export const epsonSlice = createSlice({
  name: "epson",
  initialState,
  reducers: {
    setAuthCode(state, action) {
      console.log(state);
      state.authCode = action.payload;
    },
    // setAccessToken(state, action) {
    //   console.log(state);
    //   state.accessToken = action.payload;
    // },
    // setRefreshToken(state, action) {
    //   console.log(state);
    //   state.refreshToken = action.payload;
    // },
    // setJobId(state, action) {
    //   console.log(state);
    //   state.jobId = action.payload;
    // },
    // setUploadUri(state, action) {
    //   console.log(state);
    //   state.uploadUri = action.payload;
    // },
  },
});

export const {
  setAuthCode,
  // setAccessToken,
  // setRefreshToken,
  // setJobId,
  // setUploadUri,
} = epsonSlice.actions;
export default epsonSlice.reducer;
