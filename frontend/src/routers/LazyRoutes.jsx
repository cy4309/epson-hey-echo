import { lazy } from "react";

export const LazyHome = lazy(() => import("@/pages/Home"));
export const LazyPrint = lazy(() => import("@/pages/Print"));
export const LazyError = lazy(() => import("@/pages/Error"));

export default { LazyHome, LazyPrint, LazyError };
