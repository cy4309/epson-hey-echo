import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import { Group } from "three";
import { GenerateImageModel } from "./GenerateImageModel";
import { useSelector } from "react-redux";

const Scene = ({ modelUrl }) => {
  const generateImageModelRef = useRef(null);
  const pageState = useSelector((state) => state.PageState);

  const { performance } = useControls("Monitoring", {
    performance: false,
  });

  const { animate: animateGenerateImageModel, rotation } = useControls(
    "GenerateImageModel",
    {
      animate: true,
      rotation: [0, 0, 0],
    }
  );

  // useFrame((_, delta) => {
  //   if (animateGenerateImageModel && generateImageModelRef.current) {
  //     generateImageModelRef.current.rotation.y += delta / 3;
  //   }
  // });

  return (
    <>
      {performance && <Perf position="top-left" />}
      <OrbitControls makeDefault />

      <directionalLight
        position={[-2, 2, 3]}
        // intensity={1.5}
        intensity={32}
        castShadow
        shadow-mapSize={[1024 * 2, 1024 * 2]}
      />
      <ambientLight intensity={4} />

      <GenerateImageModel
        url={modelUrl}
        ref={generateImageModelRef}
        rotation={rotation}
      />
    </>
  );
};

export { Scene };
