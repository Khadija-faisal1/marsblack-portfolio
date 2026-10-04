import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { linkBase, linkIdle } from "../lib/linkStyles.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "remixicon/fonts/remixicon.css";
import CdCarousel from "../components/CdCarousel.jsx";
gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  "Web Development",
  "Motion Design",
  "UX/UI Design",
  "GFX Design",
  "Content",
];

const L = "block w-full text-left";
const R = "block w-full text-right";
const U = "underline decoration-2 underline-offset-[0.1em]";

const aboutL = "block w-4/5 max-w-full pb-0.5 text-left";
const aboutR = "block w-4/5 max-w-full pb-0.5 text-right";

const footLink = `${linkBase} ${linkIdle}`;

const handleFooterSectionClick = (e, sectionId) => {
  e.preventDefault();

  const hash = `#${sectionId}`;

  window.history.pushState(null, "", `/${hash}`);

  requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};
// function ProjectsSection() {
//   const root = useRef(null);

//   useLayoutEffect(() => {
//     const ctx = gsap.context(() => {
//       const sc = (trigger, options = {}) => ({
//         trigger,
//         start: "top bottom",
//         end: "bottom top",
//         scrub: 1,
//         ...options,
//       });

//       /* --------------------------------
//          SCROLL PROGRESS
//       -------------------------------- */

//       gsap.to(".projects-bar", {
//         width: "100%",
//         ease: "none",
//         scrollTrigger: {
//           scrub: 0.3,
//           start: "top top",
//           end: "bottom bottom",
//         },
//       });

//       /* --------------------------------
//          CAPTION REVEALS
//       -------------------------------- */

//       gsap.utils.toArray(".project-cap").forEach((cap) => {
//         gsap.from(cap.querySelectorAll(".project-rise"), {
//           yPercent: 110,
//           stagger: 0.12,
//           duration: 1,
//           ease: "power4.out",
//           scrollTrigger: {
//             trigger: cap,
//             start: "top 90%",
//           },
//         });

//         const small = cap.querySelector(".project-small");

//         if (small) {
//           gsap.from(small, {
//             opacity: 0,
//             x: -20,
//             duration: 1,
//             scrollTrigger: {
//               trigger: cap,
//               start: "top 90%",
//             },
//           });
//         }
//       });

//       /* --------------------------------
//          01 — HERO PARALLAX
//       -------------------------------- */

//       gsap.fromTo(
//         ".project-s1 .project-img",
//         {
//           scale: 1.35,
//         },
//         {
//           scale: 1,
//           duration: 2.2,
//           ease: "power3.out",
//         },
//       );

//       gsap.to(".project-s1 .project-img", {
//         yPercent: 12,
//         ease: "none",
//         scrollTrigger: sc(".project-s1", {
//           start: "top top",
//         }),
//       });

//       /* --------------------------------
//          02 — CIRCULAR REVEAL
//       -------------------------------- */

//       gsap.fromTo(
//         ".project-s2 .project-mask",
//         {
//           clipPath: "circle(8% at 50% 50%)",
//         },
//         {
//           clipPath: "circle(75% at 50% 50%)",
//           ease: "none",
//           scrollTrigger: {
//             trigger: ".project-s2",
//             start: "top 90%",
//             end: "top 10%",
//             scrub: 1,
//           },
//         },
//       );

//       gsap.fromTo(
//         ".project-s2 .project-img",
//         {
//           scale: 1.5,
//         },
//         {
//           scale: 1,
//           ease: "none",
//           scrollTrigger: {
//             trigger: ".project-s2",
//             start: "top 90%",
//             end: "bottom top",
//             scrub: 1,
//           },
//         },
//       );

//       /* --------------------------------
//          03 — PINNED CARD
//       -------------------------------- */

//       const cardTimeline = gsap.timeline({
//         scrollTrigger: {
//           trigger: ".project-s3",
//           start: "top top",
//           end: "+=130%",
//           scrub: 1,
//           pin: true,
//         },
//       });

//       cardTimeline
//         .fromTo(
//           ".project-card",
//           {
//             width: "30vw",
//             height: "40vh",
//           },
//           {
//             width: "100vw",
//             height: "100vh",
//             ease: "power2.inOut",
//           },
//         )
//         .fromTo(
//           ".project-card .project-img",
//           {
//             scale: 1.6,
//           },
//           {
//             scale: 1,
//             ease: "none",
//           },
//           0,
//         )
//         .to(
//           ".project-explore",
//           {
//             opacity: 0,
//           },
//           0.2,
//         );

