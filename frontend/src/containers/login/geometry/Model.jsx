import { forwardRef, useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import PropTypes from "prop-types";

const Model = forwardRef(({ url, animationName, position, rotation }) => {
  const { scene, animations } = useGLTF(url);
  const group = useRef();
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions) {
      if (actions[animationName]) {
        actions[animationName].reset().play();
        // console.log(`Playing animation: ${animationName}`);
      } else {
        console.warn(`Animation '${animationName}' not found.`);
      }
    }
  }, [actions]);

  // return scene ? (
  //   <primitive
  //     // ref={ref}
  //     // ref={ref || group} // 支持外部傳入的 ref
  //     ref={group}
  //     object={scene}
  //     position={position}
  //     rotation={rotation}
  //   />
  // ) : null;
  return scene ? (
    <group ref={group} position={position} rotation={rotation}>
      <primitive object={scene} />
    </group>
  ) : null;
});

Model.displayName = "Model";

Model.propTypes = {
  url: PropTypes.string.isRequired,
  animationName: PropTypes.string.isRequired,
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
};

export default Model;

// Model.tsx
// import { forwardRef, useEffect, useRef } from "react";
// import { useGLTF, useAnimations } from "@react-three/drei";

// interface ModelProps {
//   url: string;
//   position?: [number, number, number];
//   rotation?: [number, number, number];
// }

// const Model = forwardRef((props: ModelProps, ref) => {
//   const { scene, animations } = useGLTF(props.url);
//   const group = useRef();
//   const { actions } = useAnimations(animations, group);

//   useEffect(() => {
//     if (actions) {
//       // console.log("Available animations:", Object.keys(actions));
//       const animationName = "picbox-ani";
//       if (actions[animationName]) {
//         actions[animationName].reset().play();
//         // console.log(`Playing animation: ${animationName}`);
//       } else {
//         console.warn(`Animation '${animationName}' not found.`);
//       }
//     }
//   }, [actions]);

//   return scene ? (
//     <primitive
//       // ref={ref}
//       ref={group}
//       object={scene}
//       position={props.position}
//       rotation={props.rotation}
//     />
//   ) : null;
// });

// export type { ModelProps };
// export { Model };
