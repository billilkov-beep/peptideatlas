import * as THREE from 'three';
import type { CategoryId } from './categories';

type Ring = [number, number, number];
type BodyMaterial = THREE.MeshStandardMaterial;

/** Original procedural navigation sculpture. This is not a clinical anatomy model. */
export function createHumanModel() {
  const group = new THREE.Group();
  group.name = 'PeptideAtlasOriginalHumanV1';
  const surfaces: THREE.Mesh<THREE.BufferGeometry, BodyMaterial>[] = [];
  const organMeshes: THREE.Mesh<THREE.BufferGeometry, BodyMaterial>[] = [];
  const base = new THREE.MeshStandardMaterial({ color: '#d6e5de', roughness: .42, metalness: .08 });
  const organ = new THREE.MeshStandardMaterial({ color: '#7eaa98', roughness: .65, metalness: .03 });

  function register(geometry: THREE.BufferGeometry, material: BodyMaterial, categories: CategoryId[], isOrgan = false) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.userData.categories = categories;
    mesh.userData.originalColor = mesh.material.color.clone();
    mesh.userData.isOrgan = isOrgan;
    (isOrgan ? organMeshes : surfaces).push(mesh);
    group.add(mesh);
    return mesh;
  }

  function ellipsoid(position: [number, number, number], scale: [number, number, number], categories: CategoryId[], isOrgan = false) {
    const mesh = register(new THREE.SphereGeometry(1, 32, 24), isOrgan ? organ : base, categories, isOrgan);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    return mesh;
  }

  // Smooth elliptical rings preserve sculptural continuity across the torso and limbs.
  function loft(rings: Ring[], categories: CategoryId[], material = base) {
    const curve = new THREE.CatmullRomCurve3(rings.map(([y, x, z]) => new THREE.Vector3(x, y, z)), false, 'catmullrom', .25);
    const vertices: number[] = [];
    const uv: number[] = [];
    const indices: number[] = [];
    const rows = 52, segments = 40;
    for (let row = 0; row <= rows; row++) {
      const p = curve.getPoint(row / rows);
      for (let col = 0; col <= segments; col++) {
        const a = col / segments * Math.PI * 2;
        vertices.push(Math.cos(a) * Math.max(.001, p.x), p.y, Math.sin(a) * Math.max(.001, p.z));
        uv.push(col / segments, row / rows);
        if (row < rows && col < segments) {
          const a0 = row * (segments + 1) + col;
          const b = a0 + segments + 1;
          indices.push(a0, b, a0 + 1, a0 + 1, b, b + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return register(geometry, material, categories);
  }

  function limb(from: THREE.Vector3, to: THREE.Vector3, profile: [number, number][], categories: CategoryId[]) {
    const length = from.distanceTo(to);
    const rings: Ring[] = profile.map(([t, radius]) => [t * length, radius, radius * .88]);
    const mesh = loft(rings, categories);
    mesh.position.copy(from);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    return mesh;
  }

  // Torso and pelvis are a continuous loft rather than independent spheres.
  loft([
    [1.51, .025, .04], [1.58, .24, .14], [1.73, .30, .19], [1.88, .245, .165],
    [2.04, .255, .175], [2.24, .34, .205], [2.44, .415, .20], [2.56, .37, .16],
    [2.65, .18, .12], [2.68, .10, .08],
  ], ['skin', 'musculoskeletal']);
  loft([[2.59, .12, .10], [2.70, .105, .105], [2.82, .11, .11], [2.87, .11, .10]], ['skin', 'hormones']);
  loft([[2.81, .025, .04], [2.87, .11, .11], [2.97, .17, .155], [3.11, .19, .16], [3.24, .17, .15], [3.31, .12, .105], [3.34, .001, .001]], ['skin', 'brain']);

  // Slightly shaped facial features give the body a calm, neutral sculpture-like face.
  ellipsoid([0, 3.015, .153], [.031, .075, .042], ['skin']);
  ellipsoid([-.184, 3.055, 0], [.024, .053, .039], ['skin']);
  ellipsoid([.184, 3.055, 0], [.024, .053, .039], ['skin']);
  for (const side of [-1, 1]) {
    ellipsoid([side * .075, 3.08, .149], [.047, .014, .008], ['skin']);
    ellipsoid([side * .09, 3.015, .124], [.065, .042, .037], ['skin']);

    const shoulder = new THREE.Vector3(side * .40, 2.49, .0);
    const elbow = new THREE.Vector3(side * .56, 2.04, .005);
    const wrist = new THREE.Vector3(side * .69, 1.61, .04);
    ellipsoid([side * .397, 2.46, .0], [.155, .185, .16], ['skin', 'musculoskeletal']);
    limb(shoulder, elbow, [[0,.10],[.17,.125],[.45,.115],[.8,.089],[1,.085]], ['skin', 'musculoskeletal']);
    ellipsoid([elbow.x, elbow.y, elbow.z], [.087, .102, .082], ['skin', 'musculoskeletal']);
    limb(elbow, wrist, [[0,.087],[.18,.105],[.55,.086],[.85,.055],[1,.048]], ['skin', 'musculoskeletal']);
    const palm = ellipsoid([side * .712, 1.505, .035], [.072, .12, .037], ['skin']);
    palm.rotation.z = side * .16;
    for (let f = 0; f < 4; f++) {
      const x = side * (.666 + f * .028);
      const top = new THREE.Vector3(x, 1.45, .035);
      const bottom = new THREE.Vector3(x + side * .012, 1.34 + Math.abs(f - 1.4) * .022, .03);
      limb(top, bottom, [[0,.018],[.4,.016],[.8,.014],[1,.006]], ['skin']);
    }
    limb(new THREE.Vector3(side * .66, 1.53, .05), new THREE.Vector3(side * .62, 1.42, .07), [[0,.024],[.6,.022],[1,.007]], ['skin']);
    limb(new THREE.Vector3(side * .155, 1.68, -.015), new THREE.Vector3(side * .175, .935, .02), [[0,.15],[.18,.175],[.45,.16],[.75,.125],[1,.098]], ['skin', 'musculoskeletal']);
    ellipsoid([side * .175, .927, .035], [.10, .115, .102], ['skin', 'musculoskeletal']);
    limb(new THREE.Vector3(side * .175, .93, .015), new THREE.Vector3(side * .19, .23, -.01), [[0,.09],[.20,.12],[.38,.115],[.68,.075],[1,.052]], ['skin', 'musculoskeletal']);
    ellipsoid([side * .19, .225, -.005], [.058, .10, .067], ['skin']);
    ellipsoid([side * .197, .105, .092], [.075, .068, .17], ['skin']);
    // Subtle chest and abdominal contours sit flush with the continuous torso.
    const pectoral = ellipsoid([side * .18, 2.355, .165], [.177, .105, .063], ['skin', 'musculoskeletal']);
    pectoral.rotation.z = -side * .06;
    for (let i = 0; i < 3; i++) {
      ellipsoid([side * .065, 2.16 - i * .115, .159], [.063, .047, .025], ['skin', 'musculoskeletal']);
    }
  }

  // Stylized organ landmarks are deliberately restrained and do not claim clinical accuracy.
  for (const side of [-1, 1]) {
    ellipsoid([side * .073, 3.17, .142], [.068, .092, .033], ['brain'], true);
    for (let i = 0; i < 3; i++) {
      const fold = register(new THREE.TorusGeometry(.039 + i * .006, .004, 6, 22, Math.PI * 1.55), organ, ['brain'], true);
      fold.position.set(side * .068, 3.15 + i * .027, .175);
      fold.rotation.z = side * .5;
    }
    const lung = ellipsoid([side * .16, 2.35, .205], [.09, .17, .027], ['cardiovascular'], true);
    lung.material.color.set('#adc5b9');
    lung.userData.originalColor = lung.material.color.clone();
    const thyroid = ellipsoid([side * .045, 2.735, .10], [.033, .045, .019], ['hormones'], true);
    thyroid.rotation.z = side * .32;
    for (const [x,y,z] of [[side*.27,2.39,.19],[side*.11,2.65,.12],[side*.17,1.73,.16]]) {
      ellipsoid([x!,y!,z!], [.018,.027,.015], ['immune'], true);
    }
  }
  const heart = ellipsoid([.105, 2.325, .265], [.064, .085, .035], ['cardiovascular'], true);
  heart.rotation.z = .35;
  const stomach = ellipsoid([.075, 2.07, .195], [.09, .068, .035], ['digestive'], true);
  stomach.rotation.z = -.55;
  for (let i = 0; i < 4; i++) {
    const intestine = register(new THREE.TorusGeometry(.08 + (i % 2) * .02, .016, 8, 28), organ, ['digestive'], true);
    intestine.scale.set(1.3, .32, .65);
    intestine.position.set(0, 1.99 - i * .045, .18);
  }
  ellipsoid([0, 1.66, .15], [.10, .055, .023], ['reproductive'], true);

  const glowColor = new THREE.Color('#3e9f85');
  function setCategory(category: CategoryId | null) {
    for (const mesh of [...surfaces, ...organMeshes]) {
      const selected = category !== null && (mesh.userData.categories as string[]).includes(category);
      const original = mesh.userData.originalColor as THREE.Color;
      mesh.material.color.copy(original);
      if (selected) mesh.material.color.lerp(glowColor, mesh.userData.isOrgan ? .58 : .22);
      mesh.material.emissive.set(selected ? '#164c3e' : '#000000');
      mesh.material.emissiveIntensity = selected ? .18 : 0;
    }
  }

  function dispose() {
    for (const mesh of [...surfaces, ...organMeshes]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    base.dispose();
    organ.dispose();
  }

  return { group, setCategory, dispose, surfaces, organMeshes };
}
