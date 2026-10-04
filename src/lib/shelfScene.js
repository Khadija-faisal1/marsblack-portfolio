import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const SHELF_MODEL = "/assets/3D ASSETS/WallShelf .glb";
const A = "/assets/WORK/";
const CASES = [
  {
    col: 2,
    row: 0,
    img: A + "RURURU ONSEN.png",
    title: "RURURU ONSEN",
  },
  {
    col: 0,
    row: 1,
    img: A + "ADIDAS CHILE20.png",
    title: "ADIDAS CHILE20",
  },
  {
    col: 2,
    row: 1,
    img: A + "PERSEPOLIS.png",
    title: "PERSEPOLIS",
  },
  { col: 1, row: 2, img: A + "OLIGALKU.jpg", title: "OLIGALUKU" },
  {
    col: 3,
    row: 3,
    img: A + "Divine Eau de Milano 2.jpg",
    title: "Divine Eau de Milano",
  },
];
const GRID = 4;
const STYLE = {
  shelfSize: 4.6,
  caseSize: 1.08,
  caseZOffset: 0.045,
  fillHeight: 0.94,
  fillWidth: 0.98,
  liftY: 0.35, // raise to move the shelf higher in the frame
  fallbackInset: { side: 0.07, top: 0.06, bottom: 0.06 },
};

/* ---------- math helpers ---------- */
const ease = (c, t, a) => c + (t - c) * a;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => {
  const c1 = 1.70158,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/* ---------- find the real cubbies by rendering a silhouette ---------- */
function detectCells(renderer, model, box) {
  const size = box.getSize(new THREE.Vector3());
  const W = 384;
  const H = Math.max(64, Math.round((W * size.y) / size.x));
  const target = new THREE.WebGLRenderTarget(W, H);
  const tmp = new THREE.Scene();
  tmp.background = new THREE.Color(0xffffff);
  tmp.overrideMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    fog: false,
  });
  tmp.add(model.clone(true));

  const ortho = new THREE.OrthographicCamera(
    box.min.x,
    box.max.x,
    box.max.y,
    box.min.y,
    0.1,
    size.z + 30,
  );
  ortho.position.set(0, 0, box.max.z + 10);
  ortho.updateProjectionMatrix();
  ortho.updateMatrixWorld(true);

  renderer.setRenderTarget(target);
  renderer.render(tmp, ortho);
  renderer.setRenderTarget(null);

  const pixels = new Uint8Array(W * H * 4);
  renderer.readRenderTargetPixels(target, 0, 0, W, H, pixels);
  target.dispose();
  tmp.overrideMaterial.dispose();

  const solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) solid[i] = pixels[i * 4] < 140 ? 1 : 0;

  const seen = new Uint8Array(W * H);
  const stack = new Int32Array(W * H);
  const regions = [];

  for (let start = 0; start < W * H; start++) {
    if (solid[start] || seen[start]) continue;
    let sp = 0;
    stack[sp++] = start;
    seen[start] = 1;
    let area = 0,
      sx = 0,
      sy = 0,
      minx = W,
      maxx = 0,
      miny = H,
      maxy = 0,
      border = false;

    const push = (n) => {
      if (!solid[n] && !seen[n]) {
        seen[n] = 1;
        stack[sp++] = n;
      }
    };

    while (sp > 0) {
      const idx = stack[--sp];
      const x = idx % W;
      const y = (idx - x) / W;
      area++;
      sx += x;
      sy += y;
      if (x < minx) minx = x;
      if (x > maxx) maxx = x;
      if (y < miny) miny = y;
      if (y > maxy) maxy = y;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true;
      if (x > 0) push(idx - 1);
      if (x < W - 1) push(idx + 1);
      if (y > 0) push(idx - W);
      if (y < H - 1) push(idx + W);
    }
    if (!border) regions.push({ area, sx, sy, minx, maxx, miny, maxy });
  }

  const need = GRID * GRID;
  regions.sort((a, b) => b.area - a.area);
  const minArea = ((W * H) / need) * 0.08;
  const valid = regions.filter((r) => r.area > minArea);
  if (valid.length < need) return null;
  const picked = valid.slice(0, need);
  if (picked[need - 1].area < picked[0].area * 0.35) return null;

  const cells = picked.map((r) => ({
    x: box.min.x + ((r.sx / r.area + 0.5) / W) * size.x,
    y: box.min.y + ((r.sy / r.area + 0.5) / H) * size.y,
    w: ((r.maxx - r.minx + 1) / W) * size.x,
    h: ((r.maxy - r.miny + 1) / H) * size.y,
    area: (r.area / (W * H)) * size.x * size.y,
  }));

  cells.sort((a, b) => b.y - a.y);
  const grid = [];
  for (let r = 0; r < GRID; r++) {
    grid.push(cells.slice(r * GRID, (r + 1) * GRID).sort((a, b) => a.x - b.x));
  }
  return grid;
}