//       /* --------------------------------
//          04 — SPLIT SLIDE
//       -------------------------------- */

//       const slide = {
//         trigger: ".project-s4",
//         start: "top bottom",
//         end: "top 30%",
//         scrub: 1,
//       };

//       gsap.from(".project-c1", {
//         xPercent: -100,
//         ease: "none",
//         scrollTrigger: slide,
//       });

//       gsap.from(".project-c2", {
//         xPercent: 100,
//         ease: "none",
//         scrollTrigger: slide,
//       });

//       gsap.fromTo(
//         ".project-c1 .project-img",
//         {
//           yPercent: 8,
//         },
//         {
//           yPercent: -8,
//           ease: "none",
//           scrollTrigger: sc(".project-s4"),
//         },
//       );

//       gsap.fromTo(
//         ".project-c2 .project-img",
//         {
//           yPercent: -8,
//         },
//         {
//           yPercent: 8,
//           ease: "none",
//           scrollTrigger: sc(".project-s4"),
//         },
//       );

//       /* --------------------------------
//          05 — WIPE + LETTERS
//       -------------------------------- */

//       gsap.fromTo(
//         ".project-s5 .project-wrap",
//         {
//           clipPath: "inset(30% 12% 0 12%)",
//         },
//         {
//           clipPath: "inset(0% 0% 0 0%)",
//           ease: "none",
//           scrollTrigger: {
//             trigger: ".project-s5",
//             start: "top 90%",
//             end: "top 20%",
//             scrub: 1,
//           },
//         },
//       );

//       gsap.fromTo(
//         ".project-s5 .project-img",
//         {
//           scale: 1.3,
//         },
//         {
//           scale: 1,
//           ease: "none",
//           scrollTrigger: sc(".project-s5"),
//         },
//       );

//       gsap.from(".project-word span", {
//         yPercent: 110,
//         rotate: 10,
//         opacity: 0,
//         stagger: 0.07,
//         duration: 1,
//         ease: "back.out(1.6)",
//         scrollTrigger: {
//           trigger: ".project-s5",
//           start: "top 50%",
//         },
//       });

//       /* --------------------------------
//          HOVER IMAGE TILT
//       -------------------------------- */

//       const columns = gsap.utils.toArray(".project-col");

//       columns.forEach((column) => {
//         const image = column.querySelector(".project-img");

//         if (!image) return;

//         const moveImage = (event) => {
//           const rect = column.getBoundingClientRect();

//           gsap.to(image, {
//             x: (event.clientX - rect.left - rect.width / 2) * 0.04,
//             scale: 1.05,
//             duration: 0.6,
//             overwrite: true,
//           });
//         };

//         const resetImage = () => {
//           gsap.to(image, {
//             x: 0,
//             scale: 1,
//             duration: 0.6,
//             overwrite: true,
//           });
//         };

//         column.addEventListener("mousemove", moveImage);
//         column.addEventListener("mouseleave", resetImage);

//         column._moveImage = moveImage;
//         column._resetImage = resetImage;
//       });

//       ScrollTrigger.refresh();

//       return () => {
//         columns.forEach((column) => {
//           column.removeEventListener("mousemove", column._moveImage);

//           column.removeEventListener("mouseleave", column._resetImage);
//         });
//       };
//     }, root);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <section
//       ref={root}
//       id="projects-section"
//       className="relative w-full overflow-hidden bg-black text-white"
//     >
//       {/* Scroll progress */}
//       <div className="projects-bar fixed left-0 top-0 z-[99] h-[3px] w-0 bg-white" />

//       {/* --------------------------------
//           01 — CAMPFIRE
//       -------------------------------- */}

//       <section className="project-s1 relative h-screen overflow-hidden">
//         <img
//           className="project-img absolute inset-x-0 -inset-y-[12%] h-[124%] w-full object-cover will-change-transform"
//           src="/assets/images/projects/img1.png"
//           alt=""
//         />

//         <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/60" />

//         <div className="project-cap absolute bottom-[8%] left-7 z-10">
//           <small className="project-small mb-2.5 block text-xs tracking-[.25em] opacity-80">
//             01 — CAMPFIRE
//           </small>

//           <h2 className="text-[clamp(30px,7vw,96px)] font-semibold leading-none">
//             <span className="block overflow-hidden">
//               <span className="project-rise inline-block">Campfire</span>
//             </span>

