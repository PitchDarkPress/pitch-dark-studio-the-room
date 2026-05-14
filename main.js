import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0908, 0.010);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

camera.position.set(0, 3.2, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const room = new THREE.Group();
scene.add(room);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(42, 42),
  new THREE.MeshStandardMaterial({
    color: 0x3a2618,
    roughness: 0.95
  })
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
room.add(floor);

const wallMat = new THREE.MeshStandardMaterial({
  color: 0x1f1510,
  roughness: 1
});

function wall(w, h, x, y, z, ry = 0) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  room.add(mesh);
}

wall(42, 18, 0, 9, -21, 0);
wall(42, 18, 0, 9, 21, Math.PI);
wall(42, 18, -21, 9, 0, Math.PI / 2);
wall(42, 18, 21, 9, 0, -Math.PI / 2);

const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(42, 42),
  new THREE.MeshStandardMaterial({ color: 0x11100f })
);

ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 18;
room.add(ceiling);

function shelf(x, z, rot = 0) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(5, 13, 1.2),
    new THREE.MeshStandardMaterial({
      color: 0x342015,
      roughness: 0.9
    })
  );

  body.position.y = 6.5;
  g.add(body);

  for (let y = 1; y < 12; y += 2.2) {
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(5.1, 0.12, 1.25),
      new THREE.MeshStandardMaterial({ color: 0x25170f })
    );

    plank.position.y = y;
    g.add(plank);
  }

  for (let i = 0; i < 120; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 1 + Math.random() * 0.5, 0.7),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          0.05 + Math.random() * 0.03,
          0.5,
          0.24 + Math.random() * 0.14
        )
      })
    );

    b.position.set(
      -2 + Math.random() * 4,
      0.7 + Math.floor(i / 20) * 2.2,
      0
    );

    g.add(b);
  }

  g.position.set(x, 0, z);
  g.rotation.y = rot;
  room.add(g);
}

shelf(-18, -12, Math.PI / 2);
shelf(-18, 0, Math.PI / 2);
shelf(-18, 12, Math.PI / 2);
shelf(18, -12, -Math.PI / 2);
shelf(18, 0, -Math.PI / 2);
shelf(18, 12, -Math.PI / 2);
shelf(-8, -18, 0);
shelf(8, -18, 0);

const desk = new THREE.Mesh(
  new THREE.BoxGeometry(6, 1.2, 3),
  new THREE.MeshStandardMaterial({
    color: 0x4a2f1d,
    roughness: 0.9
  })
);

desk.position.set(0, 0.6, 3);
desk.castShadow = true;
room.add(desk);

const chair = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshStandardMaterial({ color: 0x2a1a10 })
);

chair.position.set(0.5, 0.8, 6);
chair.rotation.y = 0.4;
room.add(chair);

const lamp = new THREE.PointLight(0xffc27a, 38, 45, 1.6);
lamp.position.set(0, 4, 3);
lamp.castShadow = true;
room.add(lamp);

const lampGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.16, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffc07a })
);

lampGlow.position.copy(lamp.position);
room.add(lampGlow);

const moon = new THREE.SpotLight(0xbfd8ff, 30, 120, 0.8, 0.5, 1);
moon.position.set(0, 16, -10);
moon.target.position.set(0, 3, -18);
scene.add(moon.target);
scene.add(moon);

const windowFrame = new THREE.Mesh(
  new THREE.BoxGeometry(8, 10, 0.3),
  new THREE.MeshStandardMaterial({ color: 0x151515 })
);

windowFrame.position.set(0, 8, -20.5);
room.add(windowFrame);

for (let i = 0; i < 6; i++) {
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 10, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x333333 })
  );

  bar.position.set(-3 + i * 1.2, 8, -20.3);
  room.add(bar);
}

const ambient = new THREE.AmbientLight(0x6b4c2c, 0.42);
scene.add(ambient);

const dustGeo = new THREE.BufferGeometry();
const dustCount = 2500;
const positions = new Float32Array(dustCount * 3);

for (let i = 0; i < dustCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 60;
}

dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const dust = new THREE.Points(
  dustGeo,
  new THREE.PointsMaterial({
    color: 0xffd7a0,
    size: 0.05,
    transparent: true,
    opacity: 0.35
  })
);

scene.add(dust);

let yaw = 0;
let pitch = 0;
const keys = {};

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

window.addEventListener('mousemove', e => {
  yaw -= e.movementX * 0.0015;
  pitch -= e.movementY * 0.0012;
  pitch = Math.max(-1, Math.min(1, pitch));
});

function move() {
  const speed = 0.055;

  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3().crossVectors(
    forward,
    new THREE.Vector3(0, 1, 0)
  );

  if (keys['w']) camera.position.add(forward.clone().multiplyScalar(speed));
  if (keys['s']) camera.position.add(forward.clone().multiplyScalar(-speed));
  if (keys['a']) camera.position.add(right.clone().multiplyScalar(speed));
  if (keys['d']) camera.position.add(right.clone().multiplyScalar(-speed));

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

function animate() {
  requestAnimationFrame(animate);

  move();

  dust.rotation.y += 0.00008;
  lamp.intensity = 36 + Math.sin(Date.now() * 0.002) * 1.2;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
