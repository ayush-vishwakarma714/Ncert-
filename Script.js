// --- Utility: year ---
document.getElementById('y').textContent = new Date().getFullYear();

// --- Mobile nav toggle ---
const nav = document.querySelector('.nav');
document.querySelector('.nav-toggle').addEventListener('click', () => {
  nav.classList.toggle('open');
});

// --- Smooth “fake” search (demo) ---
document.getElementById('searchBtn').addEventListener('click', () => {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if(!q) { window.location.hash = '#notes'; return; }
  // Simple demo routing
  if(q.includes('class')) window.location.hash = '#classes';
  else if(['math','science','english','hindi','physics','chemistry','biology','social'].some(s=>q.includes(s))) {
    window.location.hash = '#notes';
  } else {
    window.location.hash = '#notes';
  }
});

// --- Tilt effect for cards/tiles ---
const tiltEls = [...document.querySelectorAll('.tilt')];
tiltEls.forEach(el => {
  let rect;
  const MAX = 10; // deg
  const enter = () => { rect = el.getBoundingClientRect(); el.style.willChange = 'transform'; };
  const leave = () => { el.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'; el.style.willChange = 'auto'; };
  const move = (e) => {
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const rx = ((y/rect.height) - 0.5) * -2 * MAX;
    const ry = ((x/rect.width)  - 0.5) *  2 * MAX;
    el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(6px)`;
  };
  el.addEventListener('mouseenter', enter);
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseleave', leave);
  el.addEventListener('touchstart', enter, {passive:true});
  el.addEventListener('touchend', leave);
});

// --- Three.js: Animated 3D “study desk” with book stack ---
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
function setRendererSize(){
  renderer.setSize(window.innerWidth, document.querySelector('.hero').offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
setRendererSize();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / document.querySelector('.hero').offsetHeight, 0.1, 100);
camera.position.set(4, 3, 7);
camera.lookAt(0, 0.6, 0);

// Lights
const hemi = new THREE.HemisphereLight(0xbddcff, 0x0b1221, 0.8);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 8, 6);
dir.castShadow = false;
scene.add(dir);

// Desk (plane)
const deskGeo = new THREE.PlaneGeometry(20, 10);
const deskMat = new THREE.MeshStandardMaterial({ color: 0x0b1428, roughness: 0.8, metalness: 0.1 });
const desk = new THREE.Mesh(deskGeo, deskMat);
desk.rotation.x = -Math.PI / 2;
desk.position.y = -0.2;
scene.add(desk);

// Book factory (thin boxes)
function makeBook({w=1.2, h=0.2, d=0.9, color=0x1e3a8a, x=0, y=0, z=0, ry=0}){
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.MeshStandardMaterial({ color, roughness:0.6, metalness:0.1 });
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(x,y,z);
  mesh.rotation.y = ry;
  scene.add(mesh);
  // pages
  const gp = new THREE.BoxGeometry(w*0.94, h*0.6, d*0.92);
  const mp = new THREE.MeshStandardMaterial({ color:0xf3f4f6, roughness:1, metalness:0 });
  const pages = new THREE.Mesh(gp, mp);
  pages.position.set(0, h*0.05, 0);
  mesh.add(pages);
  return mesh;
}

// Stack of books
const books = [
  makeBook({ color:0x1e3a8a, y:0.00, ry: 0.07}),
  makeBook({ color:0x38bdf8, y:0.22, ry:-0.05}),
  makeBook({ color:0x16a34a, y:0.44, ry: 0.03}),
  makeBook({ color:0xffd166, y:0.66, ry:-0.02})
];

// Pencil (simple cylinder + cone)
const pencil = new THREE.Group();
const bodyGeo = new THREE.CylinderGeometry(0.05,0.05,1.6,12);
const bodyMat = new THREE.MeshStandardMaterial({ color:0xf59e0b, roughness:.5 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
pencil.add(body);
const tipGeo = new THREE.ConeGeometry(0.06,0.2,24);
const tipMat = new THREE.MeshStandardMaterial({ color:0x7f5539 });
const tip = new THREE.Mesh(tipGeo, tipMat);
tip.position.y = -0.9;
pencil.add(tip);
pencil.rotation.set(0.1, 0.6, -0.2);
pencil.position.set(1.6, 0.2, 0.6);
scene.add(pencil);

// Gentle float animation
let t = 0;
function animate(){
  requestAnimationFrame(animate);
  t += 0.01;
  books.forEach((b,i)=>{
    b.position.y = 0.22*i + Math.sin(t + i)*0.03;
    b.rotation.y += 0.0008 * (i%2===0?1:-1);
  });
  pencil.position.y = 0.2 + Math.sin(t*1.2)*0.05;
  pencil.rotation.z += 0.002;

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', ()=>{
  setRendererSize();
  camera.aspect = window.innerWidth / document.querySelector('.hero').offsetHeight;
  camera.updateProjectionMatrix();
});

// Optional: reduce GPU use when tab hidden
document.addEventListener('visibilitychange', () => {
  renderer.setAnimationLoop(document.hidden ? null : animate);
});
