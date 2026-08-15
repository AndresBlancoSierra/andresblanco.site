import * as THREE from 'three';

/** Einstein radius of the black hole lens, in scene units. */
export const EINSTEIN_R = 0.55;

/** Scratch vectors/matrices for view-space lensing (used synchronously). */
const tmpViewP = new THREE.Vector3();
const tmpViewH = new THREE.Vector3();
const tmpLocalToView = new THREE.Matrix4();
const tmpViewToLocal = new THREE.Matrix4();

/**
 * Point-lens (Einstein ring) displacement used by the black hole event.
 *
 * For a background source at radius `r` from the lens, the image radius `theta`
 * is the positive root of `theta^2 - r*theta - R^2 = 0`. Stars pile up into a
 * ring at the Einstein radius `R` while the region at the lens centre is swept
 * clear — the classic weak-lensing signature. `strength` blends between the
 * original position and the fully-lensed one (0..1), so the effect can fade in
 * and out with the black hole.
 */
export function lensPoint(
  out: THREE.Vector3,
  point: THREE.Vector3,
  hole: THREE.Vector3,
  einsteinR: number,
  strength: number,
): THREE.Vector3 {
  out.copy(point);
  if (strength <= 0) return out;

  const dx = point.x - hole.x;
  const dy = point.y - hole.y;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < 1e-4) {
    out.set(hole.x, hole.y, point.z);
    return out;
  }

  const theta = 0.5 * (r + Math.sqrt(r * r + 4 * einsteinR * einsteinR));
  const lx = hole.x + (dx / r) * theta;
  const ly = hole.y + (dy / r) * theta;

  out.set(point.x + (lx - point.x) * strength, point.y + (ly - point.y) * strength, point.z);
  return out;
}

/**
 * Lens a point about a black hole in **view space**, so the Einstein ring
 * projects as a perfect circle on screen regardless of camera orientation or
 * the depth of the surrounding stars. Lensing in world space makes the ring
 * oval because stars sit at different depths and the plane of displacement
 * is not perpendicular to the view direction.
 *
 * `localToWorld` is the world matrix of the object that owns `point` and
 * `hole` (both given in that object's local space). The point is transformed
 * to view space, displaced in the view xy-plane (perpendicular to the camera),
 * then transformed back to local space.
 */
export function lensPointInView(
  out: THREE.Vector3,
  point: THREE.Vector3,
  hole: THREE.Vector3,
  localToView: THREE.Matrix4,
  viewToLocal: THREE.Matrix4,
  einsteinR: number,
  strength: number,
): THREE.Vector3 {
  tmpViewP.copy(point).applyMatrix4(localToView);
  tmpViewH.copy(hole).applyMatrix4(localToView);
  lensPoint(tmpViewP, tmpViewP, tmpViewH, einsteinR, strength);
  return out.copy(tmpViewP).applyMatrix4(viewToLocal);
}

/**
 * Convenience wrapper that builds the local↔view transforms from a camera and
 * the owning object's world matrix, then lenses `point` in view space.
 */
export function lensPointAboutHole(
  out: THREE.Vector3,
  point: THREE.Vector3,
  hole: THREE.Vector3,
  camera: THREE.Camera,
  localToWorld: THREE.Matrix4,
  einsteinR: number,
  strength: number,
): THREE.Vector3 {
  camera.updateMatrixWorld();
  tmpLocalToView.multiplyMatrices(camera.matrixWorldInverse, localToWorld);
  tmpViewToLocal.copy(tmpLocalToView).invert();
  return lensPointInView(out, point, hole, tmpLocalToView, tmpViewToLocal, einsteinR, strength);
}

/** GLSL twin of `lensPoint`, run in view space in the star-field vertex shader. */
export const LENSING_GLSL = /* glsl */ `
  vec3 lensed(vec3 p) {
    vec4 hv = viewMatrix * modelMatrix * vec4(uHole, 1.0);
    vec2 d = p.xy - hv.xy;
    float r = length(d);
    if (r < 0.0001) return vec3(hv.xy, p.z);
    float th = 0.5 * (r + sqrt(r * r + 4.0 * uEinstein * uEinstein));
    vec2 dir = d / r;
    vec2 lensedXY = hv.xy + dir * th;
    return vec3(mix(p.xy, lensedXY, uHoleStrength), p.z);
  }
`;
