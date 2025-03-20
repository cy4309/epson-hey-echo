import { useEffect, Suspense, lazy } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { router_path } from "@/routers";
import LoadingIndicator from "@/components/LoadingIndicator";
import "@/assets/styles/app.css";
import { ConfigProvider, theme } from "antd";
import MainLayout from "@/layouts/MainLayout";
import Login from "@/pages/Login";
import { setDarkMode } from "@/stores/features/styleSlice";
import PropTypes from "prop-types";

// const ProtectedRoute = ({ children }) => {
//   const navigate = useNavigate();
//   // const isAuthenticated = useSelector(
//   //   (state: RootState) => state.auth.isAuthenticated
//   // );
//   const isAuthenticated = localStorage.getItem("userName");
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate(router_path.index);
//     }
//   }, [isAuthenticated, navigate]);

//   return isAuthenticated ? children : null;
// };

const Home = lazy(() => import("@/pages/Home"));
// const Login = lazy(() => import("@/pages/Login"));
const Error = lazy(() => import("@/pages/Error"));

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("userName");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(router_path.login);
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

const App = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.style.isDarkMode);

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    dispatch(setDarkMode(darkMode));
  }, [dispatch]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme[isDarkMode ? "darkAlgorithm" : "defaultAlgorithm"], //antd 5.0.0的寫法，而不是4.0.0的mode:"dark"寫法
        }}
      >
        <Routes>
          <Route element={<MainLayout />}>
            <Route
              path={router_path.index}
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingIndicator />}>
                    <Home />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path={router_path.login} element={<Login />} />
            <Route path={router_path.error} element={<Error />} />
          </Route>
        </Routes>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
