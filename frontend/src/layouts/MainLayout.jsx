import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import useVh from "@/utils/useVh";

const MainLayout = () => {
  // useVh();
  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center bg-white text-black dark:bg-primary dark:text-white">
      <Header />
      <main className="p-4 w-full h-full max-w-[480px] flex-grow flex flex-col justify-center items-center">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;
