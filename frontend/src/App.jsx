import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import "@/assets/styles/app.css";
import { ConfigProvider, theme } from "antd";
import { setDarkMode } from "@/stores/features/styleSlice";
import router from "@/routers/router";

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

// const Home = lazy(() => import("@/pages/Home"));
// const Print = lazy(() => import("@/pages/Print"));
// const Error = lazy(() => import("@/pages/Error"));

// const ProtectedRoute = ({ children }) => {
//   const navigate = useNavigate();
//   const isAuthenticated = localStorage.getItem("userName");

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate(router_path.login);
//     }
//   }, [isAuthenticated, navigate]);

//   return isAuthenticated ? children : null;
// };

// ProtectedRoute.propTypes = {
//   children: PropTypes.node,
// };

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
    <ConfigProvider
      theme={{
        algorithm: theme[isDarkMode ? "darkAlgorithm" : "defaultAlgorithm"],
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
    // <BrowserRouter>
    //   <ConfigProvider
    //     theme={{
    //       algorithm: theme[isDarkMode ? "darkAlgorithm" : "defaultAlgorithm"], //antd 5.0.0的寫法，而不是4.0.0的mode:"dark"寫法
    //     }}
    //   >
    //     <Routes>
    //       <Route element={<MainLayout />}>
    //         <Route
    //           path={router_path.index}
    //           element={
    //             <ProtectedRoute>
    //               <Suspense fallback={<LoadingIndicator />}>
    //                 <Home />
    //               </Suspense>
    //             </ProtectedRoute>
    //           }
    //         />
    //         <Route
    //           path={router_path.print}
    //           element={
    //             <ProtectedRoute>
    //               <Suspense fallback={<LoadingIndicator />}>
    //                 <Print />
    //               </Suspense>
    //             </ProtectedRoute>
    //           }
    //         />
    //         <Route path={router_path.login} element={<Login />} />
    //         <Route path={router_path.error} element={<Error />} />
    //       </Route>
    //     </Routes>
    //   </ConfigProvider>
    // </BrowserRouter>
  );
};

export default App;
