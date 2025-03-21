import { forwardRef, Suspense } from "react";
import { Model, ModelProps } from "./Model";

export const GenerateImageModel = forwardRef((props: ModelProps, ref) => {
  return (
    <Suspense fallback={null}>
      <Model
        ref={ref}
        url={props.url}
        position={[0, 0, 0]}
        rotation={props.rotation}
      />
    </Suspense>
  );
});
