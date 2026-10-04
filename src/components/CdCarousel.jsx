import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { sfx } from "../lib/audio.js";

// Remix Icon: `npm i remixicon`, then once in your entry file:
// import "remixicon/fonts/remixicon.css";

const SX = [-6.91, -4.07, -1.24, 1.63, 4.51, 7.31];
const SY = -0.25;
const DISCS = [1, 2, 3, 4, 5, 6].map((n) => `/assets/images/cd/disc-${n}.jpg`);

function ctex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"));
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
}

export default function CdCarousel({ className = "" }) {
  const mount = useRef(null);
  const api = useRef(null); // { goTo(i) } set by the scene
  const target = useRef(0); // slot the carriage is heading to
  const [slot, setSlot] = useState(0); // slot the carriage has arrived at

  const goTo = useCallback((i) => {
    const next = Math.min(SX.length - 1, Math.max(0, i));
    if (next === target.current) return;
    target.current = next;
    api.current?.goTo(next);
  }, []);

  useEffect(() => {
    const el = mount.current;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Build with r128-style colours so it looks like the client's version
    const prevCM = THREE.ColorManagement.enabled;
    THREE.ColorManagement.enabled = false;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    // intensities x PI = same brightness as the old (r128) lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, 0.9 * Math.PI));
    const sun = new THREE.DirectionalLight(0xffffff, 0.85 * Math.PI);
    sun.position.set(-6, 10, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -14,
      right: 14,
      top: 10,
      bottom: -10,
      near: 1,
      far: 40,
    });
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // // frosted plate with six round pockets
    // const shape = new THREE.Shape();
    // shape.moveTo(-10.21, -2.35);
    // shape.lineTo(10.21, -2.35);
    // shape.lineTo(10.21, 2.35);
    // shape.lineTo(-10.21, 2.35);
    // shape.closePath();
    // SX.forEach((x) => {
    //   const p = new THREE.Path();
    //   p.absarc(x, SY, 1.38, 0, Math.PI * 2, true);
    //   shape.holes.push(p);
    // });
    // const plate = new THREE.Mesh(
    //   new THREE.ExtrudeGeometry(shape, {
    //     depth: 0.3,
    //     bevelEnabled: false,
    //     curveSegments: 64,
    //   }),
    //   new THREE.MeshStandardMaterial({
    //     color: 0xe9eef4,
    //     roughness: 0.3,
    //     metalness: 0.05,
    //   }),
    // );
    // plate.position.z = -0.3;
    // plate.castShadow = plate.receiveShadow = true;
    // scene.add(plate);

    // const floor = new THREE.Mesh(
    //   new THREE.PlaneGeometry(20.42, 4.7),
    //   new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.6 }),
    // );
    // floor.position.z = -0.3;
    // floor.receiveShadow = true;
    // scene.add(floor);

    // // discs resting in the pockets
    // const loader = new THREE.TextureLoader();
    // SX.forEach((x, i) => {
    //   const mat = new THREE.MeshStandardMaterial({
    //     map: loader.load(DISCS[i]),
    //     roughness: 0.35,
    //     metalness: 0.2,
    //   });
    //   const d = new THREE.Mesh(new THREE.CircleGeometry(1.3, 64), mat);
    //   d.position.set(x, SY, -0.12);
    //   d.receiveShadow = true;
    //   scene.add(d);
    // });
        // blue rectangular plate behind the discs, with six round pockets
    const shape = new THREE.Shape();
    shape.moveTo(-10.21, -2.35);
    shape.lineTo(10.21, -2.35);
    shape.lineTo(10.21, 2.35);
    shape.lineTo(-10.21, 2.35);
    shape.closePath();
    SX.forEach((x) => {
      const p = new THREE.Path();
      p.absarc(x, SY, 1.4, 0, Math.PI * 2, true);
      shape.holes.push(p);
    });
    const plate = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.3,
        bevelEnabled: false,
        curveSegments: 64,
      }),
      new THREE.MeshBasicMaterial({ color: 0xb4cbe6 }), // solid light blue, unaffected by lighting
    );
    plate.position.z = -0.3;
    scene.add(plate);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20.42, 4.7),
      new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.6 }),
    );
    floor.position.z = -0.3;
    floor.receiveShadow = true;
    scene.add(floor);

    // dark channel connecting the pockets + round end notches
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x14161a });
    const chL = SX[0] - 1.75;
    const chR = SX[SX.length - 1] + 1.75;
    const channel = new THREE.Mesh(
      new THREE.PlaneGeometry(chR - chL, 0.7),
      darkMat,
    );
    channel.position.set((chL + chR) / 2, SY - 0.3, 0.01);
    scene.add(channel);
    [chL, chR].forEach((x) => {
      const notch = new THREE.Mesh(new THREE.CircleGeometry(0.6, 48), darkMat);
      notch.position.set(x, SY - 0.2, 0.01);
      scene.add(notch);
    });

    // discs resting in the pockets
    const loader = new THREE.TextureLoader();
    SX.forEach((x, i) => {
      const mat = new THREE.MeshStandardMaterial({
        map: loader.load(DISCS[i]),
        roughness: 0.35,
        metalness: 0.2,
      });
      const d = new THREE.Mesh(new THREE.CircleGeometry(1.3, 64), mat);
      d.position.set(x, SY, 0.03);
      d.receiveShadow = true;
      scene.add(d);
    });

    // ribbed lid
    const lidTex = ctex(1810, 170, (g) => {
      for (let i = 0; i < 22; i++) {
        const y = (i * 170) / 22;
        const gr = g.createLinearGradient(0, y, 0, y + 170 / 22);
        gr.addColorStop(0, "#b4c0cc");
        gr.addColorStop(0.7, "#7f8c99");
        gr.addColorStop(1, "#3f4850");
        g.fillStyle = gr;
        g.fillRect(0, y, 1810, 170 / 22);
      }
      g.fillStyle = "#222";
      g.fillRect(905, 0, 3, 170);
    });
    const side = new THREE.MeshStandardMaterial({
      color: 0x66727e,
      roughness: 0.5,
      metalness: 0.4,
    });
    const lid = new THREE.Mesh(new THREE.BoxGeometry(18.1, 1.7, 0.8), [
      side,
      side,
      side,
      side,
      new THREE.MeshStandardMaterial({
        map: lidTex,
        roughness: 0.45,
        metalness: 0.3,
      }),
      side,
    ]);
    lid.position.set(0.21, 3.53, 0.3);
    lid.castShadow = true;
    scene.add(lid);

    // control strip with LED display
    const led = document.createElement("canvas");
    led.width = 1810;
    led.height = 105;
    const lg = led.getContext("2d");
    const ledTex = new THREE.CanvasTexture(led);
    const DX = [175, 475, 760, 1047, 1335, 1620];
    const drawLED = (i) => {
      lg.shadowBlur = 0;
      lg.fillStyle = "#0b0b0d";
      lg.fillRect(0, 0, 1810, 105);

      // indicator dots
      DX.forEach((x, k) => {
        lg.shadowColor = "#ff3b2a";
        lg.shadowBlur = k === i ? 18 : 4;
        lg.fillStyle = k === i ? "#ff5540" : "#7a1f19";
        lg.beginPath();
        lg.arc(x, 27, k === i ? 7 : 4, 0, 7);
        lg.fill();
      });

      // LED text
      lg.shadowColor = "#ff3b2a";
      lg.shadowBlur = 10;
      lg.fillStyle = "#dd3f31ef";
      lg.fontWeight = 300;
      lg.font = "300 30px pixel";
      lg.textBaseline = "alphabetic";

      // left: project count (zero-padded)
      lg.textAlign = "left";
      lg.fillText("02 PROJECTS", 85, 80);

      // center: tagline
      lg.textAlign = "center";
      lg.fillText("WEB DESIGN & DEVELOPMENT", 905, 80);

      // right: CD + slot number
      lg.textAlign = "left";
      lg.fillText("CD 1", 1500, 80);
      lg.fillText(String(i + 1), 1715, 80);

      ledTex.needsUpdate = true;
    };
    drawLED(0);
    const blk = new THREE.MeshStandardMaterial({
      color: 0x0b0b0d,
      roughness: 0.4,
    });
    const strip = new THREE.Mesh(new THREE.BoxGeometry(18.1, 1.05, 0.8), [
      blk,
      blk,
      blk,
      blk,
      new THREE.MeshBasicMaterial({ map: ledTex }),
      blk,
    ]);
    strip.position.set(0.21, 2.155, 0.3);
    strip.castShadow = true;
    scene.add(strip);

    // carriage
    const car = new THREE.Group();
    car.position.set(SX[0], SY, 0.4);
    scene.add(car);
    const bs = new THREE.Shape();
    bs.moveTo(-1.4, -0.25);
    bs.lineTo(1.4, -0.25);
    bs.lineTo(1.4, 1.83);
    bs.lineTo(-1.4, 1.83);
    bs.lineTo(-1.4, 1.83);
    bs.closePath();
    const bracket = new THREE.Mesh(
      new THREE.ExtrudeGeometry(bs, { depth: 0.3, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({
        color: 0x929ba4,
        metalness: 0.6,
        roughness: 0.35,
      }),
    );
    bracket.castShadow = true;
    car.add(bracket);
    const cradle = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.4, 64, 1, Math.PI, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0xf2931e }),
    );
    cradle.position.z = 0.31;
    car.add(cradle);
    const chrome = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 64),
      new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 0.3,
        map: ctex(256, 256, (g) => {
          const cg = g.createConicGradient(0, 128, 128);
          [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1].forEach((p, i) =>
            cg.addColorStop(p, i % 2 ? "#4a4f55" : "#e8ecef"),
          );
          g.fillStyle = cg;
          g.beginPath();
          g.arc(128, 128, 128, 0, 7);
          g.fill();
          g.fillStyle = "#14161a";
          g.beginPath();
          g.arc(128, 128, 30, 0, 7);
          g.fill();
        }),
      }),
    );
    chrome.position.z = 0.33;
    chrome.castShadow = true;
    car.add(chrome);

    THREE.ColorManagement.enabled = prevCM; // restore for the rest of the site

    // GSAP: glide to the chosen slot, then bob + spin on arrival.
    // Calling goTo again mid-glide simply redirects the carriage.
    api.current = {
      goTo(i) {
        gsap.killTweensOf(car.position);
        gsap.killTweensOf(chrome.rotation);
        car.position.z = 0.4;
        const dist = Math.abs(car.position.x - SX[i]) / 2.84;
        const tl = gsap.timeline({ timeScale: reduced ? 100 : 1 });
        tl.to(car.position, {
          x: SX[i],
          duration: 0.55 + 0.3 * dist,
          ease: "power3.inOut",
        })
          .call(() => {
            drawLED(i);
            setSlot(i);
            sfx.step();
          })
          .to(car.position, {
            z: 0.65,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
          })
          .to(
            chrome.rotation,
            { z: "-=6.283", duration: 0.8, ease: "power1.inOut" },
            "<",
          );
      },
    };

    // camera: fixed, straight-on (no sway, no pointer parallax, no tilt)
    const look = new THREE.Vector3(0, 1, 0);
    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      const t = Math.tan(THREE.MathUtils.degToRad(15));
      renderer.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      const dist = Math.max(3.5 / t, 11.6 / (t * cam.aspect)) * 1.05;
      cam.position.set(look.x, look.y, dist);
      cam.lookAt(look);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // don't render while scrolled out of view
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(el);

    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible) renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      gsap.killTweensOf(car.position);
      gsap.killTweensOf(chrome.rotation);
      api.current = null;
      io.disconnect();
      ro.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        const mats = Array.isArray(o.material)
          ? o.material
          : o.material
            ? [o.material]
            : [];
        mats.forEach((mt) => {
          mt.map?.dispose();
          mt.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const btn =
    "group cursor-pointer pointer-events-auto grid h-10 w-10 place-items-center  text-3xl " +
    "transition duration-300 ease-in-out hover:scale-105 hover:bg-white-600 hover:text-white" +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className={`relative ${className}`}>
      <div ref={mount} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous disc"
            className={btn}
            disabled={slot === 0 && target.current === 0}
            onClick={() => goTo(target.current - 1)}
          >
            <svg
              className="h-8 w-8 fill-current text-black group-hover:text-white transition-colors duration-300"
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M36.7188 38.7203V11.2297L12.8422 25L36.7188 38.7203Z"
                fill="black"
              />
            </svg>
          </button>

          <div className="flex gap-2">
            <i class="ri-circle-fill"></i>
            {/* {SX.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to disc ${i + 1}`}
                aria-current={i === slot}
                onClick={() => goTo(i)}
                className="pointer-events-auto flex h-6 items-center"
              >
                <span
                  className={`h-1 w-6 rounded-full transition-all duration-500 md:w-9 ${
                    i === slot ? "scale-y-150 bg-accent" : "bg-black/15"
                  }`}
                />
              </button>
            ))} */}
          </div>

          <button
            type="button"
            aria-label="Next disc"
            className={btn}
            disabled={
              slot === SX.length - 1 && target.current === SX.length - 1
            }
            onClick={() => goTo(target.current + 1)}
          >
            <svg
              className="h-8 w-8  fill-current text-black group-hover:text-white transition-colors duration-300"
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.2812 38.7203V11.2297L37.1578 25L13.2812 38.7203Z"
                fill="black"
              />
            </svg>
          </button>
        </div>
        {/* <p className="font-pixel text-lg uppercase tracking-[0.15em]">
          CD 1 · Track {slot + 1}
        </p> */}
      </div>
    </div>
  );
}
