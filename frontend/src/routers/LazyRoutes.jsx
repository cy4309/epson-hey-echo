import { lazy } from "react";

export const LazyHome = lazy(() => import("@/pages/Home"));
export const LazyPrint = lazy(() => import("@/pages/Print"));
export const LazyScan = lazy(() => import("@/pages/Scan"));
export const LazyError = lazy(() => import("@/pages/Error"));

export default { LazyHome, LazyPrint, LazyScan, LazyError };
