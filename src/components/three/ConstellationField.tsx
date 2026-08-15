/**
 * ConstellationField — the "system of systems" sky behind the site.
 *
 * A real star field: eight actual constellations (Hipparcos data, see
 * src/lib/constellations.ts) float as clusters around the page, tied together
 * by a faint web of links, over a twinkling field of distant background stars.
 *
 * The field has its own quiet life, with sparse, subtle events:
 *   - shooting stars (meteors)
 *   - supernovae: a real star flares and an expanding shockwave ring fades out
 *   - black holes: a dark core with a faint accretion disc that appears, sits,
 *     and dissolves
 *   - artificial satellites crossing in a straight line at constant speed
 *   - variable stars (Betelgeuse, Antares) pulsing like real Cepheids
 *   - star births: a proto-star dimly brightens and settles
 *
 * Deliberately restrained: monochrome, low opacity, no post-processing, few
 * objects. It is an abstract sky map, not a particles demo.
 *
 * Performance & accessibility decisions:
 *  - Fixed island behind all content (client:visible).
 *  - Instancing for stars and edges; a single shader for the background field.
 *  - Quality tier adapts to device (mobile + low-capability → fewer points).
 *  - prefers-reduced-motion: static frame, no twinkle, no events (all animated
 *    code is guarded at runtime).
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { buildScene, type ConstellationScene, type SceneStar } from '../../lib/constellations';

type Vec3 = [number, number, number];

function getMotionEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
}

/* ------------------------------------------------------------------ */
/* Background star field — distant twinkling points (single shader)    */
/* ------------------------------------------------------------------ */

const FIELD_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  varying float vTwinkle;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    float t = uTime * 1.6 + aPhase;
    vTwinkle = 0.6 + 0.4 * sin(t);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / max(-mv.z, 0.1);
    gl_Position = projectionMatrix * mv;
  }
`;

const FIELD_FRAG = /* glsl */ `
  varying float vTwinkle;
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    float alpha = smoothstep(0.5, 0.12, d);
    gl_FragColor = vec4(vColor, alpha * vTwinkle * 0.5);
  }
