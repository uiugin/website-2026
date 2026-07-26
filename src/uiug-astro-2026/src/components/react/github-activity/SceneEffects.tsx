import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/** Balanced bloom — luminous sun without washing the planets. */
const SceneEffects: React.FC<{ reducedMotion?: boolean }> = ({ reducedMotion = false }) => {
  if (reducedMotion) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.35}
        luminanceSmoothing={0.4}
        intensity={1.35}
        mipmapBlur
        radius={0.6}
      />
      <Vignette offset={0.22} darkness={0.28} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
};

export default SceneEffects;
