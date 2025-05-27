import { configureStore } from "@reduxjs/toolkit";
import styleReducer from "@/stores/features/styleSlice";
import epsonReducer from "@/stores/features/epsonSlice";
// import { thunk } from "redux-thunk";

export const store = configureStore({
  reducer: {
    style: styleReducer,
    epson: epsonReducer,
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});
