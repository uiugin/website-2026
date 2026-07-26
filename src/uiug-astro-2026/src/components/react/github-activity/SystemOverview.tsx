import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { ZoomIn, ZoomOut } from 'lucide-react';
import type { GithubActivity } from '../../../lib/github-activity';
import { buildCelestialBodies, buildUniverseStatus } from './planetMetrics';
import SolarSystemScene from './SolarSystemScene';
import type { SceneFocusId } from './SolarSystemScene';
import UniverseStatusPanel from './UniverseStatusPanel';
import SceneEffects from './SceneEffects';

interface SystemOverviewProps {
  activity: GithubActivity;
  reducedMotion: boolean;
}

const ZOOM_STEP = 1.12;
const MIN_DISTANCE = 5;
const MAX_DISTANCE = 18;

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

const SystemOverview: React.FC<SystemOverviewProps> = ({ activity, reducedMotion }) => {
  const bodies = useMemo(() => buildCelestialBodies(activity), [activity]);
  const statusItems = useMemo(() => buildUniverseStatus(activity), [activity]);
  const [activeId, setActiveId] = useState<SceneFocusId | null>(null);
  const [hoverId, setHoverId] = useState<SceneFocusId | null>(null);
  const [supportsWebgl, setSupportsWebgl] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const userDriving = useRef(false);

  const effectiveId = activeId ?? hoverId;

  useEffect(() => {
    setSupportsWebgl(webglAvailable());
  }, []);

  const clear = useCallback(() => {
    setActiveId(null);
    setHoverId(null);
  }, []);

  const select = useCallback((id: SceneFocusId) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  const zoomBy = useCallback((direction: 'in' | 'out') => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (direction === 'in') controls.dollyIn(ZOOM_STEP);
    else controls.dollyOut(ZOOM_STEP);
    controls.update();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clear]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const blockPageScroll = (e: Event) => {
      e.preventDefault();
    };
    el.addEventListener('wheel', blockPageScroll, { passive: false });
    el.addEventListener('touchmove', blockPageScroll, { passive: false });
    return () => {
      el.removeEventListener('wheel', blockPageScroll);
      el.removeEventListener('touchmove', blockPageScroll);
    };
  }, []);

  if (!supportsWebgl) {
    return null;
  }

  const zoomBtnClass =
    'w-8 h-8 flex items-center justify-center bg-white text-black border-2 border-white hover:bg-primary hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <div className="relative">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <h4 className="font-mono text-xs font-bold text-gray-500 uppercase">// SYSTEM_OVERVIEW</h4>
        <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-[9px] font-bold text-gray-500 uppercase tracking-wide">
          <span>DRAG TO ROTATE</span>
          <span>SEARCH ICONS TO ZOOM</span>
          <span>CLICK PLANET TO EXPLORE</span>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative border-4 border-black dark:border-white bg-black overflow-hidden overscroll-none"
        style={{ height: 'min(56vh, 480px)', minHeight: 300, touchAction: 'none' }}
        role="application"
        aria-label="Interactive solar system representing GitHub activity"
      >
        <UniverseStatusPanel items={statusItems} />

        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <div className="flex items-center gap-1" role="group" aria-label="Zoom controls">
            <button
              type="button"
              className={zoomBtnClass}
              aria-label="Zoom in"
              onClick={() => zoomBy('in')}
            >
              <ZoomIn className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className={zoomBtnClass}
              aria-label="Zoom out"
              onClick={() => zoomBy('out')}
            >
              <ZoomOut className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
          <a
            href={activity.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 bg-white text-black border-2 border-white font-mono text-[10px] font-bold uppercase hover:bg-primary hover:border-primary transition-colors"
          >
            VIEW ON GITHUB
          </a>
        </div>

        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 5.8, 8.2], fov: 40, near: 0.1, far: 90 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          style={{ touchAction: 'none' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#050508');
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.2;
            gl.domElement.style.touchAction = 'none';
          }}
        >
          <Suspense fallback={null}>
            <SolarSystemScene
              bodies={bodies}
              activeId={effectiveId}
              reducedMotion={reducedMotion}
              profileUrl={activity.profileUrl}
              avatarUrl={activity.avatarUrl}
              lastPushAt={activity.lastPushAt}
              userDriving={userDriving}
              onSelect={select}
              onHover={(id) => {
                if (activeId == null) setHoverId(id);
              }}
              onClear={clear}
            />
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableZoom
              enableRotate
              enableDamping
              dampingFactor={0.08}
              zoomToCursor={false}
              minDistance={MIN_DISTANCE}
              maxDistance={MAX_DISTANCE}
              maxPolarAngle={Math.PI * 0.42}
              minPolarAngle={Math.PI * 0.12}
              autoRotate={!reducedMotion && activeId == null && hoverId == null}
              autoRotateSpeed={0.18}
              makeDefault
              onStart={() => {
                userDriving.current = true;
              }}
              onEnd={() => {
                userDriving.current = false;
              }}
            />
            <SceneEffects reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-3 right-3 z-20">
          <button
            type="button"
            onClick={() => {
              clear();
              controlsRef.current?.reset();
            }}
            className="px-3 py-1.5 border-2 border-white bg-black/80 text-white font-mono text-[10px] font-bold uppercase hover:bg-primary hover:text-black hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            RESET
          </button>
        </div>
      </div>

      {effectiveId && effectiveId !== 'astronaut' && (
        <div className="mt-3 sm:hidden border-2 border-black dark:border-white bg-white dark:bg-black p-3">
          {(() => {
            const meta = bodies.find((b) => b.id === effectiveId);
            if (!meta) return null;
            return (
              <>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h5 className="font-display text-base uppercase flex items-start gap-2 min-w-0">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: meta.symbolColor }}
                      aria-hidden
                    />
                    <span className="break-words leading-tight">{meta.label}</span>
                  </h5>
                  <button
                    type="button"
                    className="font-mono text-[10px] font-bold uppercase border border-black dark:border-white px-2 py-1 shrink-0"
                    onClick={clear}
                  >
                    CLOSE
                  </button>
                </div>
                <ul className="space-y-1">
                  {meta.metrics.map((m) => (
                    <li key={m.label} className="font-mono text-xs font-bold uppercase break-words">
                      <span className="text-gray-500">{m.label}: </span>
                      {m.value}
                    </li>
                  ))}
                </ul>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SystemOverview;
