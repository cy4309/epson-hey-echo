import BaseButton from "@/components/BaseButton";
import { useDispatch } from "react-redux";
import { toggleDarkMode } from "@/stores/features/styleSlice";
import { useNavigate } from "react-router-dom";
import { SunOutlined, LogoutOutlined } from "@ant-design/icons";
// import { CaretLeftOutlined } from "@ant-design/icons";
// import Login from "@/containers/Login";
// import { showSwal } from "@/utils/notification";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import picboxAvatar from "@/assets/images/picbox-avatar.png";

const Nav = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openMenu, setOpenMenu] = useState(false);

  const menuVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
    exit: {
      x: "100%",
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  };

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
    <>
      <nav className="fixed top-4 right-4 z-50">
        <div
          onClick={() => setOpenMenu(!openMenu)}
          className="group relative w-8 h-6"
        >
          <motion.img
            src={picboxAvatar}
            alt="picbox"
            className="w-full duration-100 cursor-pointer"
            whileTap={{ scale: 1.8 }}
          />
          {/* <motion.span
            className="absolute h-0.5 w-full bg-primary"
            animate={{ rotate: open ? 45 : 0, y: open ? 8 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="absolute h-0.5 w-full bg-primary top-1/2 -translate-y-1/2"
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="absolute h-0.5 w-full bg-primary bottom-0"
            animate={{ rotate: open ? -45 : 0, y: open ? -8 : 0 }}
            transition={{ duration: 0.3 }}
          /> */}
        </div>
      </nav>

      <AnimatePresence>
        {openMenu && (
          <motion.div
            className="opacity-80 fixed top-0 right-0 w-3/4 max-w-sm h-full bg-white/10 backdrop-blur-md border-l border-white/20 shadow-lg z-40 p-10 flex flex-col justify-center"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="w-full flex justify-center items-center">
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
            </div>
            {["Generate ->", "Print ->"].map((text, i) => {
              const routes = ["/", "/print"];
              return (
                <motion.div
                  key={text}
                  className="text-2xl my-6 font-semibold tracking-wider cursor-pointer"
                  variants={itemVariants}
                  custom={i}
                  onClick={() => navigate(routes[i])}
                >
                  {text}
                </motion.div>
              );
            })}
            <footer className="w-full">
              <p className="text-center text-sm text-gray-400">
                © 2025 Spe3d. All rights reserved
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* <nav className="container p-4 z-10 flex justify-between items-center">
        <div className="w-full flex justify-end items-center">
          <p className="text-sm mr-4 flex items-center">V0.0.1</p>
          <BaseButton
            className="mr-2 h-10"
            onClick={handleToggleDarkMode}
          >
            <SunOutlined />
          </BaseButton>
          <BaseButton className="mr-2 h-10" onClick={() => handleLogout()}>
            <LogoutOutlined />
          </BaseButton>
          <BaseButton
          label={isAuthenticated ? "Log Out" : "Log In"}
          onClick={handleAuth}
          // className={`text-white bg-primaryGray hover:bg-black dark:bg-white dark:text-primaryGray`}
          className={`${
            isAuthenticated
              ? "hover:bg-hoverGray dark:bg-primaryGray dark:text-white hover:dark:bg-hoverGray"
              : "bg-primaryGray text-white hover:bg-hoverGray dark:bg-white dark:text-primaryGray hover:dark:bg-hoverGray"
          }`}
        />
        </div>
      </nav> */}
    </>
  );
};

export default Nav;