//             <span className="block overflow-hidden">
//               <span className="project-rise inline-block">Stories</span>
//             </span>
//           </h2>
//         </div>
//       </section>

//       {/* --------------------------------
//           02 — BLOOM
//       -------------------------------- */}

//       <section className="project-s2 relative h-screen overflow-hidden">
//         <div className="project-mask absolute inset-0">
//           <img
//             className="project-img absolute inset-x-0 -inset-y-[12%] h-[124%] w-full object-cover will-change-transform"
//             src="/assets/images/projects/img2.png"
//             alt=""
//           />
//         </div>

//         <div className="project-cap absolute bottom-[8%] left-7 z-10">
//           <small className="project-small mb-2.5 block text-xs tracking-[.25em] opacity-80">
//             02 — BLOOM
//           </small>

//           <h2 className="text-[clamp(30px,7vw,96px)] font-semibold leading-none">
//             <span className="block overflow-hidden">
//               <span className="project-rise inline-block">Blue</span>
//             </span>

//             <span className="block overflow-hidden">
//               <span className="project-rise inline-block">Bloom</span>
//             </span>
//           </h2>
//         </div>
//       </section>

//       {/* --------------------------------
//           03 — FULLSCREEN CARD
//       -------------------------------- */}

//       <section className="project-s3 relative grid h-screen place-items-center overflow-hidden bg-[#1a0306]">
//         <div className="project-card relative h-[40vh] w-[30vw] overflow-hidden">
//           <img
//             className="project-img absolute inset-0 h-full w-full object-cover"
//             src="/assets/images/projects/img3.png"
//             alt=""
//           />
//         </div>

//         <div className="project-explore absolute inset-x-0 bottom-[6%] z-10 text-center text-[11px] tracking-[.3em]">
//           SCROLL TO EXPLORE
//           <i className="mx-auto mt-3 block h-[50px] w-px origin-top animate-line bg-white" />
//         </div>
//       </section>

//       {/* --------------------------------
//           04 — SPLIT LOOKBOOK
//       -------------------------------- */}

//       <section className="project-s4 grid h-screen grid-cols-2 gap-[3px] overflow-hidden">
//         <div className="project-col project-c1 relative cursor-pointer overflow-hidden">
//           <img
//             className="project-img absolute inset-x-0 -inset-y-[12%] h-[124%] w-full object-cover will-change-transform"
//             src="/assets/images/projects/img4.png"
//             alt=""
//           />

//           <div className="project-cap absolute bottom-[8%] left-7 z-10">
//             <small className="project-small mb-2.5 block text-xs tracking-[.25em] opacity-80">
//               04 — LOOKBOOK
//             </small>

//             <h2 className="text-[clamp(30px,7vw,96px)] font-semibold leading-none">
//               <span className="block overflow-hidden">
//                 <span className="project-rise inline-block">Street</span>
//               </span>
//             </h2>
//           </div>
//         </div>

//         <div className="project-col project-c2 relative cursor-pointer overflow-hidden">
//           <img
//             className="project-img absolute inset-x-0 -inset-y-[12%] h-[124%] w-full object-cover will-change-transform"
//             src="/assets/images/projects/img5.png"
//             alt=""
//           />

//           <div className="project-cap absolute bottom-[8%] left-7 z-10">
//             <small className="project-small mb-2.5 block text-xs tracking-[.25em] opacity-80">
//               05 — PEACEMAKER
//             </small>

//             <h2 className="text-[clamp(30px,7vw,96px)] font-semibold leading-none">
//               <span className="block overflow-hidden">
//                 <span className="project-rise inline-block">Peace</span>
//               </span>
//             </h2>
//           </div>
//         </div>
//       </section>

//       {/* --------------------------------
//           05 — VERMILLION
//       -------------------------------- */}

//       <section className="project-s5 relative h-screen overflow-hidden">
//         <div className="project-wrap absolute inset-0">
//           <img
//             className="project-img absolute inset-x-0 -inset-y-[12%] h-[124%] w-full object-cover will-change-transform"
//             src="/assets/images/projects/img6.png"
//             alt=""
//           />
//         </div>

//         {/* <div className="project-word absolute inset-0 z-10 flex items-end justify-center font-serif text-[clamp(60px,17vw,260px)] leading-[.9] text-red-600">
//           {"VERMILLION".split("").map((letter, index) => (
//             <span key={`${letter}-${index}`} className="inline-block">
//               {letter}
//             </span>
//           ))}
//         </div> */}
//       </section>
//     </section>
//   );
// }

