import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MainLayout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-white text-black dark:bg-black dark:text-white">
      <Header />
      <main className="w-full max-w-[480px] flex-grow flex flex-col items-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
