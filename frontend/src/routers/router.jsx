import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Suspense } from "react";
import { router_path } from "@/routers";
import Login from "@/pages/Login";
import ProtectedRoute from "@/routers/ProtectedRoute";
import { LazyHome, LazyPrint, LazyError } from "@/routers/LazyRoutes";

const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      children: [
        {
          path: router_path.index,
          element: (
            <ProtectedRoute>
              <Suspense fallback={<LoadingIndicator />}>
                <LazyHome />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: router_path.print,
          element: (
            <ProtectedRoute>
              <Suspense fallback={<LoadingIndicator />}>
                <LazyPrint />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/error",
          element: <LazyError />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true, // ✅ 啟用 future flag
    },
  }
);

export default router;
