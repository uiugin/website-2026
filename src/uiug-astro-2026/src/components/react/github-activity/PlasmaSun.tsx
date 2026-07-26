import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBodyMeta, PlanetId } from './planetMetrics';

type FocusId = PlanetId | 'astronaut';

interface PlasmaSunProps {
  radius: number;
  meta?: CelestialBodyMeta;
  activeId: FocusId | null;
  reducedMotion: boolean;
  onSelect: (id: PlanetId) => void;
  onHover: (id: FocusId | null) => void;
}

/**
 * Procedural plasma sun — turbulent convection surface.
 * Bloom handles soft glow (no concentric corona shells).
 */
const PlasmaSun: React.FC<PlasmaSunProps> = ({
  radius,
  meta,
  activeId,
  reducedMotion,
  onSelect,
  onHover,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const blendRef = useRef(0);
  const isActive = activeId === 'sun';

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 1 },
    }),
    []
  );

  useFrame((_, delta) => {
    const speed = reducedMotion ? 1 : Math.min(1, delta * 3.4);
    blendRef.current = THREE.MathUtils.lerp(blendRef.current, isActive ? 1 : 0, speed);

    if (matRef.current) {
      if (!reducedMotion) matRef.current.uniforms.uTime.value += delta * 0.35;
      matRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(1, 1.2, blendRef.current);
    }

    if (groupRef.current) {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(performance.now() * 0.0015) * 0.012;
      const target = (isActive ? 1.04 : 1) * pulse;
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, target, speed)
      );
      if (!reducedMotion) groupRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <group ref={groupRef}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect('sun');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            onHover('sun');
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
            onHover(null);
          }}
        >
          <sphereGeometry args={[radius, 96, 96]} />
          <shaderMaterial
            ref={matRef}
            uniforms={uniforms}
            toneMapped={false}
            vertexShader={`
              varying vec3 vPos;
              void main() {
                vPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uTime;
              uniform float uIntensity;
              varying vec3 vPos;

              // Hash / value noise for plasma cells
              float hash(vec3 p) {
                p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
              }

              float noise(vec3 x) {
                vec3 i = floor(x);
                vec3 f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                  mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                      mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                  mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                      mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
                  f.z
                );
              }

              float fbm(vec3 p) {
                float v = 0.0;
                float a = 0.5;
                for (int i = 0; i < 5; i++) {
                  v += a * noise(p);
                  p = p * 2.15 + vec3(1.7, 9.2, 3.1);
                  a *= 0.5;
                }
                return v;
              }

              void main() {
                vec3 p = normalize(vPos) * 2.8;
                float t = uTime;

                // Flowing convection / filament pattern
                float n1 = fbm(p + vec3(t * 0.15, t * 0.08, -t * 0.1));
                float n2 = fbm(p * 2.2 - vec3(t * 0.2, -t * 0.12, t * 0.05));
                float cells = n1 * 0.65 + n2 * 0.35;
                float ridges = pow(smoothstep(0.35, 0.85, cells), 1.4);
                float deep = 1.0 - smoothstep(0.15, 0.55, cells);

                vec3 dark = vec3(0.55, 0.12, 0.02);
                vec3 mid = vec3(1.0, 0.38, 0.05);
                vec3 bright = vec3(1.0, 0.82, 0.25);
                vec3 hot = vec3(1.0, 0.95, 0.75);

                vec3 col = mix(dark, mid, 1.0 - deep);
                col = mix(col, bright, ridges);
                col = mix(col, hot, pow(ridges, 2.5) * 0.85);

                col *= uIntensity * 1.15;
                gl_FragColor = vec4(col, 1.0);
              }
            `}
          />
        </mesh>
      </group>

      {isActive && meta && meta.metrics.length > 0 && (
        <>
          <Line
            points={[
              new THREE.Vector3(0, radius * 0.15, 0),
              new THREE.Vector3(radius * 1.5, radius * 1.35, 0),
            ]}
            color="#cbd5e1"
            lineWidth={1}
            transparent
            opacity={0.75}
          />
          <mesh position={[radius * 0.12, radius * 0.12, 0]} raycast={() => undefined}>
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <Html
            distanceFactor={9}
            position={[radius * 1.75, radius * 1.55, 0]}
            style={{ pointerEvents: 'none' }}
            zIndexRange={[100, 0]}
          >
            <div className="min-w-[11rem] max-w-[15rem] w-max px-3 py-2.5 bg-black/85 text-white border border-white/70">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wide border-b border-white/25 pb-1.5 mb-1.5 flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.symbolColor }}
                  aria-hidden
                />
                <span className="min-w-0 break-words leading-tight text-accent-yellow">{meta.label}</span>
              </div>
              <ul className="space-y-1">
                {meta.metrics.slice(0, 4).map((m) => (
                  <li
                    key={m.label}
                    className="font-mono text-[10px] font-bold uppercase leading-snug break-words flex justify-between gap-3"
                  >
                    <span className="text-white/70">{m.label}</span>
                    <span className="text-white text-right break-words">{m.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Html>
        </>
      )}
    </group>
  );
};

export default PlasmaSun;
