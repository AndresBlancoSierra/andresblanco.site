/**
 * ConstellationField — a discreet "system graph" rendered as a fixed
 * full-page background behind the site.
 *
 * Deliberately restrained: low node count, slow drift, thin edges, no
 * post-processing, no unnecessary objects. It should read as an abstract
 * system map, not as a particles demo.
 *
 * Motion stays slow and editorial: nodes drift, edges breathe, the whole
 * group tilts gently, responds subtly to the pointer, and an occasional
 * meteor streaks through. It is never loud.
 *
 * Performance & accessibility decisions:
 *  - Rendered as a fixed island (client:visible) behind all content.
 *  - Quality tier adapts to device (mobile + low-capability → lower dpr).
 *  - Respects prefers-reduced-motion by rendering a static frame and
 *    skipping meteors (any animation code is guarded at runtime).
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
    const amp = 0.12;
    ref.current.position.x = position[0] + Math.sin(t * 0.45 + seed) * amp;
    ref.current.position.y = position[1] + Math.cos(t * 0.38 + seed * 1.7) * amp;
    ref.current.position.z = position[2] + Math.sin(t * 0.3 + seed * 0.6) * (amp * 0.5);
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.02, 16, 16]} />
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
    const m = 0.28 + (Math.sin(t * 0.4 + from[0] * 3) + 1) * 0.11;
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
      <cylinderGeometry args={[0.003, 0.003, length, 6, 1]} />
      <meshBasicMaterial color="#56565f" transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

interface MeteorState {
  active: boolean;
  spawnTimer: number;
  age: number;
  dur: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
}

function addMeteor(state: MeteorState, seed: number) {
  const dir = Math.random() < 0.5 ? -1 : 1;
  state.pos.set(
    dir * (2 + Math.random() * 1.8),
    1.7 + Math.random() * 0.8,
    0.6 + Math.random() * 1.2,
  );
  state.vel.set(
    dir * (4 + Math.random() * 3),
    -(1.6 + Math.random() * 1.4),
    -(0.4 + Math.random() * 0.5),
  );
  state.dur = 0.9 + Math.random() * 0.3;
  state.age = 0;
  state.active = true;
  void seed;
}

/**
 * A single short-lived shooting star: a bright head with a fading trail.
 * Idles until its spawn timer runs out, then streaks quickly across and
 * resets. Additive, so it reads as light passing in front of the map.
 */
function Meteor({ seed }: { seed: number }) {
  const group = useRef<THREE.Group>(null);
  const trailMat = useRef<THREE.MeshBasicMaterial>(null);
  const headMat = useRef<THREE.MeshBasicMaterial>(null);
  const motion = useRef(getMotionEnabled());
  const state = useRef<MeteorState>({
    active: false,
    spawnTimer: 1.5 + seed * 2.2,
    age: 0,
    dur: 1,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
  });

  useFrame((_, delta) => {
    const s = state.current;
    if (!group.current || !trailMat.current || !headMat.current) return;
    if (!motion.current) {
      group.current.visible = false;
      return;
    }

    const dt = Math.min(delta, 0.05);

    if (!s.active) {
      s.spawnTimer -= dt;
      if (s.spawnTimer > 0) {
        group.current.visible = false;
        return;
      }
      addMeteor(s, seed);
    }

    s.age += dt;
    const progress = s.age / s.dur;
    s.pos.addScaledVector(s.vel, dt);
    group.current.visible = true;

    // trail points backward along the velocity, head leads
    group.current.position.copy(s.pos);
    const tailDir = s.vel.clone().multiplyScalar(-1).normalize();
    group.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tailDir);

    // fade in over the first 15%, hold, fade out over the last 30%
    let alpha: number;
    if (progress <= 0.15) alpha = progress / 0.15;
    else if (progress <= 0.7) alpha = 1;
    else alpha = Math.max(0, 1 - (progress - 0.7) / 0.3);

    trailMat.current.opacity = alpha;
    headMat.current.opacity = alpha;

    if (s.age >= s.dur) {
      s.active = false;
      s.spawnTimer = 4 + Math.random() * 4;
      group.current.visible = false;
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.9, 6, 1]} />
        <meshBasicMaterial
          ref={trailMat}
          color="#d4d4d8"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshBasicMaterial
          ref={headMat}
          color="#e8e8ec"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
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
    group.current.rotation.y = Math.sin(t * 0.12) * 0.1;
    group.current.rotation.z = Math.sin(t * 0.08) * 0.03;
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
    const tx = pointer.current.x * 0.22;
    const ty = -pointer.current.y * 0.16;
    group.current.position.x += (tx - group.current.position.x) * 0.06;
    group.current.position.y += (ty - group.current.position.y) * 0.06;
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
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
      style={{ opacity: 0.6 }}
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
        <Meteor seed={0.4} />
        <Meteor seed={0.9} />
        <Meteor seed={2.6} />
      </Canvas>
      {/* gentle fade so the scene frames the centered content */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(5,5,5,0) 45%, rgba(5,5,5,0.7) 100%)',
        }}
      />
    </div>
  );
}