// ----------------
function ProjectsSection() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sc = (trigger, options = {}) => ({
        trigger,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        ...options,
      });

      /* --------------------------------
         SCROLL PROGRESS
      -------------------------------- */

      gsap.to(".projects-bar", {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          scrub: 0.3,
          start: "top top",
          end: "bottom bottom",
        },
      });

      /* --------------------------------
         CAPTION REVEALS
      -------------------------------- */

      gsap.utils.toArray(".project-cap").forEach((cap) => {
        gsap.from(cap.querySelectorAll(".project-rise"), {
          yPercent: 110,
          stagger: 0.12,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: cap,
            start: "top 90%",
          },
        });

        const small = cap.querySelector(".project-small");

        if (small) {
          gsap.from(small, {
            opacity: 0,
            x: -20,
            duration: 1,
            scrollTrigger: {
              trigger: cap,
              start: "top 90%",
            },
          });
        }
      });

      /* --------------------------------
         01 — HERO PARALLAX
      -------------------------------- */

      gsap.fromTo(
        ".project-s1 .project-img",
        {
          scale: 1.25,
        },
        {
          scale: 1,
          duration: 2,
          ease: "power3.out",
        },
      );

      gsap.to(".project-s1 .project-img", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: sc(".project-s1", {
          start: "top top",
        }),
      });

      /* --------------------------------
         02 — CIRCULAR REVEAL
      -------------------------------- */

      gsap.fromTo(
        ".project-s2 .project-mask",
        {
          clipPath: "circle(8% at 50% 50%)",
        },
        {
          clipPath: "circle(75% at 50% 50%)",
          ease: "none",
          scrollTrigger: {
            trigger: ".project-s2",
            start: "top 90%",
            end: "top 10%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".project-s2 .project-img",
        {
          scale: 1.35,
        },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".project-s2",
            start: "top 90%",
            end: "bottom top",
            scrub: 1,
          },
        },
      );

      /* --------------------------------
         03 — RESPONSIVE PINNED CARD
      -------------------------------- */

      const mm = gsap.matchMedia();

      mm.add(
        {
          mobile: "(max-width: 767px)",
          tablet: "(min-width: 768px) and (max-width: 1023px)",
          desktop: "(min-width: 1024px)",
        },
        (context) => {
          const { mobile, tablet, desktop } = context.conditions;

          let startWidth;
          let startHeight;
          let endWidth;
          let endHeight;
          let pinDistance;

          if (mobile) {
            startWidth = "72vw";
            startHeight = "48svh";
            endWidth = "100vw";
            endHeight = "72svh";
            pinDistance = "+=80%";
          } else if (tablet) {
            startWidth = "48vw";
            startHeight = "52svh";
            endWidth = "100vw";
            endHeight = "82svh";
            pinDistance = "+=105%";
          } else {
            startWidth = "30vw";
            startHeight = "40vh";
            endWidth = "100vw";
            endHeight = "100vh";
            pinDistance = "+=130%";
          }

          const cardTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: ".project-s3",
              start: "top top",
              end: pinDistance,
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
            },
          });

          cardTimeline
            .fromTo(
              ".project-card",
              {
                width: startWidth,
                height: startHeight,
              },
              {
                width: endWidth,
                height: endHeight,
                ease: "power2.inOut",
              },
            )
            .fromTo(
              ".project-card .project-img",
              {
                scale: 1.5,
              },
              {
                scale: 1,
                ease: "none",
              },
              0,
            )
            .to(
              ".project-explore",
              {
                opacity: 0,
              },
              0.2,
            );

          return () => {
            cardTimeline.kill();
          };
        },
      );

      /* --------------------------------
         04 — SPLIT LOOKBOOK
      -------------------------------- */

      const slide = {
        trigger: ".project-s4",
        start: "top bottom",
        end: "top 30%",
        scrub: 1,
      };

      gsap.from(".project-c1", {
        xPercent: -100,
        ease: "none",
        scrollTrigger: slide,
      });

      gsap.from(".project-c2", {
        xPercent: 100,
        ease: "none",
        scrollTrigger: slide,
      });

      gsap.fromTo(
        ".project-c1 .project-img",
        {
          yPercent: 8,
        },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: sc(".project-s4"),
        },
      );

      gsap.fromTo(
        ".project-c2 .project-img",
        {
          yPercent: -8,
        },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: sc(".project-s4"),
        },
      );

      /* --------------------------------
         05 — WIPE
      -------------------------------- */

      gsap.fromTo(
        ".project-s5 .project-wrap",
        {
          clipPath: "inset(20% 8% 0 8%)",
        },
        {
          clipPath: "inset(0% 0% 0 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: ".project-s5",
            start: "top 90%",
            end: "top 20%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".project-s5 .project-img",
        {
          scale: 1.25,
        },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: sc(".project-s5"),
        },
      );

      /* --------------------------------
         HOVER IMAGE TILT
         Desktop ONLY
      -------------------------------- */

      const columns = gsap.utils.toArray(".project-col");

      const enableHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;

      if (enableHover) {
        columns.forEach((column) => {
          const image = column.querySelector(".project-img");

          if (!image) return;

          const moveImage = (event) => {
            const rect = column.getBoundingClientRect();

            gsap.to(image, {
              x: (event.clientX - rect.left - rect.width / 2) * 0.035,
              scale: 1.05,
              duration: 0.6,
              overwrite: true,
            });
          };

          const resetImage = () => {
            gsap.to(image, {
              x: 0,
              scale: 1,
              duration: 0.6,
              overwrite: true,
            });
          };

          column.addEventListener("mousemove", moveImage);
          column.addEventListener("mouseleave", resetImage);

          column._moveImage = moveImage;
          column._resetImage = resetImage;
        });
      }

      ScrollTrigger.refresh();

      return () => {
        columns.forEach((column) => {
          if (column._moveImage) {
            column.removeEventListener("mousemove", column._moveImage);
          }

          if (column._resetImage) {
            column.removeEventListener("mouseleave", column._resetImage);
          }
        });

        mm.revert();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="projects-section"
      className="
        relative w-full
        overflow-hidden
        bg-black text-white
      "
    >
      {/* SCROLL PROGRESS */}
      <div
        className="
          projects-bar
          fixed left-0 top-0
          z-[99]
          h-[2px]
          w-0
          bg-white
        "
      />

      {/* =================================
          01 — CAMPFIRE
      ================================= */}

      <section
        className="
          project-s1
          relative
          h-[58svh]
          min-h-[390px]
          overflow-hidden

          sm:h-[62svh]

          md:h-[70svh]

          lg:h-screen
        "
      >
        <img
          className="
            project-img
            absolute
            inset-x-0
            -inset-y-[10%]
            h-[120%]
            w-full
            object-cover
            will-change-transform
          "
          src="/assets/images/projects/img1.png"
          alt=""
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-transparent
            via-transparent
            to-black/70
          "
        />

        <div
          className="
            project-cap
            absolute
            bottom-[7%]
            left-5
            z-10

            sm:left-6

            md:left-7

            lg:bottom-[8%]
          "
        >
          <small
            className="
              project-small
              mb-2
              block
              text-[9px]
              tracking-[.22em]
              opacity-80

              sm:text-[10px]

              md:text-xs
            "
          >
            01 — CAMPFIRE
          </small>

          <h2
            className="
              text-[clamp(32px,10vw,96px)]
              font-semibold
              leading-[.9]
            "
          >
            <span className="block overflow-hidden">
              <span className="project-rise inline-block">Campfire</span>
            </span>

            <span className="block overflow-hidden">
              <span className="project-rise inline-block">Stories</span>
            </span>
          </h2>
        </div>
      </section>

      {/* =================================
          02 — BLOOM
      ================================= */}

      <section
        className="
          project-s2
          relative
          h-[58svh]
          min-h-[390px]
          overflow-hidden

          sm:h-[62svh]

          md:h-[70svh]

          lg:h-screen
        "
      >
        <div className="project-mask absolute inset-0">
          <img
            className="
              project-img
              absolute
              inset-x-0
              -inset-y-[10%]
              h-[120%]
              w-full
              object-cover
              will-change-transform
            "
            src="/assets/images/projects/img2.png"
            alt=""
          />
        </div>

        <div
          className="
            project-cap
            absolute
            bottom-[7%]
            left-5
            z-10

            sm:left-6

            md:left-7
          "
        >
          <small
            className="
              project-small
              mb-2
              block
              text-[9px]
              tracking-[.22em]
              opacity-80

              sm:text-[10px]

              md:text-xs
            "
          >
            02 — BLOOM
          </small>

          <h2
            className="
              text-[clamp(32px,10vw,96px)]
              font-semibold
              leading-[.9]
            "
          >
            <span className="block overflow-hidden">
              <span className="project-rise inline-block">Blue</span>
            </span>

            <span className="block overflow-hidden">
              <span className="project-rise inline-block">Bloom</span>
            </span>
          </h2>
        </div>
      </section>

      {/* =================================
          03 — FULLSCREEN CARD
      ================================= */}

      <section
        className="
          project-s3
          relative
          grid
          h-[68svh]
          min-h-[450px]
          place-items-center
          overflow-hidden
          bg-[#1a0306]

          md:h-[75svh]

          lg:h-screen
        "
      >
        <div
          className="
            project-card
            relative
            h-[48svh]
            w-[72vw]
            overflow-hidden

            sm:w-[62vw]

            md:h-[52svh]
            md:w-[48vw]

            lg:h-[40vh]
            lg:w-[30vw]
          "
        >
          <img
            className="
              project-img
              absolute
              inset-0
              h-full
              w-full
              object-cover
              will-change-transform
            "
            src="/assets/images/projects/img3.png"
            alt=""
          />
        </div>

        <div
          className="
            project-explore
            absolute
            inset-x-0
            bottom-[5%]
            z-10
            text-center
            text-[9px]
            tracking-[.25em]

            sm:text-[10px]

            md:text-[11px]
          "
        >
          SCROLL TO EXPLORE
          <i
            className="
              mx-auto
              mt-3
              block
              h-[38px]
              w-px
              origin-top
              animate-line
              bg-white

              md:h-[50px]
            "
          />
        </div>
      </section>

      {/* =================================
          04 — LOOKBOOK
      ================================= */}

      <section
        className="
          project-s4
          grid
          grid-cols-1
          gap-[2px]
          overflow-hidden

          md:grid-cols-2
          md:h-[72svh]

          lg:h-screen
        "
      >
        {/* STREET */}

        <div
          className="
            project-col
            project-c1
            relative
            h-[48svh]
            min-h-[360px]
            cursor-pointer
            overflow-hidden

            md:h-full
          "
        >
          <img
            className="
              project-img
              absolute
              inset-x-0
              -inset-y-[10%]
              h-[120%]
              w-full
              object-cover
              will-change-transform
            "
            src="/assets/images/projects/img4.png"
            alt=""
          />

          <div
            className="
              absolute inset-0
              bg-gradient-to-b
              from-transparent
              to-black/60
            "
          />

          <div
            className="
              project-cap
              absolute
              bottom-[7%]
              left-5
              z-10

              md:left-7
            "
          >
            <small
              className="
                project-small
                mb-2
                block
                text-[9px]
                tracking-[.22em]
                opacity-80

                md:text-xs
              "
            >
              04 — LOOKBOOK
            </small>

            <h2
              className="
                text-[clamp(34px,9vw,96px)]
                font-semibold
                leading-[.9]
              "
            >
              <span className="block overflow-hidden">
                <span className="project-rise inline-block">Street</span>
              </span>
            </h2>
          </div>
        </div>

        {/* PEACEMAKER */}

        <div
          className="
            project-col
            project-c2
            relative
            h-[48svh]
            min-h-[360px]
            cursor-pointer
            overflow-hidden

            md:h-full
          "
        >
          <img
            className="
              project-img
              absolute
              inset-x-0
              -inset-y-[10%]
              h-[120%]
              w-full
              object-cover
              will-change-transform
            "
            src="/assets/images/projects/img5.png"
            alt=""
          />

          <div
            className="
              absolute inset-0
              bg-gradient-to-b
              from-transparent
              to-black/60
            "
          />

          <div
            className="
              project-cap
              absolute
              bottom-[7%]
              left-5
              z-10

              md:left-7
            "
          >
            <small
              className="
                project-small
                mb-2
                block
                text-[9px]
                tracking-[.22em]
                opacity-80

                md:text-xs
              "
            >
              05 — PEACEMAKER
            </small>

            <h2
              className="
                text-[clamp(34px,9vw,96px)]
                font-semibold
                leading-[.9]
              "
            >
              <span className="block overflow-hidden">
                <span className="project-rise inline-block">Peace</span>
              </span>
            </h2>
          </div>
        </div>
      </section>

      {/* =================================
          05 — VERMILLION
      ================================= */}

      <section
        className="
          project-s5
          relative
          h-[58svh]
          min-h-[390px]
          overflow-hidden

          sm:h-[62svh]

          md:h-[70svh]

          lg:h-screen
        "
      >
        <div className="project-wrap absolute inset-0">
          <img
            className="
              project-img
              absolute
              inset-x-0
              -inset-y-[10%]
              h-[120%]
              w-full
              object-cover
              will-change-transform
            "
            src="/assets/images/projects/img6.png"
            alt=""
          />
        </div>
      </section>
    </section>
  );
}
export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      {/* HERO */}
      <section
        id="hero-section"
        className="flex h-[36vh] min-h-[30vh] w-screen flex-col items-center justify-start overflow-hidden
                   md:mt-0 md:h-[calc(100vh-max(56px,4vw))]"
      >
        <h1
          className="z-[2] mt-8 mb-4 font-orbitron text-[14vw] font-thin lowercase tracking-[0.02em]
                     md:mt-0 md:text-[11vw] lg:text-[8vw] lg:-mt-[2vw]"
        >
          marsblack
        </h1>
        <div className="relative -mt-[19%] h-[40vh] min-h-[260px] w-full md:-mt-[1vw] md:h-[55vh] lg:-mt-[5vw] lg:h-[620px] lg:w-[94%]">
          <Suspense
            fallback={
              <img
                src="/assets/images/hero-image.jpg"
                alt=""
                className="h-full w-full object-contain"
              />
            }
          >
            <CdCarousel className="h-full w-full" />
          </Suspense>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about-section"
        className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden
                   bg-black px-[5%] py-12 text-white
                   md:px-[6%] md:py-14 lg:min-h-screen lg:px-[8%] lg:py-[60px]"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2
                     items-center justify-center md:w-[85%] lg:w-[80%]"
        >
          <img
            src="/assets/MB LOGO/halftone-bg removed logo.svg"
            alt=""
            className="h-full w-full object-cover opacity-15 invert"
          />
        </div>

        <h1
          className="relative z-[1] mx-auto flex w-full max-w-[1000px] flex-col items-center justify-center
                     font-pixel text-[clamp(35px,3.4vw,52px)] font-medium uppercase leading-[1.1]
                     tracking-[0.06em] sm:tracking-[0.1em]"
        >
          <span className={aboutR}>
            MARSBLACK IS A <span className={U}>CREATIVE AGENCY</span>{" "}
            SPECIALIZING IN
          </span>
          <span className={aboutL}>
            INTERACTIVE <span className={U}>WEB DEVELOPMENT</span>
            <span className={U}> BRANDING AND MOTION.</span>
          </span>
          <span className={aboutR}>
            WE CRAFT <span className={U}>INNOVATIVE DIGITAL EXPERIENCES</span>
          </span>
          <span className={aboutL}>
            BY COMBINING{" "}
            <span className={U}>CREATIVITY WITH CUTTING-EDGE TECHNOLOGY</span>
          </span>
        </h1>
      </section>

      {/* SERVICES */}
      <section
        id="services-section"
        className="w-full bg-white pt-3 text-black"
      >
        <h4
          className="px-[8vw] pb-3 text-xs font-medium uppercase
                     md:px-[6vw] md:pb-[22px] md:text-lg lg:px-[4.5vw] lg:pt-[0.4vw]"
        >
          Our Services
        </h4>

        <ul className="w-full list-none border-t border-black">
          {SERVICES.map((s, i) => (
            <li
              key={s}
              className="relative z-[1] grid h-[60px] cursor-pointer grid-cols-[8vw_1fr_auto] items-center overflow-hidden
                         border-b border-black pr-[5vw] transition-colors duration-300 hover:text-white
                         before:absolute before:bottom-0 before:left-0 before:z-[-1] before:h-0 before:w-full
                         before:bg-black before:transition-[height] before:duration-300 before:content-[''] hover:before:h-full
                         md:h-[clamp(60px,10vw,90px)] md:grid-cols-[6vw_1fr_auto] md:pr-[6vw]
                         lg:h-[clamp(64px,9vw,110px)] lg:grid-cols-[4.5vw_1fr_auto] lg:pr-[8vw]
                         motion-reduce:transition-none motion-reduce:before:transition-none"
            >
              <span className="size-[5px] justify-self-center rounded-full bg-current"></span>
              <h2
                className="pl-[2vw] font-pixel text-[5vw] font-medium uppercase leading-none tracking-[0.08em]
                           md:pl-[1.5vw] md:text-[clamp(12px,4vw,44px)]"
              >
                {s}
              </h2>
              <span
                className="font-pixel text-[5vw] font-medium uppercase leading-none tracking-[0.1em]
                           md:text-[clamp(20px,3vw,44px)]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* PROJECTS / CASE STUDIES */}
      <ProjectsSection />

      {/* TALK */}
      <section
        id="talk-section"
        className="relative w-full overflow-hidden bg-black px-[5%] py-10 text-white
                   md:min-h-[90vh] md:px-[6%] md:py-[60px] lg:min-h-screen lg:px-[8%]"
      >
        <h6
          className="mb-[22px] text-lg font-normal uppercase md:mb-8
                     lg:absolute lg:left-[16%] lg:top-[60px] lg:mb-0"
        >
          Disruptive Design
        </h6>

        <p
          className="mx-auto flex w-full max-w-[900px] py-12 flex-col font-pixel text-[6vw] uppercase leading-[1.7] tracking-[0.05em]
                     md:text-[clamp(12px,9.8vw,48px)] md:leading-[0.9] md:tracking-[0.08em]"
        >
          <span className={R}>MARSBLACK DISRUPTS</span>
          <span className={R}>TRADITIONAL DESIGN BY</span>
          <span className={L}>GIVING IT EMOTION, DEPTH, AND</span>
          <span className={L}>CULTURAL POWER.</span>
          <span className={R}>WE TAKE DESIGN TO A NEW PLACE</span>
          <span className={R}>IN A CULTURE OF NOISE</span>
          <span className={L}>
            BY CRAFTING{" "}
            <span className={`${U} whitespace-pre-wrap`}>RESONANCE.</span>
          </span>
          <span className={L}>
            <span className={`${U} whitespace-pre-wrap`}>
              WE CREATE EXPERIENCES
            </span>
            <span className="animate-blink no-underline motion-reduce:animate-none ">
              _
            </span>
          </span>
        </p>

        <div className="relative mt-0 flex h-[40vh] items-center justify-center md:mt-[5vh] md:h-[50vh] lg:mt-[6vh] lg:h-[55vh]">
          <img
            src="/assets/images/MarsBlack_Bars_1__1-removebg-preview.png"
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-full w-auto max-w-[90%]
                       -translate-x-1/2 -translate-y-1/2 object-contain opacity-95 md:max-w-[120%]"
          />
          <a
            href="#contact"
            className="relative z-[1] whitespace-nowrap font-pixel text-[clamp(32px,11vw,60px)] uppercase tracking-[0.08em]
                       text-white transition-[letter-spacing,text-shadow] duration-500
                       hover:tracking-[0.14em] hover:[text-shadow:0_0_18px_rgba(255,255,255,0.5)]
                       md:text-[clamp(40px,9vw,130px)] motion-reduce:transition-none"
          >
            LETS-TALK
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="footer-section"
        className="relative h-[30vh] min-h-0 w-full overflow-hidden bg-accent text-black
                   md:h-[45vh] md:min-h-[340px] lg:min-h-[420px]"
      >
        <nav className="relative z-[2] flex flex-wrap justify-center gap-2 px-3 pt-[22px] md:gap-3 md:px-0">
          <Link to="/" className={footLink}>
            Slider
          </Link>
          <Link to="/index" className={footLink}>
            Index
          </Link>
          <Link to="/cases" className={footLink}>
            Cases
          </Link>
          <a
            href="/#about-section"
            onClick={(e) => handleFooterSectionClick(e, "about-section")}
            className={footLink}
          >
            About
          </a>
          <a
            href="/#services-section"
            onClick={(e) => handleFooterSectionClick(e, "services-section")}
            className={footLink}
          >
            Services
          </a>
          <a
            href="/#talk-section"
            onClick={(e) => handleFooterSectionClick(e, "talk-section")}
            className={footLink}
          >
            Contact
          </a>
        </nav>

        <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-full w-[90%] -translate-x-1/2 md:w-[70%] lg:w-[55%]">
          <img
            src="/assets/images/mb-halftone-logo.png"
            alt=""
            className="h-full w-full object-contain opacity-[0.68]"
          />
        </div>

        <h1
          className="absolute bottom-[2%] left-1/2 z-[1] -translate-x-1/2 select-none whitespace-nowrap font-orbitron
                     text-[15vw] font-thin lowercase leading-[0.8] tracking-[0.01em] text-black"
        >
          marsblack
        </h1>
      </footer>
    </>
  );
}
