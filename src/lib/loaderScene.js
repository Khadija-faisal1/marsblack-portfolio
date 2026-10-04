import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL = encodeURI("/assets/3D ASSETS/BeoSound9000.gltf");
const RED = 0xd92a00;
const FIT = 2.4; // model's largest side in scene units
const FRAMING = 1.25; // raise to make the model smaller on screen
const MODEL_ROTATION = [0, 0, 0]; // if it looks sideways, try [0, Math.PI / 2, 0] or [Math.PI / 2, 0, 0]

export function createLoaderScene(container, { onReady }) {
  let disposed = false;
  let loaded = false;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  const pivot = new THREE.Group();
  scene.add(pivot);

  // keeps everything below clip.constant (world Y)
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -100);
  let minY = -1, maxY = 1, radius = 1.6;

  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, clippingPlanes: [clip] });
  const redMat = new THREE.LineBasicMaterial({ color: RED, clippingPlanes: [clip] });
  const fillMat = new THREE.MeshBasicMaterial({
    color: 0x050505, side: THREE.DoubleSide, clippingPlanes: [clip],
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });

  // red scan sheet + ring that travels up the model
  const sheetMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
  const ringMat = new THREE.MeshBasicMaterial({ color: RED, side: THREE.DoubleSide });
  const scan = new THREE.Group();
  scan.add(new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6).rotateX(-Math.PI / 2), sheetMat));
  scan.add(new THREE.Mesh(new THREE.RingGeometry(1.7, 1.72, 128).rotateX(-Math.PI / 2), ringMat));
  scan.visible = false;
  scene.add(scan);

  function fit() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    const dist = (radius * FRAMING) / Math.sin(Math.min(vHalf, hHalf));
    camera.position.set(0, dist * 0.3, dist * 0.95);
    camera.lookAt(0, 0, 0);
  }
  const ro = new ResizeObserver(fit);
  ro.observe(container);
  fit();

  /* load + convert to wireframe */
  new GLTFLoader().load(
    MODEL,
    (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      model.rotation.set(...MODEL_ROTATION);
      model.updateMatrixWorld(true);

      let box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const s = FIT / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(s);
      model.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(model);
      model.position.sub(box.getCenter(new THREE.Vector3()));
      model.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(model);
      minY = box.min.y;
      maxY = box.max.y;
      radius = box.getSize(new THREE.Vector3()).length() / 2;

      model.traverse((o) => {
        if (!o.isMesh) return;
        const first = Array.isArray(o.material) ? o.material[0] : o.material;
        const isColor = /color/i.test(first?.name || ""); // the B&O_Color CDs
        o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 25), isColor ? redMat : lineMat));
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m?.dispose?.());
        o.material = fillMat;
      });

      pivot.add(model);
      loaded = true;
      scan.visible = true;
      fit();
      onReady(true);
    },
    undefined,
    () => !disposed && onReady(false)
  );

  /* pointer parallax + spin */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: 0, tx: 0 };
  const onMove = (e) => (pointer.tx = (e.clientX / window.innerWidth) * 2 - 1);
  window.addEventListener("pointermove", onMove);

  const clock = new THREE.Clock();
  let spin = -0.6;
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    if (!reduce) spin += dt * 0.45;
    pivot.rotation.y = spin + pointer.x * 0.5;
    renderer.render(scene, camera);
  });

  return {
    setProgress(p) {
      if (!loaded) return;
      const y = THREE.MathUtils.lerp(minY - 0.02, maxY + 0.02, p);
      clip.constant = p >= 1 ? 100 : y;
      scan.position.y = y;
      scan.visible = p < 1;
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => o.geometry?.dispose?.());
      [lineMat, redMat, fillMat, sheetMat, ringMat].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}