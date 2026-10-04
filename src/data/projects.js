const JV = "Jai Valentine Nkrumah";
const SN = "Syed Naqvi";
const SS = "Sam Sarkar";
const W = "/assets/WORK/";

const raw = [
  ["2025", "02 Projects", "Web Design/ Development & 3D Animation", `${JV}, ${SN}`, ""],
  ["2025", "Our Bad Habit", "Web Development", `${JV}, ${SN}`, ""],
  ["2025", "Pamoja Art Ltd", "Web Design/ Development", `${JV}, ${SN}`, W + "PAMOJA/a2182a4a-35d1-456a-b009-1b66a01fae57.JPG"],
  ["2025", "Angella Choe", "Web Design/ Development", `${JV}, ${SN}`, ""],
  ["2025", "OAMC Peacemaker", "Web Development", `${JV}, ${SN}`, ""],
  ["2024", "Cecilia Energy", "Web Development", `${JV}, ${SN}`, ""],
  ["2024", "Amaterasu.ai", "Web Development", `${JV}, ${SN}`, ""],
  ["2024", "Avancio", "Web Development", `${JV}, ${SN}`, ""],
  ["2024", "Terra", "Web Development", `${JV}, ${SN}`, ""],
  ["2024", "Research & Development", "Motion Design / 3D", "Emanuele Cuttecchia, Mirko Peliccia, Damilare Ezekiel", W + "RESEARCH & DEVELOPMENT/MOTION DESIGN/Victoria Secret R&D.jpg"],
  ["2024", "Xapobank", "Web Development", `${JV}, ${SN}`, ""],
  ["2024", "Roadsitalia", "Motion Design / 3D", "Emanuele Cuttecchia", W + "ROADSITALIA/447886442_1091492041938491_5665907610853114572_n.jpg"],
  ["2024", "Dauan Jacari", "Fashion / Graphic Design", JV, W + "DAUAN JACARI/SaveVid.Net_438532837_1910971906028111_5762718908957984664_n.jpg"],
  ["2024", "Heavn-One", "Web Development", `${JV}, ${SS}`, ""],
  ["2024", "Oligaluku", "Product Design / Graphic Design / 3D", `Shalewa & ${JV}`, W + "OLIGALUKU/IMG_4890.jpg"],
  ["2024", "Tower Mobility", "Web Development", `${JV}, ${SS}`, ""],
  ["2024", "Nelsnegatives", "Web Development", `${JV}, ${SS}`, ""],
  ["2023 - 2024", "YSL", "Motion Design / Graphic Design", JV, W + "YSL/YSL 1.jpg"],
  ["2023", "Archi Site Mobius", "Web Development", `${JV}, ${SN}`, ""],
  ["2023", "Divine Eau de Milano", "Fashion / Product Design", `Shalewa & ${JV}`, W + "Divine Eau de Milano/Divine Eau de Milano 3.jpg"],
  ["2023", "Holy Gallery", "Web Development", `${JV}, ${SS}`, W + "HOLY GALLERY/HOME PAGE 360 promo.png"],
  ["2023", "God / Pray Tee", "Fashion / Product Design", JV, W + "GOD - PRAY TEE/GOPR1314.png"],
  ["2021 - 2023", "Forward (FWD)", "Fine Art / Graphic Design", JV, ""],
  ["2022", "Persepolis - Getty Museum", "Web Development", `${JV}, ${SN}`, W + "GETTY MUSEUM _ PERSEPOLIS/Screenshot 2025-03-06 142458.png"],
  ["2022", "RuruRu Onsen", "Web Development", `${JV}, ${SN}`, W + "RURURU ONSEN/Screenshot 2025-03-07 044736.png"],
  ["2021", "Flowers for Society", "Web Development", `${JV}, ${SN}`, W + "FLOWERS FOR SOCIETY/Screenshot 2025-03-06 135035.png"],
  ["2021", "Ruinart x Unconventional Gallery", "Web Development", `${JV}, ${SN}`, ""],
  ["2021", "“Nike By You” Customizer", "Web Development", `${SN}, ${JV}`, ""],
  ["2020", "Adidas - Chile20", "Web Development", `${SN}, ${JV}`, W + "ADIDAS CHILE20 _ PROGRAMMING/Screenshot 2025-01-14 132556.png"],
  ["2020", "Weedensenteret", "Web Development", `${SN}, ${JV}`, ""],
  ["2020", "Citizen: Light Is Time", "Web Development", `${SN}, ${JV}`, W + "CITIZEN _ LIGHT IS TIME/Screenshot 2025-03-07 045004.png"],
];

export const projects = raw.map(([year, title, category, team, image], i) => ({
  year, title, category, team, image,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  hue: (i * 47 + 90) % 360,
  seed: i,
}));