import { useState } from "react";
import BaseButton from "@/components/BaseButton";
import { useNavigate } from "react-router-dom";
import { showSwal } from "@/utils/notification";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import Scene from "@/containers/login/geometry/Scene";

const Login = () => {
  const navigate = useNavigate();
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const modelUrl = "/picbox3.glb";

  const handleLogin = (taskName, userName) => {
    localStorage.setItem("userName", userName);
    showSwal({ isSuccess: true, title: `${taskName}!` });
    navigate("/");
  };

  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-2xl">I am your Banner Generator</h1>
        <span>Economy,</span>
        <span>Convenience,</span>
        <span>Home Printing,</span>
        <span>O in one - ECHO!</span>
      </div>
      <div
        className={`w-full h-[50vh] relative ${
          isCanvasLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-500`}
      >
        <div className="hidden">
          <Leva
            collapsed={true}
            oneLineLabels={false}
            flat={true}
            theme={{
              sizes: {
                titleBarHeight: "28px",
              },
              fontSizes: {
                root: "10px",
              },
            }}
          />
        </div>
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            toneMapping: ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
          }}
          camera={{
            fov: 3,
            near: 0.1,
            far: 500,
            position: [1, 12, 20],
          }}
          onCreated={() => setIsCanvasLoaded(true)}
        >
          <Scene modelUrl={modelUrl} />
        </Canvas>
      </div>
      {/* <div className="absolute inset-0 flex flex-col justify-center items-center space-y-4"> */}
      <BaseButton
        className="w-2/3"
        onClick={() => handleLogin("Let's go", "Admin")}
      >
        Get Started
      </BaseButton>
      {/* </div> */}
    </>
  );
};

export default Login;
