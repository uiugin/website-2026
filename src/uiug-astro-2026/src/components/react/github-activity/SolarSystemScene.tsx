import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CelestialBodyMeta, PlanetId } from './planetMetrics';
import { PLANET_TEXTURE_URLS } from './planetTextureUrls';
import SpaceAstronaut from './SpaceAstronaut';
import AtmosphereGlow from './AtmosphereGlow';
import PlasmaSun from './PlasmaSun';

export type SceneFocusId = PlanetId | 'astronaut';

const EARTH_NORMAL_SCALE = new THREE.Vector2(0.85, 0.85);

interface BodyVisual {
  id: PlanetId;
  position: [number, number, number];
  radius: number;
  kind: 'sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'asteroid';
  orbitRadius?: number;
  ring?: boolean;
}

function buildVisuals(bodies: CelestialBodyMeta[]): BodyVisual[] {
  const asteroidBodies = bodies.filter((b) => String(b.id).startsWith('asteroid-'));
  // Reference #2: full readable system (sun not dominating)
  const visuals: BodyVisual[] = [
    { id: 'sun', position: [0, 0, 0], radius: 0.78, kind: 'sun' },
    { id: 'mercury', position: [1.55, 0.04, 0.2], radius: 0.09, kind: 'mercury', orbitRadius: 1.55 },
    { id: 'venus', position: [2.15, -0.05, -0.25], radius: 0.13, kind: 'venus', orbitRadius: 2.15 },
    { id: 'earth', position: [2.9, 0.06, 0.15], radius: 0.17, kind: 'earth', orbitRadius: 2.9 },
    { id: 'moon', position: [3.35, 0.18, 0.42], radius: 0.085, kind: 'moon', orbitRadius: 2.9 },
    { id: 'mars', position: [3.85, -0.04, 0.45], radius: 0.13, kind: 'mars', orbitRadius: 3.85 },
    { id: 'jupiter', position: [5.55, 0.08, -0.35], radius: 0.32, kind: 'jupiter', orbitRadius: 5.55 },
    {
      id: 'saturn',
      position: [7.05, -0.05, 0.55],
      radius: 0.26,
      kind: 'saturn',
      orbitRadius: 7.05,
      ring: true,
    },
  ];

  asteroidBodies.forEach((body, i) => {
    const angle = (i / Math.max(asteroidBodies.length, 1)) * Math.PI * 2 + 0.4;
    const r = 4.45 + (i % 3) * 0.1;
    visuals.push({
      id: body.id,
      position: [Math.cos(angle) * r, ((i % 5) - 2) * 0.04, Math.sin(angle) * r],
      radius: 0.04 + (i % 3) * 0.012,
      kind: 'asteroid',
      orbitRadius: 4.55,
    });
  });

  return visuals;
}

