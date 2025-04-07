import { forwardRef, Suspense } from "react";
import PropTypes from "prop-types";
import Model from "./Model";

export const GenerateImageModel = forwardRef(({ url, rotation }) => {
  return (
    <Suspense fallback={null}>
      <Model url={url} position={[0, 0, 0]} rotation={rotation} />
    </Suspense>
  );
});

GenerateImageModel.displayName = "GenerateImageModel";
GenerateImageModel.propTypes = {
  url: PropTypes.string.isRequired,
  rotation: PropTypes.arrayOf(PropTypes.number),
};

// GenerateImageModel.tsx
// import { forwardRef, Suspense } from "react";
// import { Model, ModelProps } from "./Model";

// export const GenerateImageModel = forwardRef((props: ModelProps, ref) => {
//   return (
//     <Suspense fallback={null}>
//       <Model
//         ref={ref}
//         url={props.url}
//         position={[0, 0, 0]}
//         rotation={props.rotation}
//       />
//     </Suspense>
//   );
// });
