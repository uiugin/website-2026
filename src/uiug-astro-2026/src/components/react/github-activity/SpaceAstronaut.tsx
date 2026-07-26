import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export interface SpaceAstronautProps {
  earthPosition: [number, number, number];
  earthRadius: number;
  reducedMotion: boolean;
  paused: boolean;
  active: boolean;
  profileUrl: string;
  avatarUrl: string;
  lastPushLabel: string;
  onHover: (active: boolean) => void;
  onSelect: () => void;
}

/**
 * Developer presence as an orbiting GitHub avatar billboard.
 * On select: avatar shown first in the card, then label / last-push text.
 */
const SpaceAstronaut: React.FC<SpaceAstronautProps> = ({
  earthPosition,
  earthRadius,
  reducedMotion,
  paused,
  active,
  profileUrl,
  avatarUrl,
  lastPushLabel,
  onHover,
  onSelect,
}) => {
  const pivotRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0.4);
  const orbitR = earthRadius * 2.15;
  const size = earthRadius * 0.22;

  const avatar = useTexture(avatarUrl);
  useEffect(() => {
    avatar.colorSpace = THREE.SRGBColorSpace;
    avatar.anisotropy = 4;
    avatar.needsUpdate = true;
  }, [avatar]);

  const tetherPts = useMemo(
    () => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(orbitR * 0.92, 0.02, 0)],
    [orbitR]
  );

  useFrame(({ clock }, delta) => {
    const pivot = pivotRef.current;
    const body = bodyRef.current;
    if (!pivot || !body) return;

    if (!paused && !reducedMotion) {
      angleRef.current += delta * 0.18;
    }

    const t = clock.getElapsedTime();
    const bob = reducedMotion ? 0 : Math.sin(t * 1.2) * 0.014;

    pivot.position.set(earthPosition[0], earthPosition[1], earthPosition[2]);
    pivot.rotation.y = angleRef.current;
    body.position.set(orbitR, bob, 0);
  });

  return (
    <group ref={pivotRef}>
      <Line points={tetherPts} color="#94a3b8" lineWidth={1} transparent opacity={0.35} />

      <group
        ref={bodyRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          onHover(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          onHover(false);
        }}
      >
        <Billboard follow>
          <mesh scale={active ? 1.35 : 1}>
            <circleGeometry args={[size, 48]} />
            <meshStandardMaterial map={avatar} roughness={0.65} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0, -0.002]} scale={active ? 1.35 : 1}>
            <ringGeometry args={[size * 0.98, size * 1.08, 48]} />
            <meshBasicMaterial
              color={active ? '#ffffff' : '#64748b'}
              transparent
              opacity={active ? 0.95 : 0.5}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped
            />
          </mesh>
        </Billboard>

        {active && (
          <Html
            distanceFactor={7}
            position={[0, size * 1.55 + 0.28, 0]}
            style={{ pointerEvents: 'auto' }}
            zIndexRange={[100, 0]}
          >
            <div className="min-w-[10rem] max-w-[14rem] w-max p-2.5 bg-black/90 text-white border border-white/80 flex flex-col items-center gap-2">
              {/* Avatar first, then developer text */}
              <img
                src={avatarUrl}
                alt="GitHub avatar"
                width={56}
                height={56}
                className="w-14 h-14 rounded-full border-2 border-white object-cover"
                loading="lazy"
              />
              <div className="w-full text-center border-t border-white/30 pt-1.5">
                <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-accent-yellow">
                  Developer
                </div>
                <p className="font-mono text-[10px] font-bold uppercase text-white/80 leading-snug break-words mt-1">
                  Last push: {lastPushLabel}
                </p>
              </div>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] font-bold uppercase px-2 py-1 border border-white hover:bg-primary hover:text-black hover:border-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View on GitHub
              </a>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export default SpaceAstronaut;
