import BaseButton from "@/components/BaseButton";
import { useDispatch } from "react-redux";
import { toggleDarkMode } from "@/stores/features/styleSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { SunOutlined, LogoutOutlined } from "@ant-design/icons";
// import { CaretLeftOutlined } from "@ant-design/icons";
// import Login from "@/containers/Login";
// import { showSwal } from "@/utils/notification";

const Nav = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const location = useLocation();
  // const isHomePage = location.pathname === "/";
  // const [isLoginOpen, setIsLoginOpen] = useState(false);
  // const isAuthenticated = localStorage.getItem("userName");

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
    const currentMode = localStorage.getItem("darkMode") === "true";
    localStorage.setItem("darkMode", !currentMode);
  };

  const handleLogout = () => {
    localStorage.removeItem("userName");
    navigate("/login");
  };

  // const handleAuth = () => {
  //   if (isAuthenticated) {
  //     // dispatch(logout());
  //     showSwal(true, "You have been logged out.");
  //     setIsLoginOpen(false);
  //     localStorage.removeItem("userName");
  //     navigate("/");
  //   } else {
  //     setIsLoginOpen(true);
  //   }
  // };

  return (
    <nav className="container p-4 z-10 flex justify-between items-center">
      <div className="w-full flex justify-end items-center">
        {/* <p className="text-sm mr-4 flex items-center">V0.0.1</p> */}
        <BaseButton
          className="mr-2 h-10"
          // onClick={() => dispatch(toggleDarkMode())}
          onClick={handleToggleDarkMode}
        >
          <SunOutlined />
        </BaseButton>
        <BaseButton className="mr-2 h-10" onClick={() => handleLogout()}>
          <LogoutOutlined />
        </BaseButton>
        {/* <BaseButton
          label={isAuthenticated ? "Log Out" : "Log In"}
          onClick={handleAuth}
          // className={`text-white bg-primaryGray hover:bg-black dark:bg-white dark:text-primaryGray`}
          className={`${
            isAuthenticated
              ? "hover:bg-hoverGray dark:bg-primaryGray dark:text-white hover:dark:bg-hoverGray"
              : "bg-primaryGray text-white hover:bg-hoverGray dark:bg-white dark:text-primaryGray hover:dark:bg-hoverGray"
          }`}
        /> */}
      </div>
    </nav>
  );
};

export default Nav;