function insetGrid(box) {
  const size = box.getSize(new THREE.Vector3());
  const i = STYLE.fallbackInset;
  const x0 = box.min.x + size.x * i.side;
  const x1 = box.max.x - size.x * i.side;
  const y0 = box.min.y + size.y * i.bottom;
  const y1 = box.max.y - size.y * i.top;
  const cw = (x1 - x0) / GRID;
  const ch = (y1 - y0) / GRID;
  const grid = [];
  for (let r = 0; r < GRID; r++) {
    const row = [];
    for (let c = 0; c < GRID; c++) {
      row.push({
        x: x0 + cw * (c + 0.5),
        y: y1 - ch * (r + 0.5),
        w: cw,
        h: ch,
        area: cw * ch,
      });
    }
    grid.push(row);
  }
  return grid;
}

function findCellDepth(model, cell, box) {
  const ray = new THREE.Raycaster();
  ray.far = cell.h * 0.8;
  const dir = new THREE.Vector3(0, -1, 0);
  let zMin = Infinity,
    zMax = -Infinity;
  for (let i = 0; i <= 9; i++) {
    const z = THREE.MathUtils.lerp(box.min.z, box.max.z, i / 9);
    ray.set(new THREE.Vector3(cell.x, cell.y, z), dir);
    if (ray.intersectObject(model, true).length > 0) {
      zMin = Math.min(zMin, z);
      zMax = Math.max(zMax, z);
    }
  }
  return zMin <= zMax ? (zMin + zMax) / 2 : null;
}

