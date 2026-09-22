import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from 'urdf-loader';

const CLIPS = [
  { id: 'crouch', name: 'Crouch', desc: 'Prueba de agachado — postura baja de A2', file: 'assets/robot/traj/crouch.json' },
  { id: 'agile', name: 'Agile test', desc: 'Locomoción dinámica registrada en pista', file: 'assets/robot/traj/agile.json' },
  { id: 'terrain', name: 'Terreno irregular', desc: 'Prueba de robustez sobre tablas', file: 'assets/robot/traj/terrain.json' },
];

const wrap = document.getElementById('viewer-wrap');
const statusEl = document.getElementById('viewer-status');
const sideEl = document.getElementById('lab-side');
const playBtn = document.getElementById('play-btn');
const seek = document.getElementById('seek');

let robot = null;
let currentClip = null;
let playing = true;
let elapsed = 0;

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 20);
camera.position.set(1.1, 0.85, 1.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
wrap.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.12, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.1;
controls.minDistance = 0.6;
controls.maxDistance = 4;
controls.addEventListener('start', () => { controls.autoRotate = false; });

scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 2.0);
key.position.set(2, 3, 2);
scene.add(key);
const rim = new THREE.DirectionalLight(0x1d5dad, 0.6);
rim.position.set(-2, 1, -2);
scene.add(rim);

const grid = new THREE.GridHelper(2.4, 24, 0x1d5dad, 0xd8dadd);
grid.material.opacity = 0.35;
grid.material.transparent = true;
scene.add(grid);

function resize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(wrap);

const manager = new THREE.LoadingManager();
const loader = new URDFLoader(manager);
loader.load(
  'assets/robot/a2/a2.urdf',
  (result) => {
    robot = result;
    robot.rotation.x = -Math.PI / 2;
    scene.add(robot);
  },
  undefined,
  (err) => {
    statusEl.textContent = 'No se pudo cargar el modelo del A2.';
    console.error(err);
  },
);

manager.onLoad = () => {
  if (!robot) return;
  robot.traverse((c) => {
    if (c.isMesh) {
      c.material = new THREE.MeshStandardMaterial({ color: 0xdfe2e6, metalness: 0.35, roughness: 0.55 });
      c.castShadow = false;
    }
  });
  const box = new THREE.Box3().setFromObject(robot);
  const center = box.getCenter(new THREE.Vector3());
  robot.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
  statusEl.style.display = 'none';
  resize();
  loadClip(CLIPS[0]);
};

async function loadClip(clip) {
  const res = await fetch(clip.file);
  const data = await res.json();
  currentClip = { ...clip, joints: data.joints, frames: data.frames, duration: data.frames.at(-1)[0] };
  elapsed = 0;
  seek.max = currentClip.duration.toFixed(2);
  seek.value = 0;
  renderSideButtons();
}

function renderSideButtons() {
  sideEl.querySelectorAll('.clip-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.id === currentClip.id);
  });
}

sideEl?.addEventListener('click', (e) => {
  const btn = e.target.closest('.clip-btn');
  if (!btn) return;
  const clip = CLIPS.find((c) => c.id === btn.dataset.id);
  if (clip) loadClip(clip);
});

playBtn.addEventListener('click', () => {
  playing = !playing;
  playBtn.textContent = playing ? '⏸' : '▶';
});

seek.addEventListener('input', () => {
  elapsed = parseFloat(seek.value);
  playing = false;
  playBtn.textContent = '▶';
});

function applyFrameAt(t) {
  if (!robot || !currentClip) return;
  const frames = currentClip.frames;
  let i = 0;
  while (i < frames.length - 1 && frames[i + 1][0] <= t) i++;
  const [t0, p0] = frames[i];
  const [t1, p1] = frames[Math.min(i + 1, frames.length - 1)];
  const span = t1 - t0 || 1;
  const alpha = Math.min(Math.max((t - t0) / span, 0), 1);
  currentClip.joints.forEach((name, idx) => {
    const v = p0[idx] + (p1[idx] - p0[idx]) * alpha;
    robot.setJointValue(name, v);
  });
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  if (playing && currentClip) {
    elapsed += dt;
    if (elapsed > currentClip.duration) elapsed = 0;
    seek.value = elapsed.toFixed(2);
  }
  applyFrameAt(elapsed);
  controls.update();
  renderer.render(scene, camera);
}
animate();
