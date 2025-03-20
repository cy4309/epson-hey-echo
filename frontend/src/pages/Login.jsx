import BaseButton from "@/components/BaseButton";
import { useNavigate } from "react-router-dom";
import { showSwal } from "@/utils/notification";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (userName) => {
    localStorage.setItem("userName", userName);
    showSwal({ isSuccess: true, title: `Welcome, ${userName}!` });
    navigate("/");
  };

  return (
    <>
      <div className="absolute inset-0 flex flex-col justify-center items-center space-y-4">
        <BaseButton className="w-2/3" onClick={() => handleLogin("Admin")}>
          登入
        </BaseButton>
      </div>
    </>
  );
};

export default Login;
