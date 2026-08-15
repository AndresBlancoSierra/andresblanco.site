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
 *   - black holes: a dark void whose gravity lenses the surrounding stars
 *     into an Einstein ring (no emitted light — only the deformation)
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
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { buildScene, type ConstellationScene, type SceneStar } from '../../lib/constellations';
import { EINSTEIN_R, lensPoint, LENSING_GLSL } from '../../lib/lensing';

type Vec3 = [number, number, number];

interface HoleState {
  position: THREE.Vector3;
  strength: number;
}

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
  uniform vec3 uHole;
  uniform float uEinstein;
  uniform float uHoleStrength;
  varying float vTwinkle;
  varying vec3 vColor;
  ${LENSING_GLSL}
  void main() {
    vColor = aColor;
    float t = uTime * 1.6 + aPhase;
    vTwinkle = 0.6 + 0.4 * sin(t);

    vec3 p = position;
    if (uHoleStrength > 0.0) {
      p = lensed(p);
      float r = length(p.xy - uHole.xy);
      float ring = abs(r - uEinstein);
      float boost = exp(-ring * ring * 12.0);
      vTwinkle += boost * 1.6 * uHoleStrength;
      vColor += vec3(boost * 0.4 * uHoleStrength);
    }

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
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

function StarField({
  quality,
  hole,
}: {
  quality: 'high' | 'low';
  hole: RefObject<HoleState | null>;
}) {
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
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 900 },
        uHole: { value: new THREE.Vector3() },
        uEinstein: { value: EINSTEIN_R },
        uHoleStrength: { value: 0 },
      },
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
    const h = hole.current;
    if (h) {
      material.uniforms.uHole.value.copy(h.position);
      material.uniforms.uHoleStrength.value = h.strength;
    }
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Constellation clusters — instanced stars and asterism edges         */
/* ------------------------------------------------------------------ */