function configureColorMap(tex: THREE.Texture): THREE.Texture {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function configureDataMap(tex: THREE.Texture): THREE.Texture {
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** City lights only on the night side (N·L toward the Sun at origin). */
function attachEarthNightShader(mat: THREE.MeshStandardMaterial, nightMap: THREE.Texture) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uNightMap = { value: nightMap };
    shader.uniforms.uNightIntensity = { value: 1.35 };
    shader.uniforms.uSunWorld = { value: new THREE.Vector3(0, 0, 0) };
    mat.userData.shader = shader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>\nvarying vec3 vWorldPos;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
uniform sampler2D uNightMap;
uniform float uNightIntensity;
uniform vec3 uSunWorld;
varying vec3 vWorldPos;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
{
  vec3 nightCol = texture2D(uNightMap, vMapUv).rgb;
  vec3 toSun = normalize(uSunWorld - vWorldPos);
  float day = clamp(dot(normal, toSun), 0.0, 1.0);
  float nightFactor = 1.0 - smoothstep(0.0, 0.35, day);
  totalEmissiveRadiance += nightCol * nightFactor * uNightIntensity;
}`
    );
  };
  mat.needsUpdate = true;
}

function usePlanetTextures() {
  const maps = useTexture({
    sun: PLANET_TEXTURE_URLS.sun,
    mercury: PLANET_TEXTURE_URLS.mercury,
    mercuryBump: PLANET_TEXTURE_URLS.mercuryBump,
    venus: PLANET_TEXTURE_URLS.venus,
    venusBump: PLANET_TEXTURE_URLS.venusBump,
    earth: PLANET_TEXTURE_URLS.earth,
    earthClouds: PLANET_TEXTURE_URLS.earthClouds,
    earthSpecular: PLANET_TEXTURE_URLS.earthSpecular,
    earthNormal: PLANET_TEXTURE_URLS.earthNormal,
    earthNight: PLANET_TEXTURE_URLS.earthNight,
    moon: PLANET_TEXTURE_URLS.moon,
    moonBump: PLANET_TEXTURE_URLS.moonBump,
    mars: PLANET_TEXTURE_URLS.mars,
    marsBump: PLANET_TEXTURE_URLS.marsBump,
    jupiter: PLANET_TEXTURE_URLS.jupiter,
    saturn: PLANET_TEXTURE_URLS.saturn,
    saturnRing: PLANET_TEXTURE_URLS.saturnRing,
    saturnRingAlpha: PLANET_TEXTURE_URLS.saturnRingAlpha,
    asteroid: PLANET_TEXTURE_URLS.asteroid,
  });

  return useMemo(() => {
    const cloneColor = (t: THREE.Texture) => configureColorMap(t.clone());
    const cloneData = (t: THREE.Texture) => configureDataMap(t.clone());
    return {
      sun: cloneColor(maps.sun),
      mercury: cloneColor(maps.mercury),
      mercuryBump: cloneData(maps.mercuryBump),
      venus: cloneColor(maps.venus),
      venusBump: cloneData(maps.venusBump),
      earth: cloneColor(maps.earth),
      earthClouds: cloneColor(maps.earthClouds),
      earthSpecular: cloneData(maps.earthSpecular),
      earthNormal: cloneData(maps.earthNormal),
      earthNight: cloneColor(maps.earthNight),
      moon: cloneColor(maps.moon),
      moonBump: cloneData(maps.moonBump),
      mars: cloneColor(maps.mars),
      marsBump: cloneData(maps.marsBump),
      jupiter: cloneColor(maps.jupiter),
      saturn: cloneColor(maps.saturn),
      saturnRing: cloneColor(maps.saturnRing),
      saturnRingAlpha: cloneData(maps.saturnRingAlpha),
      asteroid: cloneColor(maps.asteroid),
    };
  }, [maps]);
}

type TexPack = ReturnType<typeof usePlanetTextures>;

interface PlanetMeshProps {
  visual: BodyVisual;
  meta?: CelestialBodyMeta;
  activeId: SceneFocusId | null;
  reducedMotion: boolean;
  textures: TexPack;
  onSelect: (id: PlanetId) => void;
  onHover: (id: SceneFocusId | null) => void;
}

const PlanetMesh: React.FC<PlanetMeshProps> = ({
  visual,
  meta,
  activeId,
  reducedMotion,
  textures,
  onSelect,
  onHover,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const cloudMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const coronaMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const blendRef = useRef(0);
  const dimRef = useRef(0);
  const shaderReady = useRef(false);

  const colorMap =
    visual.kind === 'sun'
      ? textures.sun
      : visual.kind === 'mercury'
        ? textures.mercury
        : visual.kind === 'venus'
          ? textures.venus
          : visual.kind === 'earth'
            ? textures.earth
            : visual.kind === 'moon'
              ? textures.moon
              : visual.kind === 'mars'
                ? textures.mars
                : visual.kind === 'jupiter'
                  ? textures.jupiter
                  : visual.kind === 'saturn'
                    ? textures.saturn
                    : textures.asteroid;

  const bumpMap =
    visual.kind === 'mercury'
      ? textures.mercuryBump
      : visual.kind === 'venus'
        ? textures.venusBump
        : visual.kind === 'moon'
          ? textures.moonBump
          : visual.kind === 'mars'
            ? textures.marsBump
            : null;

  const normalMap = visual.kind === 'earth' ? textures.earthNormal : null;

  useEffect(() => {
    const mat = matRef.current;
    if (!mat || shaderReady.current || visual.kind !== 'earth') return;
    attachEarthNightShader(mat, textures.earthNight);
    shaderReady.current = true;
  }, [visual.kind, textures.earthNight]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const mat = matRef.current;
    if (!group || !mat) return;

    const isActive = activeId === visual.id;
    const dimOthers = activeId != null && activeId !== 'astronaut' && !isActive;
    const speed = reducedMotion ? 1 : Math.min(1, delta * 3.4);
    blendRef.current = THREE.MathUtils.lerp(blendRef.current, isActive ? 1 : 0, speed);
    dimRef.current = THREE.MathUtils.lerp(dimRef.current, dimOthers ? 1 : 0, speed);

    // Soft dim — keep planets colorful when another body is focused
    const brightness = THREE.MathUtils.lerp(1.15, 0.78, dimRef.current);
    mat.color.setRGB(brightness, brightness, brightness);

    const nightShader = mat.userData.shader as
      | { uniforms: { uNightIntensity: { value: number } } }
      | undefined;
    if (nightShader?.uniforms?.uNightIntensity) {
      nightShader.uniforms.uNightIntensity.value = THREE.MathUtils.lerp(
        1.15,
        1.85,
        blendRef.current
      );
    }

    if (visual.kind === 'sun') {
      mat.emissive.set('#ffb14a');
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(2.1, 0.85, dimRef.current),
        3.4,
        blendRef.current
      );
      mat.emissiveMap = colorMap;
      if (coronaMatRef.current) {
        coronaMatRef.current.opacity = THREE.MathUtils.lerp(
          THREE.MathUtils.lerp(0.32, 0.12, dimRef.current),
          0.55,
          blendRef.current
        );
        const pulse = reducedMotion ? 1 : 1 + Math.sin(performance.now() * 0.002) * 0.05;
        coronaMatRef.current.color.set('#ffc266');
        group.scale.setScalar(
          THREE.MathUtils.lerp(group.scale.x, (isActive ? 1.07 : dimOthers ? 0.92 : 1) * pulse, speed)
        );
      }
      if (glowMatRef.current) {
        glowMatRef.current.opacity = THREE.MathUtils.lerp(
          THREE.MathUtils.lerp(0.35, 0.12, dimRef.current),
          0.55,
          blendRef.current
        );
        glowMatRef.current.color.set('#ffb347');
      }
    } else if (visual.kind === 'earth') {
      mat.roughness = THREE.MathUtils.lerp(0.5, 0.32, blendRef.current);
      mat.metalness = THREE.MathUtils.lerp(0.1, 0.22, blendRef.current);
      if (cloudMatRef.current) {
        cloudMatRef.current.opacity = THREE.MathUtils.lerp(
          THREE.MathUtils.lerp(0.48, 0.28, dimRef.current),
          0.72,
          blendRef.current
        );
        const cb = THREE.MathUtils.lerp(1.1, 0.78, dimRef.current);
        cloudMatRef.current.color.setRGB(cb, cb, cb);
      }
    } else if (visual.kind === 'moon') {
      mat.roughness = THREE.MathUtils.lerp(0.95, 0.85, blendRef.current);
    } else if (visual.kind === 'mars') {
      mat.roughness = THREE.MathUtils.lerp(0.9, 0.75, blendRef.current);
    } else if (visual.kind === 'jupiter') {
      if (!reducedMotion && mat.map) {
        mat.map.offset.x = (mat.map.offset.x + delta * 0.015) % 1;
      }
    }

    if (ringMatRef.current) {
      ringMatRef.current.opacity = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(0.88, 0.55, dimRef.current),
        0.98,
        blendRef.current
      );
    }

    if (visual.kind !== 'sun') {
      const scaleTarget = isActive ? 1.07 : dimOthers ? 0.92 : 1;
      const s = THREE.MathUtils.lerp(group.scale.x, scaleTarget, speed);
      group.scale.setScalar(s);
    }

    if (!reducedMotion) {
      const spin =
        visual.kind === 'sun'
          ? 0.04
          : visual.kind === 'earth'
            ? 0.07
            : visual.kind === 'jupiter' || visual.kind === 'saturn'
              ? 0.1
              : 0.06;
      group.rotation.y += delta * spin;
      if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.11;
    }
  });

  return (
    <group position={visual.position}>
      <group ref={groupRef}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect(visual.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            onHover(visual.id);
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
            onHover(null);
          }}
        >
          <sphereGeometry args={[visual.radius, visual.kind === 'sun' ? 48 : 64, visual.kind === 'sun' ? 48 : 64]} />
          <meshStandardMaterial
            ref={matRef}
            map={colorMap}
            normalMap={normalMap ?? undefined}
            normalScale={visual.kind === 'earth' ? EARTH_NORMAL_SCALE : undefined}
            bumpMap={bumpMap ?? undefined}
            bumpScale={
              visual.kind === 'mercury' || visual.kind === 'venus'
                ? 0.04
                : visual.kind === 'moon'
                  ? 0.05
                  : visual.kind === 'mars'
                    ? 0.035
                    : 0
            }
            roughnessMap={visual.kind === 'earth' ? textures.earthSpecular : undefined}
            metalnessMap={visual.kind === 'earth' ? textures.earthSpecular : undefined}
            color="#ffffff"
            emissive={visual.kind === 'sun' ? '#ffb14a' : '#1a1210'}
            emissiveIntensity={visual.kind === 'sun' ? 2.1 : 0.08}
            roughness={
              visual.kind === 'moon'
                ? 0.88
                : visual.kind === 'mars'
                  ? 0.72
                  : visual.kind === 'jupiter' || visual.kind === 'saturn'
                    ? 0.48
                    : visual.kind === 'earth'
                      ? 0.45
                      : visual.kind === 'venus'
                        ? 0.55
                        : visual.kind === 'mercury'
                          ? 0.7
                          : 0.75
            }
            metalness={visual.kind === 'earth' ? 0.06 : 0.02}
          />
        </mesh>

        {visual.kind === 'earth' && (
          <mesh ref={cloudRef} raycast={() => undefined}>
            <sphereGeometry args={[visual.radius * 1.018, 48, 48]} />
            <meshStandardMaterial
              ref={cloudMatRef}
              map={textures.earthClouds}
              transparent
              opacity={0.42}
              depthWrite={false}
              roughness={1}
              metalness={0}
            />
          </mesh>
        )}

        {visual.kind === 'earth' && (
          <AtmosphereGlow radius={visual.radius} activeBlendRef={blendRef} intensity={1.15} />
        )}

        {visual.kind === 'sun' && (
          <mesh raycast={() => undefined} scale={1.22}>
            <sphereGeometry args={[visual.radius, 32, 32]} />
            <meshBasicMaterial
              ref={glowMatRef}
              color="#ffb347"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        )}

        {visual.kind === 'sun' && (
          <mesh raycast={() => undefined} scale={1.55}>
            <sphereGeometry args={[visual.radius, 24, 24]} />
            <meshBasicMaterial
              ref={coronaMatRef}
              color="#ffc266"
              transparent
              opacity={0.32}
              side={THREE.BackSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        )}

        {visual.ring && (
          <mesh rotation={[Math.PI / 2.15, 0.12, 0.05]} raycast={() => undefined}>
            <ringGeometry args={[visual.radius * 1.35, visual.radius * 2.4, 96]} />
            <meshBasicMaterial
              ref={ringMatRef}
              map={textures.saturnRing}
              alphaMap={textures.saturnRingAlpha}
              transparent
              opacity={0.88}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

        {activeId === visual.id && (
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => undefined}>
            <ringGeometry args={[visual.radius * 1.25, visual.radius * 1.38, 64]} />
            <meshBasicMaterial
              color={visual.kind === 'earth' ? '#60a5fa' : '#ffffff'}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

        {activeId === visual.id && meta && meta.metrics.length > 0 && (
          <>
            <Line
              points={[
                new THREE.Vector3(0, visual.radius * 0.2, 0),
                new THREE.Vector3(visual.radius * 1.8, visual.radius * 1.6, 0),
              ]}
              color="#cbd5e1"
              lineWidth={1}
              transparent
              opacity={0.75}
            />
            <mesh position={[visual.radius * 0.15, visual.radius * 0.15, 0]} raycast={() => undefined}>
              <sphereGeometry args={[0.018, 12, 12]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            <Html
              distanceFactor={7.5}
              position={[visual.radius * 2.1, visual.radius * 1.85, 0]}
              style={{ pointerEvents: 'none' }}
              zIndexRange={[100, 0]}
            >
              <div className="min-w-[11rem] max-w-[15rem] w-max px-3 py-2.5 bg-black/85 text-white border border-white/70 backdrop-blur-[2px]">
                <div className="font-mono text-[11px] font-bold uppercase tracking-wide border-b border-white/25 pb-1.5 mb-1.5 flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.symbolColor }}
                    aria-hidden
                  />
                  <span
                    className="min-w-0 break-words leading-tight"
                    style={{ color: meta.id === 'moon' ? '#84cc16' : '#facc15' }}
                  >
                    {meta.label}
                  </span>
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

const OrbitPath: React.FC<{
  radius: number;
  active: boolean;
  reducedMotion: boolean;
  tilt?: number;
}> = ({ radius, active, reducedMotion, tilt = 0.22 }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <group rotation={[tilt, 0.05, tilt * 0.2]}>
      <Line
        points={points}
        color={active ? '#ffffff' : '#6b7280'}
        lineWidth={active ? 1.1 : 0.55}
        transparent
        opacity={active ? 0.9 : reducedMotion ? 0.25 : 0.4}
      />
    </group>
  );
};

const Stars: React.FC<{ count?: number; reducedMotion?: boolean }> = ({
  count = 220,
  reducedMotion = false,
}) => {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.45;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  const parallax = useRef<THREE.Points>(null);
  useFrame(({ camera }) => {
    if (!parallax.current || reducedMotion) return;
    parallax.current.position.x = camera.position.x * 0.02;
    parallax.current.position.y = camera.position.y * 0.02;
  });

  return (
    <points ref={parallax}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};

/** Gently ease OrbitControls target toward focused body without fighting drag. */
const SoftCameraFocus: React.FC<{
  focusPos: THREE.Vector3 | null;
  userDriving: React.MutableRefObject<boolean>;
}> = ({ focusPos, userDriving }) => {
  const { controls } = useThree();
  const smoothed = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const c = controls as OrbitControlsImpl | null;
    if (!c || !focusPos || userDriving.current) return;
    smoothed.current.lerp(focusPos, Math.min(1, delta * 1.1));
    c.target.lerp(smoothed.current, Math.min(1, delta * 0.9));
    c.update();
  });

  return null;
};

function formatLastPush(iso: string | null): string {
  if (!iso) return 'Unknown';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'Unknown';
  const hours = Math.max(0, Math.round((Date.now() - t) / (1000 * 60 * 60)));
  if (hours < 1) return 'Just now';
  if (hours < 48) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export interface SolarSystemSceneProps {
  bodies: CelestialBodyMeta[];
  activeId: SceneFocusId | null;
  reducedMotion: boolean;
  profileUrl: string;
  avatarUrl: string;
  lastPushAt: string | null;
  onSelect: (id: SceneFocusId) => void;
  onHover: (id: SceneFocusId | null) => void;
  onClear: () => void;
  userDriving: React.MutableRefObject<boolean>;
}

const SolarSystemScene: React.FC<SolarSystemSceneProps> = ({
  bodies,
  activeId,
  reducedMotion,
  profileUrl,
  avatarUrl,
  lastPushAt,
  onSelect,
  onHover,
  onClear,
  userDriving,
}) => {
  const textures = usePlanetTextures();
  const visuals = useMemo(() => buildVisuals(bodies), [bodies]);
  const metaById = useMemo(() => new Map(bodies.map((b) => [b.id, b])), [bodies]);
  const earth = visuals.find((v) => v.kind === 'earth');
  const sun = visuals.find((v) => v.kind === 'sun');

  const orbits = useMemo(() => {
    const set = new Set<number>();
    for (const v of visuals) {
      if (v.orbitRadius && v.kind !== 'asteroid') set.add(Number(v.orbitRadius.toFixed(2)));
    }
    if (visuals.some((v) => v.kind === 'asteroid')) set.add(4.35);
    return [...set];
  }, [visuals]);

  const focusPos = useMemo(() => {
    if (!activeId || activeId === 'astronaut') {
      if (activeId === 'astronaut' && earth) {
        return new THREE.Vector3(...earth.position);
      }
      return null;
    }
    const v = visuals.find((x) => x.id === activeId);
    return v ? new THREE.Vector3(...v.position) : null;
  }, [activeId, visuals, earth]);

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((tex) => {
        if (tex instanceof THREE.Texture) tex.dispose();
      });
    };
  }, [textures]);

  return (
    <group onPointerMissed={() => onClear()}>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#e8f0ff', '#2a1810', 0.55]} />
      <pointLight position={[0, 0, 0]} intensity={7.5} distance={48} decay={1.6} color="#ffe0a8" />
      <directionalLight position={[5, 7, 3]} intensity={0.85} color="#fff8f0" />
      <directionalLight position={[-6, 2, -4]} intensity={0.35} color="#a8c4ff" />

      <Stars count={reducedMotion ? 100 : 240} reducedMotion={reducedMotion} />
      <SoftCameraFocus focusPos={focusPos} userDriving={userDriving} />

      {orbits.map((r, i) => {
        const activeOrbit = visuals.some(
          (v) =>
            v.orbitRadius &&
            Math.abs(v.orbitRadius - r) < 0.2 &&
            (v.id === activeId || (activeId === 'astronaut' && v.kind === 'earth'))
        );
        return (
          <OrbitPath
            key={r}
            radius={r}
            active={activeOrbit}
            reducedMotion={reducedMotion}
            tilt={0.2 + (i % 4) * 0.015}
          />
        );
      })}

      {sun && (
        <PlasmaSun
          radius={sun.radius}
          meta={metaById.get('sun')}
          activeId={activeId}
          reducedMotion={reducedMotion}
          onSelect={onSelect}
          onHover={onHover}
        />
      )}

      {visuals
        .filter((v) => v.kind !== 'sun')
        .map((visual) => (
          <PlanetMesh
            key={visual.id}
            visual={visual}
            meta={metaById.get(visual.id)}
            activeId={activeId}
            reducedMotion={reducedMotion}
            textures={textures}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}

      {earth && (
        <SpaceAstronaut
          earthPosition={earth.position}
          earthRadius={earth.radius}
          reducedMotion={reducedMotion}
          paused={activeId === 'astronaut'}
          active={activeId === 'astronaut'}
          profileUrl={profileUrl}
          avatarUrl={avatarUrl}
          lastPushLabel={formatLastPush(lastPushAt)}
          onHover={(on) => onHover(on ? 'astronaut' : null)}
          onSelect={() => onSelect('astronaut')}
        />
      )}
    </group>
  );
};

export default SolarSystemScene;
