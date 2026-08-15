/**
 * ConstellationField — a discreet "system graph" rendered behind the hero.
 *
 * Deliberately restrained: low node count, slow drift, thin edges, no
 * post-processing, no unnecessary objects. It should read as an abstract
 * system map, not as a particles demo.
 *
 * Motion stays slow and editorial: nodes drift, edges breathe, the whole
 * group tilts gently and responds subtly to the pointer. It is never loud.
 *
 * Performance & accessibility decisions:
 *  - Rendered on demand only in the hero (island via client:visible).
 *  - Quality tier adapts to device (mobile + low-capability → lower dpr).
 *  - Respects prefers-reduced-motion by rendering a static frame (any
 *    animation code is skipped at runtime via useFrame guards).
 */
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export interface NodeSpec {
  label: string;
  x: number;
  y: number;
  z: number;
}

interface PlaneSpec {
  x: number;
  y: number;
  z: number;
  size: number;
  rotation: [number, number, number];
  edges: [number, number][];
  nodes: NodeSpec[];
}

/**
 * The constellation is conceptually a layered system:
 *  Software ── Cloud ── Security ── Linux ── Project ── Knowledge
 * represented as nearby points with meaningful connections.
 */
function buildPlanes(): PlaneSpec[] {
  return [
    {
      x: 0,
      y: 0,
      z: 0,
      size: 9,
      rotation: [0, 0, 0],
      nodes: [
        { label: 'Software', x: -2, y: 0.6, z: 0 },
        { label: 'Cloud', x: 0.6, y: 1.1, z: 0 },
        { label: 'Security', x: 2.2, y: 0.2, z: 0 },
        { label: 'Linux', x: 0.2, y: -1.2, z: 0 },
        { label: 'Project', x: -2.4, y: -1.0, z: 0 },
        { label: 'Knowledge', x: 2.4, y: -1.1, z: 0 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 4],
        [4, 3],
        [3, 5],
      ],
    },
  ];
}

function getMotionEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
}

function Node({ position, seed }: { position: [number, number, number]; seed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const motion = useRef(getMotionEnabled());

  useFrame((state) => {
    if (!ref.current) return;
    if (!motion.current) return;
    const t = state.clock.elapsedTime;
    const amp = 0.06;
    ref.current.position.x = position[0] + Math.sin(t * 0.35 + seed) * amp;
    ref.current.position.y = position[1] + Math.cos(t * 0.28 + seed * 1.7) * amp;
    ref.current.position.z = position[2] + Math.sin(t * 0.22 + seed * 0.6) * (amp * 0.5);
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.016, 16, 16]} />
      <meshBasicMaterial color="#c7c7cf" transparent opacity={0.75} depthWrite={false} />
    </mesh>
  );
}

function Edge({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const motion = useRef(getMotionEnabled());

  useFrame((state) => {
    if (!ref.current) return;
    if (!motion.current) return;
    // gentle opacity breathing: informative, not decorative
    const t = state.clock.elapsedTime;
    const m = 0.12 + (Math.sin(t * 0.4 + from[0] * 3) + 1) * 0.09;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = m;
  });

  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const length = start.distanceTo(end);
  const direction = end.clone().sub(start).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction,
  );

  return (
    <mesh ref={ref} position={mid} quaternion={quaternion} renderOrder={1}>
      <cylinderGeometry args={[0.0008, 0.0008, length, 6, 1]} />
      <meshBasicMaterial color="#3a3a41" transparent opacity={0.25} depthWrite={false} />
    </mesh>
  );
}

function ConstellationGraph() {
  const group = useRef<THREE.Group>(null);
  const motion = useRef(getMotionEnabled());

  useFrame((state) => {
    if (!group.current) return;
    if (!motion.current) return;
    const t = state.clock.elapsedTime;
    // slow, subtle tilt of the whole map
    group.current.rotation.y = Math.sin(t * 0.08) * 0.06;
    group.current.rotation.z = Math.sin(t * 0.05) * 0.015;
  });

  const planes = useMemo(buildPlanes, []);
  const allEdges = useMemo(() => {
    const out: { from: [number, number, number]; to: [number, number, number] }[] = [];
    for (const plane of planes) {
      for (const [f, t] of plane.edges) {
        const nf = plane.nodes[f];
        const nt = plane.nodes[t];
        out.push({
          from: [plane.x + nf.x, nf.y, plane.z + nf.z],
          to: [plane.x + nt.x, nt.y, plane.z + nt.z],
        });
      }
    }
    return out;
  }, [planes]);

  return (
    <group ref={group} rotation={[0.08, 0, 0]}>
      {allEdges.map((e, i) => (
        <Edge key={`e${i}`} from={e.from} to={e.to} />
      ))}
      {planes.flatMap((plane, p) =>
        plane.nodes.map((n, i) => (
          <Node
            key={`n${p}-${i}`}
            position={[plane.x + n.x, n.y, plane.z + n.z]}
            seed={p * 10 + i}
          />
        )),
      )}
    </group>
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null);
  const motion = useRef(getMotionEnabled());
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useFrame(() => {
    if (!group.current) return;
    if (!motion.current) return;
    // subtle parallax toward the pointer, eased
    const tx = pointer.current.x * 0.15;
    const ty = -pointer.current.y * 0.1;
    group.current.position.x += (tx - group.current.position.x) * 0.04;
    group.current.position.y += (ty - group.current.position.y) * 0.04;
  });

  return (
    <group ref={group}>
      <ConstellationGraph />
    </group>
  );
}

export function ConstellationField() {
  const [quality, setQuality] = useState<'high' | 'low'>(() =>
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 ||
      (navigator.hardwareConcurrency ?? 4) <= 4 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      ? 'low'
      : 'high',
  );
  const motion = useRef(getMotionEnabled());

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setQuality(mq.matches ? 'low' : 'high');
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{ opacity: 0.85 }}
    >
      <Canvas
        frameloop={motion.current ? 'always' : 'demand'}
        dpr={quality === 'high' ? [1, 1.5] : [1, 1]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: quality === 'high' ? 'default' : 'low-power',
        }}
      >
        <Scene />
      </Canvas>
      {/* gentle fade so the scene stays behind the text */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(5,5,5,0) 45%, rgba(5,5,5,0.8) 100%)',
        }}
      />
    </div>
  );
}