function ConstellationStars({
  stars,
  hole,
}: {
  stars: SceneStar[];
  hole: RefObject<HoleState | null>;
}) {
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

  const base = useMemo(
    () => stars.map((s) => new THREE.Vector3(s.position[0], s.position[1], s.position[2])),
    [stars],
  );
  const radii = useMemo(() => stars.map((s) => s.radius), [stars]);
  const lensedRef = useRef(false);

  function write(strength: number) {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    base.forEach((p, i) => {
      dummy.position.copy(p);
      if (strength > 0) lensPoint(dummy.position, p, hole.current!.position, EINSTEIN_R, strength);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(radii[i] * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const color = new THREE.Color();
    stars.forEach((s, i) => {
      const v = s.brightness;
      color.setRGB(v, v, v);
      mesh.setColorAt(i, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    write(0);
  }, [stars]);

  useFrame(() => {
    const h = hole.current;
    const strength = h && h.strength > 0 ? h.strength : 0;
    if (strength > 0) {
      if (!lensedRef.current) {
        write(strength);
        lensedRef.current = true;
      }
    } else if (lensedRef.current) {
      write(0);
      lensedRef.current = false;
    }
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, stars.length]} frustumCulled={false} />;
}

function ConstellationEdges({
  scene,
  hole,
}: {
  scene: ConstellationScene;
  hole: RefObject<HoleState | null>;
}) {
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
  const base = useMemo(
    () =>
      edges.map((e) => ({
        from: new THREE.Vector3(e.from[0], e.from[1], e.from[2]),
        to: new THREE.Vector3(e.to[0], e.to[1], e.to[2]),
      })),
    [edges],
  );
  const lensedRef = useRef(false);

  function write(strength: number) {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    base.forEach((edge, i) => {
      a.copy(edge.from);
      b.copy(edge.to);
      if (strength > 0) {
        lensPoint(a, edge.from, hole.current!.position, EINSTEIN_R, strength);
        lensPoint(b, edge.to, hole.current!.position, EINSTEIN_R, strength);
      }
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const length = a.distanceTo(b);
      const dir = b.clone().sub(a).normalize();
      dummy.position.copy(mid);
      dummy.quaternion.setFromUnitVectors(up, dir);
      dummy.scale.set(0.008, length, 0.008);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  useLayoutEffect(() => {
    write(0);
  }, [base]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mat.opacity = 0.2 + 0.08 * Math.sin(t * 0.45);
    const h = hole.current;
    const strength = h && h.strength > 0 ? h.strength : 0;
    if (strength > 0) {
      if (!lensedRef.current) {
        write(strength);
        lensedRef.current = true;
      }
    } else if (lensedRef.current) {
      write(0);
      lensedRef.current = false;
    }
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, edges.length]} frustumCulled={false} />;
}

function SkyLinks({
  links,
  hole,
}: {
  links: ConstellationScene['links'];
  hole: RefObject<HoleState | null>;
}) {
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

  const base = useMemo(
    () =>
      links.map((l) => ({
        from: new THREE.Vector3(l.from[0], l.from[1], l.from[2]),
        to: new THREE.Vector3(l.to[0], l.to[1], l.to[2]),
      })),
    [links],
  );
  const lensedRef = useRef(false);

  function write(strength: number) {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    base.forEach((link, i) => {
      a.copy(link.from);
      b.copy(link.to);
      if (strength > 0) {
        lensPoint(a, link.from, hole.current!.position, EINSTEIN_R, strength);
        lensPoint(b, link.to, hole.current!.position, EINSTEIN_R, strength);
      }
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const length = a.distanceTo(b);
      const dir = b.clone().sub(a).normalize();
      dummy.position.copy(mid);
      dummy.quaternion.setFromUnitVectors(up, dir);
      dummy.scale.set(0.0035, length, 0.0035);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  useLayoutEffect(() => {
    write(0);
  }, [base]);

  useFrame(() => {
    const h = hole.current;
    const strength = h && h.strength > 0 ? h.strength : 0;
    if (strength > 0) {
      if (!lensedRef.current) {
        write(strength);
        lensedRef.current = true;
      }
    } else if (lensedRef.current) {
      write(0);
      lensedRef.current = false;
    }
  });

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
    timer: 8 + Math.random() * 8,
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
      s.timer = 8 + Math.random() * 8;
      return;
    }

    const pos = new THREE.Vector3(s.target.position[0], s.target.position[1], s.target.position[2]);
    flare.position.copy(pos);
    ring.position.copy(pos);

    // flare: quick, small bloom — a crisp point, then a long fade back
    let opacity: number;
    let scale: number;
    if (p < 0.12) {
      opacity = p / 0.12;
      scale = 0.5 + p * 10;
    } else if (p < 0.2) {
      opacity = 1;
      scale = 1.7;
    } else {
      const q = (p - 0.2) / 0.8;
      opacity = Math.max(0, 1 - q * q);
      scale = Math.max(0.35, 1.7 - 1.35 * q);
    }
    fMat.opacity = opacity;
    flare.visible = opacity > 0.01;
    flare.scale.setScalar(scale * 0.04);

    // expanding shockwave ring — ultra thin
    if (p > 0.1) {
      const q = Math.min((p - 0.1) / 0.9, 1);
      ring.visible = true;
      ring.lookAt(camera.position);
      const grow = 0.5 + q * 1.7;
      ring.scale.set(grow, grow, grow);
      rMat.opacity = 0.3 * (1 - q) * Math.min(1, (p - 0.1) / 0.08);
    } else {
      ring.visible = false;
    }

    if (p >= 1) {
      s.active = false;
      s.timer = 8 + Math.random() * 8;
      flare.visible = false;
      ring.visible = false;
    }
  });

  const ringGeo = useMemo(() => new THREE.RingGeometry(0.585, 0.6, 48), []);

  return (
    <group>
      <mesh ref={flareRef} visible={false}>
        <sphereGeometry args={[0.5, 24, 24]} />
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

function BlackHole({ hole }: { hole: RefObject<HoleState | null> }) {
  const groupRef = useRef<THREE.Group>(null);
  const motion = useRef(getMotionEnabled());

  const state = useRef({
    active: false,
    timer: 14 + Math.random() * 8,
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
    if (!group) return;
    if (!motion.current) {
      group.visible = false;
      if (hole.current) hole.current.strength = 0;
      return;
    }

    const s = state.current;
    const dt = Math.min(delta, 0.05);

    if (!s.active) {
      s.timer -= dt;
      group.visible = false;
      if (hole.current) hole.current.strength = 0;
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
    // grow the dark void as the hole strengthens; no emitted light
    group.scale.setScalar(0.2 + 0.8 * envelope);
    if (hole.current) {
      hole.current.position.copy(group.position);
      hole.current.strength = envelope;
    }

    if (p >= 1) {
      s.active = false;
      s.timer = 14 + Math.random() * 8;
      group.visible = false;
      if (hole.current) hole.current.strength = 0;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshBasicMaterial color="#000000" depthWrite />
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
    timer: 9 + Math.random() * 7,
    age: 0,
    dur: 3.2,
    position: [0, 0, 0] as Vec3,
    finalOpacity: 0.7,
  });

  function spawn() {
    const s = state.current;
    s.position = [
      (Math.random() * 2 - 1) * 5.2,
      (Math.random() * 2 - 1) * 2.8,
      -1.6 + Math.random() * 1.2,
    ];
    s.finalOpacity = 0.45 + Math.random() * 0.35;
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
      s.timer = 9 + Math.random() * 7;
      mesh.visible = false;
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.02, 12, 12]} />
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
      s.spawnTimer = 3 + Math.random() * 3;
      group.current.visible = false;
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 1.2, 6, 1]} />
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
        <sphereGeometry args={[0.04, 12, 12]} />
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
  const hole = useRef<HoleState>({ position: new THREE.Vector3(), strength: 0 });

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
      <StarField quality={quality} hole={hole} />
      <SkyLinks links={scene.links} hole={hole} />
      <ConstellationStars stars={scene.stars} hole={hole} />
      <ConstellationEdges scene={scene} hole={hole} />
      <VariableStar position={variableStars.betelgeuse} period={12} phase={0.5} baseOpacity={0.7} />
      <VariableStar position={variableStars.antares} period={17} phase={2.4} baseOpacity={0.6} />
      <Supernova stars={scene.stars} />
      <BlackHole hole={hole} />
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
