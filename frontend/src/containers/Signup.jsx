import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAddUser } from "@/services/authService";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const userSignup = async (e) => {
    e.preventDefault();
    const data = {
      username,
      email,
      password,
    };
    if (!data.email) {
      // toast.error("請輸入帳號");
      return;
    }
    if (!data.password) {
      // toast.error("請輸入密碼");
      return;
    }
    if (!data.username) {
      // toast.error("請輸入使用者名稱");
      return;
    }
    if (data.password.length < 6) {
      // toast.error("密碼長度至少六碼");
      return;
    }

    try {
      const response = await postAddUser(data);
      if (response.code === 200) {
        // toast.success("使用者新增成功");
        navigate("/login");
      }
    } catch (error) {
      // let msg = "";
      if (error.message.includes("401")) {
        // msg = "密碼至少六碼";
        // toast.error("登入錯誤：" + msg);
        navigate("/signup");
      }
      if (error.message.includes("403")) {
        // msg = "使用者尚未註冊";
        // toast.error("登入錯誤：" + msg);
        navigate("/signup");
      }
    }
  };

  const pushToDashBoard = () => {
    navigate("/");
  };

  const pushToLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <form className="vh-100 gradient-custom" onSubmit={userSignup}>
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
                      Signup System
                    </h2>
                    <p className="text-white-50 mb-5">|| 註冊帳號與密碼 ||</p>

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

                    <div className="form-outline form-white mb-4">
                      <label className="form-label" htmlFor="typeUsernameX">
                        Username
                      </label>
                      <input
                        type="text"
                        id="typeUsernameX"
                        className="form-control form-control-lg"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>

                    <button
                      className="btn btn-outline-light btn-lg px-5 w-100"
                      type="submit"
                    >
                      Send
                    </button>

                    <hr className="my-4 mb-5" />

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
                    <p className="mb-4">
                      Already have an account?
                      <span
                        className="text-white-50 fw-bold"
                        onClick={pushToLogin}
                        style={{ cursor: "pointer" }}
                      >
                        Log In
                      </span>
                    </p>
                    <button
                      className="btn btn-outline-light btn-lg px-5 w-100"
                      type="button"
                      onClick={pushToDashBoard}
                    >
                      Back
                    </button>
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

export default Signup;
