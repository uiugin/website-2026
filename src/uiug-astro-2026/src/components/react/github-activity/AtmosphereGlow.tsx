import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AtmosphereGlowProps {
  radius: number;
  color?: string;
  intensity?: number;
  /** 0–1 focus blend; prefer ref so parent useFrame can drive without re-renders */
  activeBlendRef?: React.MutableRefObject<number>;
}

/**
 * Fresnel-style atmosphere rim (BackSide + additive).
 * Feels closer to NASA Earth glow than a flat sphere shell.
 */
const AtmosphereGlow: React.FC<AtmosphereGlowProps> = ({
  radius,
  color = '#5eb8ff',
  intensity = 1,
  activeBlendRef,
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      coeficient: { value: 0.55 },
      power: { value: 3.2 },
      uIntensity: { value: intensity },
    }),
    [color, intensity]
  );

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    const blend = activeBlendRef?.current ?? 0;
    // Atmosphere always visible; stronger when focused
    mat.uniforms.uIntensity.value = THREE.MathUtils.lerp(0.85, 1.45, blend) * intensity;
    mat.uniforms.coeficient.value = THREE.MathUtils.lerp(0.52, 0.64, blend);
  });

  return (
    <mesh scale={1.08} raycast={() => undefined}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vWorldNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          uniform vec3 glowColor;
          uniform float coeficient;
          uniform float power;
          uniform float uIntensity;
          void main() {
            float intensity = pow(coeficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
            intensity = clamp(intensity, 0.0, 1.0) * uIntensity;
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
          }
        `}
      />
    </mesh>
  );
};

export default AtmosphereGlow;
