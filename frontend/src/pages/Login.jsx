import { useEffect, useState } from "react";
import BaseButton from "@/components/BaseButton";
import { useNavigate } from "react-router-dom";
import { showSwal } from "@/utils/notification";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import Scene from "@/containers/login/geometry/Scene";
import { motion } from "framer-motion";
// import gifDefault from "@/assets/images/a-default.gif";
import gifBored from "@/assets/images/b-bored.gif";
import gifThinking from "@/assets/images/c-thinking.gif";
// import gifDance from "@/assets/images/d-dance.gif";
// import gifSad from "@/assets/images/e-sad.gif";

const Login = () => {
  const navigate = useNavigate();
  // const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  // const modelUrl = "/Robot_To_C_250415_02_noGlass.glb";
  // const [animationName, setAnimationName] = useState("");
  const [currentGif, setCurrentGif] = useState(gifBored);

  // useEffect(() => {
  //   if (localStorage.getItem("darkMode") === "false") {
  //     // setAnimationName("picboxAni");
  //     // setAnimationName("Default");
  //     // setAnimationName("Sad");
  //     // setAnimationName("Bored");
  //     // setAnimationName("Dance");
  //     setAnimationName("Thinking");
  //   }
  // }, [animationName]);

  const handleGifChange = () => {
    setCurrentGif((prevGif) => (prevGif === gifBored ? gifThinking : gifBored));
    // setTimeout(() => {
    //   setCurrentGif((prevGif) =>
    //     prevGif === gifBored ? gifThinking : gifBored
    //   );
    // }, 300);
  };

  const handleLogin = (taskName, userName) => {
    localStorage.setItem("userName", userName);
    showSwal({ isSuccess: true, title: `${taskName}!` });
    navigate("/");
  };

  const text = [
    "Hey, I am Echo!",
    "Your AI designer,",
    "Design, Generate, Print!",
  ];

  return (
    <>
      <div className="flex flex-col">
        {text.map((line, i) => (
          <motion.div
            key={i}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.76, 0, 0.24, 1],
              delay: i * 0.3,
            }}
            className="text-3xl"
          >
            {line}
          </motion.div>
        ))}
      </div>
      {/* <div className="flex flex-col">
        <h1 className="text-2xl">I am your Banner Generator</h1>
        <span>Economy,</span>
        <span>Convenience,</span>
        <span>Home Printing,</span>
        <span>O in one - ECHO!</span>
      </div> */}

      <img
        src={currentGif}
        alt="gif"
        className="cursor-pointer"
        onClick={handleGifChange}
      />

      {/* <div
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
            fov: 1,
            near: 0.1,
            far: 500,
            // position: [1, 12, 20],
            position: [1, 48, 72],
          }}
          onCreated={() => setIsCanvasLoaded(true)}
        >
          <Scene modelUrl={modelUrl} animationName={animationName} />
        </Canvas>
      </div> */}

      {/* <div className="absolute inset-0 flex flex-col justify-center items-center space-y-4"> */}
      <BaseButton
        className="w-full"
        onClick={() => handleLogin("Welcome", "Admin")}
      >
        Get Started
      </BaseButton>
      {/* </div> */}
    </>
  );
};

export default Login;
