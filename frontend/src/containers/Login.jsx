import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { postUserLogin } from "@/services/authService";
// import { toast } from "react-toastify";
// import { useCookies } from "react-cookie";
// import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginStatus = useSelector((state) => state.user.loginStatus);
  // const [cookies, setCookie] = useCookies(["username"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const userData = {
      email,
      password,
    };
    // if (!userData.email) {
    //   toast.error("登入錯誤：請輸入帳號");
    //   return;
    // }
    // if (!userData.password) {
    //   toast.error("登入錯誤：請輸入密碼");
    //   return;
    // }
    dispatch(postUserLogin(userData));
  };

  if (loginStatus === "success") {
    // toast.success("登入成功！歡迎！");
    // setCookie("username", email);
    window.location.reload();
  } else if (loginStatus === "error") {
    // toast.error("登入錯誤：請檢查帳號或密碼");
  }

  const pushToSignUp = () => {
    navigate("/signup");
  };

  return (
    <>
      <form className="vh-100 gradient-custom" onSubmit={handleLogin}>
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-7">
              <div
                className="card bg-dark text-white"
                style={{ border: "3px solid #fff" }}
              >
                <div className="card-body p-5 text-center">
                  <div className="mb-md-5 mt-md-4 pb-5">
                    <h2
                      className="fw-bold mb-2 text-uppercase"
                      style={{ fontFamily: "Anton" }}
                    >
                      Login System
                    </h2>
                    <p className="text-white-50 mb-5">|| 登入帳號與密碼 ||</p>

                    <div className="form-outline form-white mb-4">
                      <label className="form-label" htmlFor="typeEmailX">
                        Email
                      </label>
                      <input
                        type="email"
                        id="typeEmailX"
                        className="form-control form-control-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-outline form-white mb-4">
                      <label className="form-label" htmlFor="typePasswordX">
                        Password
                      </label>
                      <input
                        type="password"
                        id="typePasswordX"
                        className="form-control form-control-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <button
                      className="btn btn-outline-light btn-lg px-5 w-100"
                      type="submit"
                      id="submitBtn"
                    >
                      Login
                    </button>

                    <hr className="my-4" />

                    <button
                      className="btn btn-outline-light btn-lg px-5 w-100"
                      type="button"
                    >
                      <i className="fab fa-google mr-3"></i> Sign in with Google
                    </button>
                    <button
                      className="btn btn-outline-light btn-lg px-5 w-100"
                      type="button"
                    >
                      <i className="fab fa-facebook-f mr-3"></i> Sign in with
                      Facebook
                    </button>
                  </div>

                  <div>
                    <p className="pb-lg-2">
                      <a href="/forgot-password" className="text-white-50">
                        Forgot password?
                      </a>
                    </p>

                    <p className="mb-1">
                      Do not have an account?
                      <span
                        className="text-white-50 fw-bold"
                        onClick={pushToSignUp}
                        style={{ cursor: "pointer" }}
                      >
                        Sign Up
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default Login;