`;

function StarField({ quality }: { quality: 'high' | 'low' }) {
  const { geometry, material } = useMemo(() => {
    const count = quality === 'high' ? 650 : 320;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * 9;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 5;
      positions[i * 3 + 2] = -1 - Math.random() * 2;
      sizes[i] = 0.008 + Math.random() * 0.028;
      phases[i] = Math.random() * Math.PI * 2;

      let v = 0.42 + 0.58 * Math.pow(Math.random(), 1.7);
      // keep the area behind the centered content quieter for readability
      const cx = positions[i * 3];
      const cy = positions[i * 3 + 1];
      if (Math.abs(cx) < 1.8 && Math.abs(cy) < 2.0) v *= 0.35;
      colors[i * 3] = v;
      colors[i * 3 + 1] = v;
      colors[i * 3 + 2] = v;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: 900 } },
      vertexShader: FIELD_VERT,
      fragmentShader: FIELD_FRAG,
      transparent: true,
      depthWrite: false,
    });

    return { geometry, material };
  }, [quality]);

  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);

  useLayoutEffect(() => {
    const dpr = gl.getPixelRatio();
    const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;
    const half = Math.tan(((fov / 2) * Math.PI) / 180);
    material.uniforms.uScale.value = (dpr * gl.domElement.clientHeight) / half;
  }, [gl, camera, material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Constellation clusters — instanced stars and asterism edges         */
/* ------------------------------------------------------------------ */

function ConstellationStars({ stars }: { stars: SceneStar[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(0.5, 12, 12), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    stars.forEach((s, i) => {
      dummy.position.set(s.position[0], s.position[1], s.position[2]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(s.radius * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const v = s.brightness;
      color.setRGB(v, v, v);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [stars]);

  return <instancedMesh ref={meshRef} args={[geo, mat, stars.length]} frustumCulled={false} />;
}

function ConstellationEdges({ scene }: { scene: ConstellationScene }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 4, 1), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#5a5a66',
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
      }),
    [],
  );

  const edges = scene.edges;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    edges.forEach((e, i) => {
      const start = new THREE.Vector3(e.from[0], e.from[1], e.from[2]);
      const end = new THREE.Vector3(e.to[0], e.to[1], e.to[2]);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const length = start.distanceTo(end);
      const dir = end.clone().sub(start).normalize();
      dummy.position.copy(mid);
      dummy.quaternion.setFromUnitVectors(up, dir);
      dummy.scale.set(0.008, length, 0.008);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [edges]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mat.opacity = 0.2 + 0.08 * Math.sin(t * 0.45);
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, edges.length]} frustumCulled={false} />;
}

function SkyLinks({ links }: { links: ConstellationScene['links'] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 3, 1), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#4a4a55',
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
      }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    links.forEach((l, i) => {
      const start = new THREE.Vector3(l.from[0], l.from[1], l.from[2]);
      const end = new THREE.Vector3(l.to[0], l.to[1], l.to[2]);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const length = start.distanceTo(end);
      const dir = end.clone().sub(start).normalize();
      dummy.position.copy(mid);
      dummy.quaternion.setFromUnitVectors(up, dir);
      dummy.scale.set(0.0035, length, 0.0035);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [links]);

  return <instancedMesh ref={meshRef} args={[geo, mat, links.length]} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

function VariableStar({
  position,
  period,
  phase,
  baseOpacity,
}: {
  position: Vec3;
  period: number;
  phase: number;
  baseOpacity: number;
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const motion = useRef(getMotionEnabled());

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    if (!motion.current) return;
    const t = clock.elapsedTime;
    const pulse = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / period + phase);
    matRef.current.opacity = baseOpacity * (0.5 + 0.5 * pulse);
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.014, 8, 8]} />
      <meshBasicMaterial
        ref={matRef}
        color="#ececf2"
        transparent
        opacity={baseOpacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Supernova({ stars }: { stars: SceneStar[] }) {
  const flareRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const flareMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const motion = useRef(getMotionEnabled());
  const camera = useThree((s) => s.camera);

  const state = useRef({
    active: false,
    timer: 6 + Math.random() * 7,
    age: 0,
    dur: 2.6,
    target: null as SceneStar | null,
  });

  useFrame((_, delta) => {
    const flare = flareRef.current;
    const ring = ringRef.current;
    const fMat = flareMatRef.current;
    const rMat = ringMatRef.current;
    if (!flare || !ring || !fMat || !rMat) return;
    if (!motion.current) {
      flare.visible = false;
      ring.visible = false;
      return;
    }

    const s = state.current;
    const dt = Math.min(delta, 0.05);

    if (!s.active) {
      s.timer -= dt;
      flare.visible = false;
      ring.visible = false;
      if (s.timer > 0) return;
      s.active = true;
      s.age = 0;
      s.target = stars[Math.floor(Math.random() * stars.length)];
    }

    s.age += dt;
    const p = s.age / s.dur;
    if (!s.target) {
      s.active = false;
      s.timer = 8 + Math.random() * 10;
      return;
    }

    const pos = new THREE.Vector3(s.target.position[0], s.target.position[1], s.target.position[2]);
    flare.position.copy(pos);
    ring.position.copy(pos);

    // flare: quick bloom, then a long fade back to the normal star
    let opacity: number;
    let scale: number;
    if (p < 0.12) {
      opacity = p / 0.12;
      scale = 0.5 + p * 40;
    } else if (p < 0.2) {
      opacity = 1;
      scale = 5.2;
    } else {
      const q = (p - 0.2) / 0.8;
      opacity = Math.max(0, 1 - q * q);
      scale = Math.max(0.4, 5.2 - 4.8 * q);
    }
    fMat.opacity = opacity;
    flare.visible = opacity > 0.01;
    flare.scale.setScalar(scale * 0.05);

    // expanding shockwave ring
    if (p > 0.1) {
      const q = Math.min((p - 0.1) / 0.9, 1);
      ring.visible = true;
      ring.lookAt(camera.position);
      const grow = 0.5 + q * 5.5;
      ring.scale.set(grow, grow, grow);
      rMat.opacity = 0.35 * (1 - q) * Math.min(1, (p - 0.1) / 0.08);
    } else {
      ring.visible = false;
    }

    if (p >= 1) {
      s.active = false;
      s.timer = 9 + Math.random() * 13;
      flare.visible = false;
      ring.visible = false;
    }
  });

  const ringGeo = useMemo(() => new THREE.RingGeometry(0.55, 0.7, 40), []);

  return (
    <group>
      <mesh ref={flareRef} visible={false}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial
          ref={flareMatRef}
          color="#f0f0f6"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ringRef} geometry={ringGeo} visible={false}>
        <meshBasicMaterial
          ref={ringMatRef}
          color="#e4e4ea"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function BlackHole() {
  const groupRef = useRef<THREE.Group>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const discRef = useRef<THREE.Mesh>(null);
  const discMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const motion = useRef(getMotionEnabled());
  const camera = useThree((s) => s.camera);

  const state = useRef({
    active: false,
    timer: 16 + Math.random() * 12,
    age: 0,
    dur: 4.2,
    position: [0, 0, 0] as Vec3,
  });

  function spawn() {
    const s = state.current;
    s.position = [
      (Math.random() * 2 - 1) * 4.6,
      (Math.random() * 2 - 1) * 2.6,
      -1.2 + Math.random() * 1.4,
    ];
    s.active = true;
    s.age = 0;
  }

  useFrame((_, delta) => {
    const group = groupRef.current;
    const coreMat = coreMatRef.current;
    const disc = discRef.current;
    const discMat = discMatRef.current;
    if (!group || !coreMat || !disc || !discMat) return;
    if (!motion.current) {
      group.visible = false;
      return;
    }

    const s = state.current;
    const dt = Math.min(delta, 0.05);

    if (!s.active) {
      s.timer -= dt;
      group.visible = false;
      if (s.timer > 0) return;
      spawn();
    }

    s.age += dt;
    const p = s.age / s.dur;

    const fadeIn = Math.min(p / 0.18, 1);
    const fadeOut = Math.min(Math.max((1 - p) / 0.22, 0), 1);
    const envelope = Math.min(fadeIn, fadeOut);

    group.visible = true;
    group.position.set(s.position[0], s.position[1], s.position[2]);
    coreMat.opacity = envelope;
    disc.lookAt(camera.position);
    disc.rotation.z += dt * 0.6;
    discMat.opacity = envelope * 0.35;
    disc.scale.setScalar(1 + p * 0.15);

    if (p >= 1) {
      s.active = false;
      s.timer = 18 + Math.random() * 12;
      group.visible = false;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial ref={coreMatRef} color="#000000" transparent opacity={0} depthWrite />
      </mesh>
      <mesh ref={discRef}>
        <torusGeometry args={[0.16, 0.014, 8, 32]} />
        <meshBasicMaterial
          ref={discMatRef}
          color="#9db3cc"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Satellite() {
  const trailRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const trailMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const headMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const motion = useRef(getMotionEnabled());

  const state = useRef({
    active: false,
    timer: 12 + Math.random() * 8,
    age: 0,
    dur: 4.5,
    p0: [0, 0, 0] as Vec3,
    dir: [1, 0, 0] as Vec3,
    speed: 2.2,
  });

  function spawn() {
    const s = state.current;
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? -5.5 - Math.random() * 1.5 : 5.5 + Math.random() * 1.5;
    const y = (Math.random() * 2 - 1) * 2.8;
    const z = -1.4 + Math.random() * 1.2;
    const angle = Math.random() * 0.9 - 0.45;
    const dirX = fromLeft ? Math.cos(angle) : -Math.cos(angle);
    const dirY = Math.sin(angle);
    s.p0 = [x, y, z];
    s.dir = [dirX, dirY, 0];
    s.speed = 2.0 + Math.random() * 0.7;
    s.active = true;
    s.age = 0;
  }

  useFrame((_, delta) => {
    const trail = trailRef.current;
    const head = headRef.current;
    const trailMat = trailMatRef.current;
    const headMat = headMatRef.current;
    if (!trail || !head || !trailMat || !headMat) return;
    if (!motion.current) {
      trail.visible = false;
      head.visible = false;
      return;
    }

    const s = state.current;
    const dt = Math.min(delta, 0.05);

    if (!s.active) {
      s.timer -= dt;
      trail.visible = false;
      head.visible = false;
      if (s.timer > 0) return;
      spawn();
    }

    s.age += dt;
    const travelled = s.age * s.speed;
    const px = s.p0[0] + s.dir[0] * travelled;
    const py = s.p0[1] + s.dir[1] * travelled;
    const pz = s.p0[2];

    const edge = Math.min(Math.min(Math.abs(px), Math.abs(py)) / 1.2, 1);
    const alpha = 0.35 * Math.max(0.05, edge);

    trail.visible = true;
    head.visible = true;
    head.position.set(px, py, pz);

    // short trail extending backward along the direction of travel
    const TRAIL = 0.55;
    const dir = new THREE.Vector3(s.dir[0], s.dir[1], s.dir[2]);
    const tail = new THREE.Vector3(px, py, pz).addScaledVector(dir, -TRAIL);
    const mid = new THREE.Vector3(px, py, pz).add(tail).multiplyScalar(0.5);
    trail.position.copy(mid);
    trail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    trail.scale.set(1, TRAIL, 1);

    trailMat.opacity = alpha;
    headMat.opacity = alpha * 1.6;

    if (s.age >= s.dur) {
      s.active = false;
      s.timer = 14 + Math.random() * 10;
      trail.visible = false;
      head.visible = false;
    }
  });

  return (
    <group>
      <mesh ref={trailRef} visible={false}>
        <cylinderGeometry args={[0.008, 0.008, 1, 6, 1]} />
        <meshBasicMaterial
          ref={trailMatRef}
          color="#dfe3ea"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={headRef} visible={false}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial
          ref={headMatRef}
          color="#f4f4f7"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function StarBirth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const motion = useRef(getMotionEnabled());

  const state = useRef({
    active: false,
    timer: 12 + Math.random() * 8,
    age: 0,
    dur: 3.2,
    position: [0, 0, 0] as Vec3,
    finalOpacity: 0.5,
  });

  function spawn() {
    const s = state.current;
    s.position = [
      (Math.random() * 2 - 1) * 5.2,
      (Math.random() * 2 - 1) * 2.8,
      -1.6 + Math.random() * 1.2,
    ];
    s.finalOpacity = 0.25 + Math.random() * 0.3;
    s.active = true;
    s.age = 0;
  }

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    if (!motion.current) {
      mesh.visible = false;
      return;
    }

    const s = state.current;
    const dt = Math.min(delta, 0.05);

    if (!s.active) {
      s.timer -= dt;
      mesh.visible = false;
      if (s.timer > 0) return;
      spawn();
    }

    s.age += dt;
    const p = s.age / s.dur;

    mesh.visible = true;
    mesh.position.set(s.position[0], s.position[1], s.position[2]);
    // brighten in over the first half, then settle
    let opacity: number;
    let scale: number;
    if (p < 0.5) {
      const q = p / 0.5;
      opacity = s.finalOpacity * q * q;
      scale = 0.3 + 0.7 * q;
    } else {
      const q = (p - 0.5) / 0.5;
      opacity = s.finalOpacity * (1 - 0.35 * q);
      scale = 1 - 0.15 * q;
    }
    mat.opacity = opacity;
    mesh.scale.setScalar(Math.max(0.05, scale));

    if (p >= 1) {
      s.active = false;
      s.timer = 13 + Math.random() * 10;
      mesh.visible = false;
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.011, 8, 8]} />
      <meshBasicMaterial
        ref={matRef}
        color="#ececf2"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Meteor({ seed }: { seed: number }) {
  const group = useRef<THREE.Group>(null);
  const trailMat = useRef<THREE.MeshBasicMaterial>(null);
  const headMat = useRef<THREE.MeshBasicMaterial>(null);
  const motion = useRef(getMotionEnabled());
  const state = useRef({
    active: false,
    spawnTimer: 1.5 + seed * 2.2,
    age: 0,
    dur: 1,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
  });

  function addMeteor(seed: number) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    state.current.pos.set(
      dir * (2 + Math.random() * 1.8),
      1.7 + Math.random() * 0.8,
      0.6 + Math.random() * 1.2,
    );
    state.current.vel.set(
      dir * (4 + Math.random() * 3),
      -(1.6 + Math.random() * 1.4),
      -(0.4 + Math.random() * 0.5),
    );
    state.current.dur = 0.9 + Math.random() * 0.3;
    state.current.age = 0;
    state.current.active = true;
    void seed;
  }

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
      addMeteor(seed);
    }

    s.age += dt;
    const progress = s.age / s.dur;
    s.pos.addScaledVector(s.vel, dt);
    group.current.visible = true;

    group.current.position.copy(s.pos);
    const tailDir = s.vel.clone().multiplyScalar(-1).normalize();
    group.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tailDir);

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

/* ------------------------------------------------------------------ */
/* Scene composition                                                   */
/* ------------------------------------------------------------------ */

function SkyScene({ quality }: { quality: 'high' | 'low' }) {
  const scene = useMemo(buildScene, []);
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

  useFrame((state) => {
    if (!group.current) return;
    if (!motion.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.12) * 0.1;
    group.current.rotation.z = Math.sin(t * 0.08) * 0.03;
    const tx = pointer.current.x * 0.22;
    const ty = -pointer.current.y * 0.16;
    group.current.position.x += (tx - group.current.position.x) * 0.06;
    group.current.position.y += (ty - group.current.position.y) * 0.06;
  });

  const variableStars = useMemo(() => {
    const byName = (name: string) => scene.stars.find((s) => s.name === name)?.position;
    const betelgeuse = byName('Betelgeuse');
    const antares = byName('Antares');
    return {
      betelgeuse: betelgeuse ?? ([0, 0, 0] as Vec3),
      antares: antares ?? ([0, 0, 0] as Vec3),
    };
  }, [scene]);

  return (
    <group ref={group} rotation={[0.08, 0, 0]}>
      <StarField quality={quality} />
      <SkyLinks links={scene.links} />
      <ConstellationStars stars={scene.stars} />
      <ConstellationEdges scene={scene} />
      <VariableStar
        position={variableStars.betelgeuse}
        period={12}
        phase={0.5}
        baseOpacity={0.55}
      />
      <VariableStar position={variableStars.antares} period={17} phase={2.4} baseOpacity={0.45} />
      <Supernova stars={scene.stars} />
      <BlackHole />
      <Satellite />
      <StarBirth />
      <Meteor seed={0.4} />
      <Meteor seed={0.9} />
      <Meteor seed={2.6} />
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
        <SkyScene quality={quality} />
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
