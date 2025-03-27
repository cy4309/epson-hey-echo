import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import styleReducer from "@/stores/features/styleSlice";
import userReducer from "@/stores/features/userSlice";
import epsonReducer from "@/stores/features/epsonSlice";

export const store = configureStore({
  reducer: {
    style: styleReducer,
    user: userReducer,
    epson: epsonReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});
