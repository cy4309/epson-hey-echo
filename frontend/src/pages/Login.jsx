import { useState } from "react";
import BaseButton from "@/components/BaseButton";
import { useNavigate } from "react-router-dom";
import { showSwal } from "@/utils/notification";
import { motion } from "framer-motion";
// import gifDefault from "@/assets/images/a-default.gif";
import gifBored from "@/assets/images/b-bored.gif";
import gifThinking from "@/assets/images/c-thinking.gif";
// import gifDance from "@/assets/images/d-dance.gif";
// import gifSad from "@/assets/images/e-sad.gif";

// import { useEffect, useRef } from "react";
// import { Canvas } from "@react-three/fiber";
// import { Leva } from "leva";
// import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
// import Scene from "@/containers/login/geometry/Scene";

const Login = () => {
  const navigate = useNavigate();
  // const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  // const modelUrl = "/Robot_To_C_250415_02_noGlass.glb"; // 如果要用模型，用這個
  // const [animationName, setAnimationName] = useState("");

  const [currentGif, setCurrentGif] = useState(gifBored);
  // const [currentGif, setCurrentGif] = useState("bored"); // 當前影片狀態
  // const [isPlayingFirst, setIsPlayingFirst] = useState(true); // 控制哪個 video 顯示
  // const videoRef1 = useRef(null);
  // const videoRef2 = useRef(null);

  // const gifSources = {
  //   bored: gifBored,
  //   thinking: gifThinking,
  // };

  // const handleGifChange = () => {
  //   const nextGif = currentGif === "bored" ? "thinking" : "bored";
  //   const nextIsPlayingFirst = !isPlayingFirst;

  //   const nextVideo = nextIsPlayingFirst
  //     ? videoRef1.current
  //     : videoRef2.current;
  //   const currentVideo = !nextIsPlayingFirst
  //     ? videoRef1.current
  //     : videoRef2.current;

  //   if (nextVideo) {
  //     nextVideo.src = gifSources[nextGif];
  //     nextVideo.load();
  //     nextVideo.play().catch((e) => console.warn("播放失敗:", e));
  //   }

  //   if (currentVideo) {
  //     currentVideo.pause();
  //   }

  //   setIsPlayingFirst(nextIsPlayingFirst);
  //   setCurrentGif(nextGif);
  // };

  const handleGifChange = () => {
    setCurrentGif((prevGif) => (prevGif === gifBored ? gifThinking : gifBored));
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
      <div className="p-4 w-full h-full max-w-4xl mx-auto border rounded-xl flex flex-col justify-center items-center">
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

        <img
          src={currentGif}
          alt="gif"
          className="min-h-[200px] cursor-pointer"
          onClick={handleGifChange}
        />

        {/* <div className="w-full h-[50vh] relative overflow-hidden">
        <video
          ref={videoRef1}
          autoPlay
          loop
          muted
          playsInline
          src={gifSources.bored}
          className={`absolute w-full h-full transition-opacity duration-100 cursor-pointer ${
            isPlayingFirst ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          onClick={handleGifChange} // 點擊切換影片
        />
        <video
          ref={videoRef2}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute w-full h-full transition-opacity duration-100 cursor-pointer ${
            isPlayingFirst ? "opacity-0 z-0" : "opacity-100 z-10"
          }`}
          onClick={handleGifChange} // 點擊切換影片
        />
      </div> */}

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
      </div>
    </>
  );
};

export default Login;