/* ====================== MAIN ====================== */
export function createShelfScene(stage, label, onCaseClick) {
  let disposed = false;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, {
    display: "block",
    width: "100%",
    height: "100%",
  });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 10, 14);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  const shelfDims = { w: STYLE.shelfSize, h: STYLE.shelfSize, d: 0.9 };

  function fitCamera() {
    const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const dH = shelfDims.h / STYLE.fillHeight / (2 * halfTan);
    const dW = shelfDims.w / STYLE.fillWidth / (2 * halfTan * camera.aspect);
    const dist = Math.max(dH, dW) + shelfDims.d / 2;
    camera.position.set(0, 0, dist);
    scene.fog.near = dist - 0.45;
    scene.fog.far = dist + 1.9;
  }

  /* lights */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xf1f1ef, 2.75));
  const key = new THREE.DirectionalLight(0xffffff, 0.28);
  key.position.set(-3, 5, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -4,
    right: 4,
    top: 4,
    bottom: -4,
    near: 1,
    far: 25,
  });
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 8;
  key.shadow.camera.updateProjectionMatrix();
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.12);
  fill.position.set(4, -2, 5);
  scene.add(fill);

  /* groups + materials */
  const shelfGroup = new THREE.Group();
  const shelfSlot = new THREE.Group();
  shelfGroup.add(shelfSlot);
  scene.add(shelfGroup);

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0xf7f7f5,
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    fog: true,
  });

  function buildFallbackShelf() {
    const g = new THREE.Group();
    const size = STYLE.shelfSize,
      t = 0.045,
      d = 0.9;
    for (let i = 0; i <= GRID; i++) {
      const p = -size / 2 + (i * size) / GRID;
      const hz = new THREE.Mesh(
        new THREE.BoxGeometry(size, t, d),
        shelfMaterial,
      );
      hz.position.y = p;
      const vt = new THREE.Mesh(
        new THREE.BoxGeometry(t, size, d),
        shelfMaterial,
      );
      vt.position.x = p;
      g.add(hz, vt);
    }
    g.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = true;
      }
    });
    return g;
  }

  /* cases */
  const textureLoader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const CASE_DEPTH = 0.09,
    SPINE_W = 0.07,
    COVER_MARGIN = 0.025;
  const COVER_W = 1 - SPINE_W - COVER_MARGIN;
  const COVER_H = 0.95;
  const COVER_X = (SPINE_W - COVER_MARGIN) / 2;

  const bodyGeometry = new THREE.BoxGeometry(1, 1, CASE_DEPTH);
  const coverGeometry = new THREE.PlaneGeometry(COVER_W, COVER_H);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b1b1b,
    roughness: 0.5,
    metalness: 0.08,
    fog: false,
  });

  function fitCover(texture, targetAspect) {
    const imgAspect = texture.image.width / texture.image.height;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    if (imgAspect > targetAspect) {
      texture.repeat.x = targetAspect / imgAspect;
      texture.offset.x = (1 - texture.repeat.x) / 2;
    } else {
      texture.repeat.y = imgAspect / targetAspect;
      texture.offset.y = (1 - texture.repeat.y) / 2;
    }
  }

  const cases = [];
  CASES.forEach((data, index) => {
    const coverMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      fog: false,
    });
    textureLoader.load(encodeURI(data.img), (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = maxAniso;
      fitCover(texture, COVER_W / COVER_H);
      coverMaterial.map = texture;
      coverMaterial.needsUpdate = true;
    });

    const root = new THREE.Group();
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    const cover = new THREE.Mesh(coverGeometry, coverMaterial);
    cover.position.set(COVER_X, 0, CASE_DEPTH / 2 + 0.001);
    root.add(body, cover);

    root.userData = {
      isCase: true,
      index,
      number: String(index + 1).padStart(2, "0"),
      col: data.col,
      row: data.row,
      title: data.title,
      caseData: data,
      cover: coverMaterial,
      dim: 0,
      phase: index * 0.5,
      hover: 0,
      baseScale: 1,
      home: new THREE.Vector3(),
    };
    root.visible = false;
    shelfGroup.add(root);
    cases.push(root);
  });

  let layoutDone = false;

  function layoutCases(model) {
    // measure with a clean transform
    shelfGroup.rotation.set(0, 0, 0);
    shelfGroup.position.set(0, 0, 0);
    shelfGroup.scale.set(1, 1, 1);
    shelfGroup.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());

    let grid = null;
    if (model.isGroup && model.children.length) {
      try {
        grid = detectCells(renderer, model, box);
      } catch (err) {
        console.warn("Cubby detection failed:", err);
      }
    }
    const detected = !!grid;
    if (!grid) grid = insetGrid(box);

    const sizes = grid
      .flat()
      .map((c) => Math.min(c.w, c.h, Math.sqrt(c.area)))
      .sort((a, b) => a - b);
    const common = sizes[Math.floor(sizes.length / 2)];
    const midZ = (box.min.z + box.max.z) / 2;

    cases.forEach((mesh) => {
      const u = mesh.userData;
      const cell = grid[u.row][u.col];
      const own = Math.min(cell.w, cell.h, Math.sqrt(cell.area));
      const s = Math.min(common, own) * STYLE.caseSize;
      const zc = detected ? findCellDepth(model, cell, box) : null;
      u.home.set(cell.x, cell.y, (zc ?? midZ) + STYLE.caseZOffset);
      u.baseScale = s;
      mesh.position.copy(u.home);
      mesh.scale.setScalar(s);
      mesh.rotation.set(0, 0, 0);
      mesh.visible = true;
    });

    // display scale applied once to shelf + cases together.
    // Position (lift + intro rise + breathing) is owned by the loop.
    const S = 1.03;
    shelfGroup.scale.set(S, S, 1);
    shelfDims.w = size.x * S;
    shelfDims.h = size.y * S;
    shelfDims.d = size.z;
    fitCamera();

    layoutDone = true;
  }

  /* load GLB */
  new GLTFLoader().load(
    encodeURI(SHELF_MODEL),
    (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      let box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.scale.setScalar(STYLE.shelfSize / Math.max(size.x, size.y));
      box = new THREE.Box3().setFromObject(model);
      model.position.sub(box.getCenter(new THREE.Vector3()));
      model.traverse((o) => {
        if (!o.isMesh) return;
        o.material = shelfMaterial;
        o.castShadow = false;
        o.receiveShadow = true;
        if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      });
      shelfSlot.clear();
      shelfSlot.add(model);
      layoutCases(model);
    },
    undefined,
    () => {
      if (disposed) return;
      console.warn("Shelf GLB could not be loaded. Using fallback shelf.");
      const fb = buildFallbackShelf();
      shelfSlot.add(fb);
      layoutCases(fb);
    },
  );

  /* pointer / resize */
  const mouse = new THREE.Vector2();
  const smoothMouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const pointerPx = { x: 0, y: 0 };
  let hovered = null;
  let pointerOnStage = false;

  const toNDC = (clientX, clientY) => {
    const r = stage.getBoundingClientRect();
    const inside =
      clientX >= r.left &&
      clientX <= r.right &&
      clientY >= r.top &&
      clientY <= r.bottom;
    return {
      inside,
      x: ((clientX - r.left) / r.width) * 2 - 1,
      y: -((clientY - r.top) / r.height) * 2 + 1,
    };
  };

  const pick = (clientX, clientY) => {
    if (!layoutDone) return null;
    const p = toNDC(clientX, clientY);
    if (!p.inside) return null;
    raycaster.setFromCamera(new THREE.Vector2(p.x, p.y), camera);
    const hits = raycaster.intersectObjects(cases, true);
    if (!hits.length) return null;
    let o = hits[0].object;
    while (o && !o.userData.isCase) o = o.parent;
    return o || null;
  };

  const onMove = (e) => {
    const r = stage.getBoundingClientRect();
    const p = toNDC(e.clientX, e.clientY);
    pointerOnStage = p.inside;
    mouse.set(p.x, p.y);
    pointerPx.x = e.clientX - r.left;
    pointerPx.y = e.clientY - r.top;
  };

  const onClick = (e) => {
    if (e.target.closest?.("a, button, [data-no-pick]")) return;
    const hit = pick(e.clientX, e.clientY); // fresh pick, works on touch too
    const data = hit?.userData.caseData;
    if (data) onCaseClick?.(data);
  };

  const onResize = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    fitCamera();
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("click", onClick);
  window.addEventListener("resize", onResize);
  onResize();

  /* loop */
  const clock = new THREE.Clock();
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let introT0 = null;
  let shownTitle = "";
  const labelPos = { x: 0, y: 0 };

  const buildLabel = (u) => {
    const chars = [...u.title]
      .map(
        (c) =>
          `<span data-ch class="inline-block">${c === " " ? "&nbsp;" : c}</span>`,
      )
      .join("");

    label.innerHTML =
      `<span class="text-[8px] opacity-60">(${u.number})</span>` +
      `<span class="inline-flex overflow-hidden">${chars}</span>`;

    if (reduceMotion) return;

    label.querySelectorAll("[data-ch]").forEach((el, i) => {
      el.animate(
        [{ transform: "translateY(110%)" }, { transform: "translateY(0)" }],
        {
          duration: 600,
          delay: i * 22,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          fill: "both",
        },
      );
    });
  };

  renderer.setAnimationLoop(() => {
    const time = clock.getElapsedTime();
    smoothMouse.lerp(mouse, 0.05);
    const ts = reduceMotion ? 0 : 1;

    if (layoutDone && introT0 === null) introT0 = time;
    const since = introT0 === null ? 0 : time - introT0;
    const intro = easeOutCubic(clamp01(since / 1.4));

    /* shelf: rise + fade in, then breathe and tilt with the mouse */
    shelfMaterial.opacity = 0.92 * intro;
    const breathe = Math.sin(time * 0.6) * 0.012 * ts;
    shelfGroup.position.set(
      0,
      STYLE.liftY - (1 - intro) * 0.6 + breathe,
      -0.08,
    );
    shelfGroup.rotation.y = ease(
      shelfGroup.rotation.y,
      smoothMouse.x * 0.075 * ts,
      0.06,
    );
    shelfGroup.rotation.x = ease(
      shelfGroup.rotation.x,
      -smoothMouse.y * 0.055 * ts,
      0.06,
    );
    shelfGroup.rotation.z = 0;

    /* hover */
    hovered = null;
    if (layoutDone && pointerOnStage) {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(cases, true);
      if (hits.length) {
        let o = hits[0].object;
        while (o && !o.userData.isCase) o = o.parent;
        hovered = o || null;
      }
    }
    document.body.style.cursor = hovered ? "pointer" : "default";

    /* label follows the cursor */
    if (label) {
      if (hovered && hovered.userData.title !== shownTitle) {
        shownTitle = hovered.userData.title;
        buildLabel(hovered.userData);
      }
      label.dataset.on = hovered ? "1" : "0";

      const flip = pointerPx.x > stage.clientWidth - 240;
      const tx = pointerPx.x + (flip ? -label.offsetWidth - 18 : 18);
      const ty = pointerPx.y + 18;
      labelPos.x = reduceMotion ? tx : ease(labelPos.x, tx, 0.14);
      labelPos.y = reduceMotion ? ty : ease(labelPos.y, ty, 0.14);
      label.style.transform = `translate3d(${labelPos.x}px, ${labelPos.y}px, 0)`;
    }

    /* cases: staggered pop-in, hover lift, dim the others */
    cases.forEach((mesh) => {
      const u = mesh.userData;
      const isHot = mesh === hovered;
      u.hover = ease(u.hover, isHot ? 1 : 0, 0.12);
      u.dim = ease(u.dim, hovered && !isHot ? 1 : 0, 0.1);
      u.cover.color.setScalar(1 - u.dim * 0.45);

      const p = clamp01((since - 0.45 - u.index * 0.13) / 0.8);
      const pop = easeOutBack(p);
      const float = Math.sin(time * 1.1 + u.phase) * 0.006 * ts;

      mesh.position.set(
        u.home.x,
        u.home.y + float - (1 - p) * 0.25,
        u.home.z + u.hover * 0.16,
      );
      mesh.rotation.set(
        -smoothMouse.y * 0.05 * u.hover * ts,
        u.hover * 0.04 + smoothMouse.x * 0.08 * u.hover * ts,
        0,
      );
      mesh.scale.setScalar(
        Math.max(0.0001, u.baseScale * pop * (1 + u.hover * 0.07)),
      );
    });

    renderer.render(scene, camera);
  });

  /* cleanup */
  return () => {
    disposed = true;
    renderer.setAnimationLoop(null);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("click", onClick);
    window.removeEventListener("resize", onResize);
    document.body.style.cursor = "default";
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const m = o.material;
      if (m)
        (Array.isArray(m) ? m : [m]).forEach((x) => {
          x.map?.dispose();
          x.dispose();
        });
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}
