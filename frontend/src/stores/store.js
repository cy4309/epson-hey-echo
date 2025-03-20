import { configureStore } from "@reduxjs/toolkit";
import styleReducer from "@/stores/features/styleSlice";
import userReducer from "@/stores/features/userSlice";
import { thunk } from "redux-thunk";

export const store = configureStore({
  reducer: {
    style: styleReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});
