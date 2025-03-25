import { useEffect, useState } from "react";
// import LoadingIndicator from "@/components/LoadingIndicator";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import Scene from "@/containers/home/geometry/Scene";
// import { useLocation, useNavigate } from "react-router-dom";

const Home = () => {
  // const [isLoading, setIsLoading] = useState(true);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const modelUrl = "/picbox3.glb";
  // const location = useLocation();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //   const authCode = params.get("code");

  //   if (authCode) {
  //     // 還需把authCode傳進redux
  //     navigate("/preview");
  //   }
  // }, [location, navigate]);

  // if (isLoading) {
  //   return <LoadingIndicator />;
  // }
  return (
    <>
      <div
        className={`w-full h-[80vh] relative ${
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
            position: [5, 8, 24],
          }}
          onCreated={() => setIsCanvasLoaded(true)}
        >
          <Scene modelUrl={modelUrl} />
        </Canvas>
      </div>
    </>
  );
};

export default Home;
