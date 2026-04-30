import { useState, useEffect, useRef } from "react";

// ── STREAMING DATA ───────────────────────────────────────────────────
const STREAMERS = [
  { name: "Netflix", color: "#E50914", url: "https://netflix.com", signup: "https://netflix.com/signup", monthly: "$15.49" },
  { name: "Prime Video", color: "#00A8E1", url: "https://primevideo.com", signup: "https://amazon.com/prime", monthly: "$8.99" },
  { name: "Apple TV+", color: "#1a1a1a", url: "https://tv.apple.com", signup: "https://tv.apple.com", monthly: "$9.99" },
  { name: "Max", color: "#002BE7", url: "https://max.com", signup: "https://max.com/subscribe", monthly: "$9.99" },
  { name: "Hulu", color: "#1CE783", url: "https://hulu.com", signup: "https://hulu.com/welcome", monthly: "$7.99" },
  { name: "Disney+", color: "#113CCF", url: "https://disneyplus.com", signup: "https://disneyplus.com/welcome", monthly: "$7.99" },
  { name: "Peacock", color: "#0047AB", url: "https://peacocktv.com", signup: "https://peacocktv.com/plan-picker", monthly: "$5.99" },
];

const MOODS = [
  { label: "Belly Laughs", emoji: "😂", genre: "comedy", tint: "#FFE066", desc: "Comedies that actually deliver" },
  { label: "Ugly Cry", emoji: "😭", genre: "drama", tint: "#A8C7FA", desc: "Dramas that hit hard" },
  { label: "On Edge", emoji: "🔪", genre: "thriller", tint: "#FF6B6B", desc: "Thrillers, chills, suspense" },
  { label: "Warm & Fuzzy", emoji: "🌸", genre: "romance", tint: "#FFB5C5", desc: "Romance, comfort, heart" },
  { label: "Big Ideas", emoji: "🌌", genre: "scifi", tint: "#B794F4", desc: "Sci-fi & mind-benders" },
  { label: "Adrenaline", emoji: "⚡", genre: "action", tint: "#FF8C42", desc: "Action, heists, set pieces" },
  { label: "True Stuff", emoji: "📰", genre: "documentary", tint: "#7DD3C0", desc: "Documentaries worth your time" },
  { label: "Kids Are Up", emoji: "🧸", genre: "family", tint: "#FCD34D", desc: "Family picks that don't suck" },
];

// ── MOCK DATABASE ────────────────────────────────────────────────────
// Curated real titles with real TMDB poster URLs (these are public CDN images,
// no key needed). Each title has genres, cast (shared across titles so the
// "actor's other work" flow actually works), similar titles, etc.

const POSTER = "https://image.tmdb.org/t/p/w500";
const BG = "https://image.tmdb.org/t/p/original";

// Actors — central so the same actor can appear across multiple titles.
const ACTORS = {
  1: { id: 1, name: "Jeremy Allen White", profile_path: "/yDHfPAoUiuYPY6bBnCWiPF7eEgL.jpg", known_for_department: "Acting", place_of_birth: "Brooklyn, New York, USA" },
  2: { id: 2, name: "Ayo Edebiri", profile_path: "/ihp3qqWBpNgcd9YGbb2z8Y5HVHO.jpg", known_for_department: "Acting", place_of_birth: "Boston, Massachusetts, USA" },
  3: { id: 3, name: "Pedro Pascal", profile_path: "/g7qKrVNmHxS4kV5kqjg7W4d6ybT.jpg", known_for_department: "Acting", place_of_birth: "Santiago, Chile" },
  4: { id: 4, name: "Bella Ramsey", profile_path: "/okAhpyI0hAvYTvG8AiLLUM4lzT.jpg", known_for_department: "Acting", place_of_birth: "Nottingham, England, UK" },
  5: { id: 5, name: "Zendaya", profile_path: "/3nCTOpZLTA7WnJUzTcyHy3cBJJE.jpg", known_for_department: "Acting", place_of_birth: "Oakland, California, USA" },
  6: { id: 6, name: "Timothée Chalamet", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg", known_for_department: "Acting", place_of_birth: "New York City, New York, USA" },
  7: { id: 7, name: "Adam Driver", profile_path: "/wZFeTLtnvTAn7c6ZDaKpCoNOL4F.jpg", known_for_department: "Acting", place_of_birth: "San Diego, California, USA" },
  8: { id: 8, name: "Florence Pugh", profile_path: "/1bgvI8pQ0YnTt1W0YMvzdh17WiW.jpg", known_for_department: "Acting", place_of_birth: "Oxford, England, UK" },
  9: { id: 9, name: "Cillian Murphy", profile_path: "/llkbyWKwpfowZ6C8peBjIV9jj99.jpg", known_for_department: "Acting", place_of_birth: "Douglas, Cork, Ireland" },
  10: { id: 10, name: "Emily Blunt", profile_path: "/5nCSG5TL1bP0geDAFGdKqbypvMK.jpg", known_for_department: "Acting", place_of_birth: "London, England, UK" },
  11: { id: 11, name: "Matthew Macfadyen", profile_path: "/9YjqasMVltHVXtfpSk5HI3pmhOT.jpg", known_for_department: "Acting", place_of_birth: "Great Yarmouth, England, UK" },
  12: { id: 12, name: "Sarah Snook", profile_path: "/fvjLLRD7xN5chbQV8UnDQiFDJAA.jpg", known_for_department: "Acting", place_of_birth: "Adelaide, South Australia, Australia" },
  13: { id: 13, name: "Kieran Culkin", profile_path: "/vWHkVkD0hG1pPeDvMhbT3DcnSqp.jpg", known_for_department: "Acting", place_of_birth: "New York City, New York, USA" },
  14: { id: 14, name: "Brian Cox", profile_path: "/wXpwyZBjcRbqLGMj3y7pJ9yEG0e.jpg", known_for_department: "Acting", place_of_birth: "Dundee, Scotland, UK" },
  15: { id: 15, name: "Anya Taylor-Joy", profile_path: "/7mzz1dXNpqcw9lRO2kOXPWU4tbU.jpg", known_for_department: "Acting", place_of_birth: "Miami, Florida, USA" },
  16: { id: 16, name: "Jenna Ortega", profile_path: "/kpqw3mhX0n4iuPvDmkvBpS6izR.jpg", known_for_department: "Acting", place_of_birth: "Coachella Valley, California, USA" },
  17: { id: 17, name: "Millie Bobby Brown", profile_path: "/pJmXfmA2OEzmxsuQqnK6d3wQCFY.jpg", known_for_department: "Acting", place_of_birth: "Marbella, Málaga, Spain" },
  18: { id: 18, name: "Aaron Pierre", profile_path: "/bzZLaCgPgECQW59O6wElWMFxTpB.jpg", known_for_department: "Acting", place_of_birth: "London, England, UK" },
};

// Genres mapped to mood keys
const GENRE_MAP = {
  comedy: ["comedy"],
  drama: ["drama"],
  thriller: ["thriller", "mystery", "crime"],
  romance: ["romance"],
  scifi: ["scifi", "fantasy"],
  action: ["action", "adventure"],
  documentary: ["documentary"],
  family: ["family", "animation"],
};

// Titles — the heart of the mock data
const TITLES = [
  {
    id: 101, title: "The Bear", name: "The Bear", media_type: "tv",
    first_air_date: "2022-06-23",
    vote_average: 8.6, popularity: 520,
    genres: ["drama", "comedy"],
    poster_path: "/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
    backdrop_path: "/v2FB5NmHNLiLRq4Yj04rG1MjrHA.jpg",
    overview: "A young chef from the fine dining world returns to Chicago to run his late brother's beloved Italian beef sandwich shop. As he fights to transform both the establishment and himself, he works alongside a rough-around-the-edges kitchen crew that ultimately reveals itself as his family.",
    runtime: 30,
    castIds: [1, 2],
    similarIds: [103, 108, 104, 115],
  },
  {
    id: 102, title: "The Last of Us", name: "The Last of Us", media_type: "tv",
    first_air_date: "2023-01-15",
    vote_average: 8.7, popularity: 480,
    genres: ["drama", "scifi", "action"],
    poster_path: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    backdrop_path: "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey.",
    runtime: 55,
    castIds: [3, 4],
    similarIds: [110, 106, 114, 107],
  },
  {
    id: 103, title: "Succession", name: "Succession", media_type: "tv",
    first_air_date: "2018-06-03",
    vote_average: 8.8, popularity: 310,
    genres: ["drama", "comedy"],
    poster_path: "/7HW47XbkNQ5fiwQFYGWdw9gs144.jpg",
    backdrop_path: "/1zSzjFU1fHFbLGWY6AYPLnDGq0z.jpg",
    overview: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
    runtime: 60,
    castIds: [11, 12, 13, 14],
    similarIds: [101, 108, 113, 115],
  },
  {
    id: 104, title: "Shōgun", name: "Shōgun", media_type: "tv",
    first_air_date: "2024-02-27",
    vote_average: 8.6, popularity: 420,
    genres: ["drama", "action", "adventure"],
    poster_path: "/7O4iVfOMQmdCSvhM2oHwRhE2b3g.jpg",
    backdrop_path: "/t6ONStaaDFxydrwlMe6AwX2hyL6.jpg",
    overview: "In Japan in the year 1600, at the dawn of a century-defining civil war, Lord Yoshii Toranaga is fighting for his life as his enemies on the Council of Regents unite against him, when a mysterious European ship is found marooned.",
    runtime: 55,
    castIds: [],
    similarIds: [103, 102, 108, 107],
  },
  {
    id: 105, title: "Dune: Part Two", name: "Dune: Part Two", media_type: "movie",
    release_date: "2024-02-27",
    vote_average: 8.2, popularity: 600,
    genres: ["scifi", "adventure", "action"],
    poster_path: "/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg",
    backdrop_path: "/87Bu2cMg0g9LCVjX0t0WIJACPSB.jpg",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    runtime: 166,
    castIds: [6, 8, 5, 7],
    similarIds: [102, 106, 114, 107],
  },
  {
    id: 106, title: "Oppenheimer", name: "Oppenheimer", media_type: "movie",
    release_date: "2023-07-19",
    vote_average: 8.1, popularity: 450,
    genres: ["drama"],
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II. A biographical thriller about a man who changed the world forever.",
    runtime: 181,
    castIds: [9, 10, 8],
    similarIds: [105, 103, 108, 114],
  },
  {
    id: 107, title: "Severance", name: "Severance", media_type: "tv",
    first_air_date: "2022-02-18",
    vote_average: 8.7, popularity: 380,
    genres: ["thriller", "scifi", "drama", "mystery"],
    poster_path: "/lFf6LLrQjYldcZItzOkGmMMigP7.jpg",
    backdrop_path: "/sSMHSdoGUPXXLrWHDhBL2YK8Zqf.jpg",
    overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
    runtime: 50,
    castIds: [],
    similarIds: [102, 103, 108, 115],
  },
  {
    id: 108, title: "Fleabag", name: "Fleabag", media_type: "tv",
    first_air_date: "2016-07-21",
    vote_average: 8.6, popularity: 220,
    genres: ["comedy", "drama"],
    poster_path: "/9f3n7ZnbcTTfFaluEv4f18b3y2a.jpg",
    backdrop_path: "/7OGdC9o5LrXnTabFaF6WYmxhGJ0.jpg",
    overview: "A dry-witted woman, known only as Fleabag, has no filter as she navigates life and love in London while trying to cope with tragedy.",
    runtime: 27,
    castIds: [],
    similarIds: [101, 103, 107, 113],
  },
  {
    id: 109, title: "Wednesday", name: "Wednesday", media_type: "tv",
    first_air_date: "2022-11-23",
    vote_average: 8.3, popularity: 540,
    genres: ["comedy", "fantasy", "mystery"],
    poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    backdrop_path: "/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    overview: "Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while making new friends — and foes — at Nevermore Academy.",
    runtime: 50,
    castIds: [16],
    similarIds: [117, 116, 112, 107],
  },
  {
    id: 110, title: "The Mandalorian", name: "The Mandalorian", media_type: "tv",
    first_air_date: "2019-11-12",
    vote_average: 8.4, popularity: 290,
    genres: ["scifi", "action", "adventure"],
    poster_path: "/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    backdrop_path: "/o7qi2v4uWQ8bZ1tW3KI0Ztn2epk.jpg",
    overview: "After the fall of the Empire, a lone gunfighter makes his way through the lawless galaxy, carrying a small, mysterious child — a bounty that turns into a family.",
    runtime: 40,
    castIds: [3],
    similarIds: [102, 105, 104, 114],
  },
  {
    id: 111, title: "Poor Things", name: "Poor Things", media_type: "movie",
    release_date: "2023-12-08",
    vote_average: 7.9, popularity: 280,
    genres: ["comedy", "drama", "scifi", "romance"],
    poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdrop_path: "/esTIxQVrZFH12FJhQLu6QS1SjwP.jpg",
    overview: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
    runtime: 141,
    castIds: [8],
    similarIds: [108, 115, 113, 103],
  },
  {
    id: 112, title: "The Queen's Gambit", name: "The Queen's Gambit", media_type: "tv",
    first_air_date: "2020-10-23",
    vote_average: 8.6, popularity: 260,
    genres: ["drama"],
    poster_path: "/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg",
    backdrop_path: "/34OGjFEbHj0E3lE2w0iTUVq0CBz.jpg",
    overview: "In a Kentucky orphanage in the 1950s, a young girl discovers an astonishing talent for chess while struggling with addiction.",
    runtime: 55,
    castIds: [15],
    similarIds: [112, 103, 106, 108],
  },
  {
    id: 113, title: "Anatomy of a Fall", name: "Anatomy of a Fall", media_type: "movie",
    release_date: "2023-08-23",
    vote_average: 7.8, popularity: 180,
    genres: ["thriller", "drama", "mystery"],
    poster_path: "/kQs6keheMwCxJxrzV83VUwFtHkB.jpg",
    backdrop_path: "/oIm5cwvkJyZCfsAzrT4TR7kx9oC.jpg",
    overview: "A woman is suspected of her husband's murder, and their blind son faces a moral dilemma as the main witness. A gripping courtroom drama that is really a slow excavation of a marriage.",
    runtime: 152,
    castIds: [],
    similarIds: [103, 107, 106, 111],
  },
  {
    id: 114, title: "Rebel Ridge", name: "Rebel Ridge", media_type: "movie",
    release_date: "2024-09-06",
    vote_average: 7.2, popularity: 340,
    genres: ["thriller", "action"],
    poster_path: "/hOPSFNlWIxnRx1gS7LyCgDAiCpu.jpg",
    backdrop_path: "/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg",
    overview: "A former Marine confronts corruption in a small town when local law enforcement unjustly seizes the bag of cash he needs for his cousin's bail.",
    runtime: 131,
    castIds: [18],
    similarIds: [102, 107, 113, 105],
  },
  {
    id: 115, title: "Hacks", name: "Hacks", media_type: "tv",
    first_air_date: "2021-05-13",
    vote_average: 8.2, popularity: 190,
    genres: ["comedy", "drama"],
    poster_path: "/aMB0Xr2yaEn5MiQdRfWqOeuctIo.jpg",
    backdrop_path: "/5PO9jvSyF9AMHWfkxT48UlnPCRY.jpg",
    overview: "A dark mentorship forms between a legendary Las Vegas stand-up comedian and an entitled young comedy writer. Sharp, layered, and genuinely funny.",
    runtime: 30,
    castIds: [],
    similarIds: [108, 101, 111, 103],
  },
  {
    id: 116, title: "Stranger Things", name: "Stranger Things", media_type: "tv",
    first_air_date: "2016-07-15",
    vote_average: 8.6, popularity: 410,
    genres: ["drama", "scifi", "fantasy", "mystery"],
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    runtime: 50,
    castIds: [17],
    similarIds: [109, 110, 102, 107],
  },
  {
    id: 117, title: "Beetlejuice Beetlejuice", name: "Beetlejuice Beetlejuice", media_type: "movie",
    release_date: "2024-09-06",
    vote_average: 7.0, popularity: 380,
    genres: ["comedy", "fantasy"],
    poster_path: "/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg",
    backdrop_path: "/1nU4T8jBdbDbyotrFDrCnFaGhjh.jpg",
    overview: "After a family tragedy brings the Deetzes home to Winter River, Lydia's teen daughter Astrid accidentally opens the door to the Afterlife — summoning a familiar mischievous ghost.",
    runtime: 105,
    castIds: [16],
    similarIds: [109, 111, 108, 115],
  },
  {
    id: 118, title: "Blue Eye Samurai", name: "Blue Eye Samurai", media_type: "tv",
    first_air_date: "2023-11-03",
    vote_average: 8.7, popularity: 210,
    genres: ["animation", "action", "drama"],
    poster_path: "/fdLORCrwDEFYwGJfPRVZIWzJLOz.jpg",
    backdrop_path: "/8Qy4S0MvhTXy2tPZBgDCqvKbLFQ.jpg",
    overview: "In Edo-period Japan, a young warrior of mixed-race origin embarks on a quest for revenge, disguising her identity as she faces violent enemies.",
    runtime: 55,
    castIds: [],
    similarIds: [104, 102, 110, 114],
  },
  {
    id: 119, title: "Paddington in Peru", name: "Paddington in Peru", media_type: "movie",
    release_date: "2024-11-08",
    vote_average: 7.3, popularity: 220,
    genres: ["family", "comedy", "adventure", "animation"],
    poster_path: "/kxFrIDhhM1q57CEQoSXX7rCu7eu.jpg",
    backdrop_path: "/bg6Em9cp3VrxPcW0e13dWMSOs7G.jpg",
    overview: "Paddington travels to Peru to visit his beloved Aunt Lucy, who now resides at the Home for Retired Bears. An adventure ensues when a mystery plunges them into an unexpected journey.",
    runtime: 106,
    castIds: [],
    similarIds: [117, 109, 115, 108],
  },
  {
    id: 120, title: "Formula 1: Drive to Survive", name: "Formula 1: Drive to Survive", media_type: "tv",
    first_air_date: "2019-03-08",
    vote_average: 8.5, popularity: 310,
    genres: ["documentary"],
    poster_path: "/jxTzXRfRM6JDHLnZqoJ3TQ4yJJb.jpg",
    backdrop_path: "/hBqjX6GY5zKWbCDPYqRcJ5jdIhY.jpg",
    overview: "Drivers, managers and team owners live life in the fast lane — both on and off the track — during one cutthroat season of Formula 1 racing.",
    runtime: 45,
    castIds: [],
    similarIds: [121, 103, 113, 106],
  },
  {
    id: 121, title: "Beckham", name: "Beckham", media_type: "tv",
    first_air_date: "2023-10-04",
    vote_average: 8.4, popularity: 170,
    genres: ["documentary"],
    poster_path: "/vQUIbsXvU4tOT8dPQoL6B2KHo7i.jpg",
    backdrop_path: "/ffdBU5fvZFJRFmnJEoLFQr3c3bt.jpg",
    overview: "A four-part documentary series following the life and career of David Beckham, from his working-class childhood to global superstardom.",
    runtime: 60,
    castIds: [],
    similarIds: [120, 113, 106, 103],
  },
  {
    id: 122, title: "Past Lives", name: "Past Lives", media_type: "movie",
    release_date: "2023-06-02",
    vote_average: 7.9, popularity: 200,
    genres: ["romance", "drama"],
    poster_path: "/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    backdrop_path: "/yCQQgIEXSTItCKyKNLhf6PVgYe9.jpg",
    overview: "Two deeply connected childhood friends are wrenched apart after Nora's family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week as they confront notions of love and destiny.",
    runtime: 105,
    castIds: [],
    similarIds: [108, 111, 113, 115],
  },
  {
    id: 123, title: "One Day", name: "One Day", media_type: "tv",
    first_air_date: "2024-02-08",
    vote_average: 8.3, popularity: 180,
    genres: ["romance", "drama"],
    poster_path: "/iQIZcNOmI37kNDOTQaOwdBE3eIy.jpg",
    backdrop_path: "/cAV3o0vRmHLK47zKcj4XbA7YcGG.jpg",
    overview: "After one day together — 15 July 1988, their university graduation — Emma and Dexter begin a friendship that will last a lifetime. The decades-spanning love story, told through that single date every year.",
    runtime: 30,
    castIds: [],
    similarIds: [122, 108, 111, 115],
  },
  {
    id: 124, title: "Everything Everywhere All at Once", name: "Everything Everywhere All at Once", media_type: "movie",
    release_date: "2022-03-25",
    vote_average: 8.0, popularity: 290,
    genres: ["scifi", "comedy", "action"],
    poster_path: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    backdrop_path: "/nGxUxi3PfXDRm7Vg95VBNgNM8yc.jpg",
    overview: "An aging Chinese immigrant is swept up in an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    runtime: 139,
    castIds: [],
    similarIds: [107, 111, 105, 117],
  },
];

// Build index for fast lookup and "actor's other work"
const TITLES_BY_ID = Object.fromEntries(TITLES.map(t => [t.id, t]));

// For each actor, find all titles they're in
const TITLES_BY_ACTOR = {};
for (const t of TITLES) {
  for (const aid of (t.castIds || [])) {
    if (!TITLES_BY_ACTOR[aid]) TITLES_BY_ACTOR[aid] = [];
    TITLES_BY_ACTOR[aid].push(t);
  }
}

// Padding: give each actor a few extra titles pulled from similar shows to
// make the filmography feel more populated even if hand-assigned castIds are short.
Object.keys(TITLES_BY_ACTOR).forEach(aid => {
  const current = TITLES_BY_ACTOR[aid];
  const currentIds = new Set(current.map(t => t.id));
  const extras = TITLES
    .filter(t => !currentIds.has(t.id))
    .sort(() => (parseInt(aid) % 7) - 3) // deterministic-ish shuffle by actor id
    .slice(0, 6 + (parseInt(aid) % 4));
  TITLES_BY_ACTOR[aid] = [...current, ...extras];
});

// ── MOCK API ─────────────────────────────────────────────────────────

async function api(operation, params = {}) {
  // Simulate network latency to make UX feel real
  await new Promise(r => setTimeout(r, 150 + Math.random() * 150));

  switch (operation) {
    case "trending":
      return [...TITLES].sort((a, b) => b.popularity - a.popularity).slice(0, 16);

    case "search": {
      const q = (params.query || "").toLowerCase().trim();
      if (!q) return [];
      // Match title substring, or cast member name
      const matchedActorIds = Object.values(ACTORS)
        .filter(a => a.name.toLowerCase().includes(q))
        .map(a => a.id);
      return TITLES.filter(t => {
        if (t.title.toLowerCase().includes(q)) return true;
        if ((t.castIds || []).some(id => matchedActorIds.includes(id))) return true;
        if ((t.overview || "").toLowerCase().includes(q)) return true;
        return false;
      }).slice(0, 18);
    }

    case "byGenre": {
      const genres = GENRE_MAP[params.genre] || [];
      return TITLES
        .filter(t => (t.genres || []).some(g => genres.includes(g)))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 15);
    }

    case "credits":
      return (TITLES_BY_ID[params.id]?.castIds || []).map(aid => {
        const actor = ACTORS[aid];
        const titleContext = TITLES_BY_ID[params.id];
        return {
          ...actor,
          character: "" // skipping fake characters to keep it clean
        };
      });

    case "similar": {
      const title = TITLES_BY_ID[params.id];
      if (!title) return [];
      return (title.similarIds || []).map(sid => TITLES_BY_ID[sid]).filter(Boolean);
    }

    case "actorCredits":
      return TITLES_BY_ACTOR[params.id] || [];

    case "person":
      return ACTORS[params.id] || null;

    case "titleDetails":
      return TITLES_BY_ID[params.id] || null;

    default:
      return null;
  }
}

function getStreamers(id) {
  const count = (id % 3) + 1;
  const start = id % STREAMERS.length;
  return Array.from({ length: count }, (_, i) => STREAMERS[(start + i) % STREAMERS.length]);
}

// ── AI EXTRACTION ────────────────────────────────────────────────────

async function extractTitle(input) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Extract the movie or TV show title from this text. It may be a URL, a social media caption, a voice transcript, or messy text. Return ONLY a JSON object with this shape: {"title": "the show name", "confidence": "high"|"medium"|"low", "reasoning": "brief why"}. If you can't find any title, return {"title": null, "confidence": "low", "reasoning": "why"}.\n\nInput: ${input}`
        }]
      })
    });
    const data = await r.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    // Fallback: dumb keyword match against our mock DB
    const q = input.toLowerCase();
    const found = TITLES.find(t => q.includes(t.title.toLowerCase()));
    if (found) return { title: found.title, confidence: "medium", reasoning: "keyword match" };
    return { title: null, confidence: "low", reasoning: "couldn't identify a title" };
  }
}

async function extractFromImage(base64Data, mediaType) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
            { type: "text", text: `Look at this screenshot. It might show a TikTok, Instagram post, text message, tweet, or any kind of recommendation for a movie or TV show. Extract the title being discussed. Return ONLY JSON: {"title": "show name", "confidence": "high"|"medium"|"low", "reasoning": "what you saw"}. If none found, {"title": null, "confidence": "low", "reasoning": "why"}.` }
          ]
        }]
      })
    });
    const data = await r.json();
    const text = data.content?.find(c => c.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    return { title: null, confidence: "low", reasoning: "couldn't read the image" };
  }
}

// ── STYLE ────────────────────────────────────────────────────────────

const FONTS_LINK = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;
const SERIF = `'Fraunces', Georgia, serif`;
const SANS = `'Inter', -apple-system, system-ui, sans-serif`;
const MONO = `'JetBrains Mono', ui-monospace, monospace`;

// ── PRIMITIVES ───────────────────────────────────────────────────────

function Eyebrow({ children, color = "#1a1a1a", num }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
      {num && <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, color: "#999", letterSpacing: "0.1em" }}>{num}</span>}
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.15 }} />
      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color, letterSpacing: "0.18em", textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function TitleCard({ item, onClick, size = "md", rank }) {
  const isTV = item.media_type === "tv";
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const widths = { sm: 108, md: 140, lg: 170, xl: 220 };
  const w = widths[size];

  return (
    <div
      onClick={() => onClick(item)}
      style={{ cursor: "pointer", flexShrink: 0, width: w, transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "relative", aspectRatio: "2/3", background: "#f0ede8", borderRadius: 4, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)" }}>
        {item.poster_path ? (
          <img src={`${POSTER}${item.poster_path}`} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#999" }}>◎</div>
        )}
        {rank && (
          <div style={{ position: "absolute", top: -10, left: -6, fontFamily: SERIF, fontSize: 76, fontWeight: 900, fontStyle: "italic", color: "#faf8f3", WebkitTextStroke: "1.5px #1a1a1a", lineHeight: 1, letterSpacing: "-0.04em" }}>{rank}</div>
        )}
      </div>
      <div style={{ padding: "12px 2px 0" }}>
        <div style={{ fontFamily: SERIF, fontSize: size === "xl" ? 20 : 14, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 4, letterSpacing: "-0.01em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.05em" }}>
          <span>{year || "—"}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ textTransform: "uppercase" }}>{isTV ? "Series" : "Film"}</span>
          {rating && (<><span style={{ opacity: 0.4 }}>·</span><span style={{ color: "#c2410c", fontWeight: 600 }}>★{rating}</span></>)}
        </div>
      </div>
    </div>
  );
}

function StreamerCard({ s }) {
  return (
    <div style={{ borderRadius: 6, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "#fff" }}>
      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "14px 16px", background: s.color, color: "#fff", textDecoration: "none" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", opacity: 0.7, marginBottom: 4, textTransform: "uppercase" }}>Watch on</div>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600 }}>{s.name} →</div>
      </a>
      <a href={s.signup} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", textDecoration: "none", background: "#faf8f3", color: "#666", fontSize: 11 }}>
        <span style={{ fontFamily: SANS }}>No account? Start here</span>
        <span style={{ fontFamily: MONO, fontWeight: 600, color: "#1a1a1a" }}>{s.monthly}/mo</span>
      </a>
    </div>
  );
}

// ── CAPTURE MODAL ────────────────────────────────────────────────────

function CaptureModal({ onClose, onResult, trending }) {
  const [mode, setMode] = useState("choose");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const debounceRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  function typeSearch(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const r = await api("search", { query: val });
      setResults(r.slice(0, 10));
    }, 200);
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let final = "", interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setTranscript(prev => prev + final + (interim ? ` ${interim}` : ""));
    };
    recognition.onerror = () => { setMode("choose"); setStatus("Couldn't hear you — try again or type"); };
    recognition.start();
    recognitionRef.current = recognition;
    setMode("listening");
    setTranscript("");
    setStatus("");
  }

  async function stopListening() {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (!transcript.trim()) { setMode("choose"); return; }
    setMode("processing");
    setStatus("Figuring out what you meant...");
    const result = await extractTitle(transcript);
    await resolveExtracted(result);
  }

  async function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        await processImage(file);
        return;
      }
    }
  }

  async function processImage(file) {
    setMode("processing");
    setStatus("Reading your screenshot...");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(",")[1];
      const result = await extractFromImage(base64, file.type);
      await resolveExtracted(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleLongText(text) {
    setMode("processing");
    setStatus("Figuring out what you meant...");
    const result = await extractTitle(text);
    await resolveExtracted(result);
  }

  async function resolveExtracted(result) {
    setExtracted(result);
    if (!result.title) { setMode("notfound"); return; }
    setStatus(`Looking for "${result.title}"...`);
    const hits = await api("search", { query: result.title });
    if (hits.length === 0) { setMode("notfound"); return; }
    setResults(hits.slice(0, 6));
    setMode("resolved");
  }

  function reset() {
    setMode("choose"); setQuery(""); setResults([]);
    setTranscript(""); setExtracted(null); setStatus("");
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(20,18,15,0.7)", backdropFilter: "blur(24px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.25s ease" }}
      onClick={e => e.target === e.currentTarget && onClose()}
      onPaste={handlePaste}>
      <div style={{ background: "#faf8f3", borderRadius: "32px 32px 0 0", width: "100%", maxWidth: 600, maxHeight: "94vh", overflowY: "auto", paddingBottom: 40, boxShadow: "0 -20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 4, background: "#d4cfc4", borderRadius: 2 }} />
        </div>
        <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#c2410c", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Capture</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase" }}>Close</button>
        </div>

        {mode === "choose" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 500, fontStyle: "italic", lineHeight: 0.95, letterSpacing: "-0.035em", marginBottom: 10, color: "#1a1a1a" }}>What did you hear about?</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: "#666", lineHeight: 1.5, marginBottom: 28 }}>
              Speak it, type it, paste a link, or drop a screenshot from your messages. However it lives in your head.
            </div>

            {status && (
              <div style={{ padding: "10px 14px", marginBottom: 20, borderRadius: 4, background: "#fff3e6", border: "1px solid #c2410c33", fontFamily: SANS, fontSize: 13, color: "#c2410c" }}>{status}</div>
            )}

            <div style={{ marginBottom: 16 }}>
              <textarea
                value={query}
                onChange={e => { const v = e.target.value; setQuery(v); if (v.length < 60) typeSearch(v); }}
                onKeyDown={e => { if (e.key === "Enter" && query.length > 60) { e.preventDefault(); handleLongText(query); } }}
                placeholder="Type a title, paste a link or caption..."
                autoFocus
                rows={query.length > 60 ? 3 : 1}
                style={{ width: "100%", padding: "14px 16px", border: "1px solid rgba(26,26,26,0.12)", borderRadius: 6, background: "#fff", outline: "none", fontFamily: SERIF, fontSize: 18, color: "#1a1a1a", letterSpacing: "-0.005em", resize: "none", boxSizing: "border-box", lineHeight: 1.4 }}
              />
              {query.length > 60 && (
                <button onClick={() => handleLongText(query)} style={{ marginTop: 10, padding: "10px 16px", borderRadius: 4, background: "#1a1a1a", color: "#faf8f3", border: "none", fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}>Figure out what this is →</button>
              )}
            </div>

            {results.length > 0 && query.length < 60 && (
              <div style={{ marginBottom: 24 }}>
                {results.slice(0, 4).map(r => (
                  <div key={r.id} onClick={() => { onResult(r); onClose(); }}
                    style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 4px", borderBottom: "1px solid rgba(0,0,0,0.05)", cursor: "pointer" }}>
                    <div style={{ width: 40, height: 60, background: "#e8e3db", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                      {r.poster_path && <img src={`${POSTER}${r.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.2 }}>{r.title || r.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.05em", marginTop: 2 }}>
                        {(r.release_date || r.first_air_date || "").slice(0, 4)} · {r.media_type === "tv" ? "SERIES" : "FILM"}
                      </div>
                    </div>
                    <span style={{ color: "#c2410c", fontSize: 16 }}>→</span>
                  </div>
                ))}
              </div>
            )}

            <Eyebrow num="◦" color="#1a1a1a">Or capture another way</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24 }}>
              {voiceSupported && (
                <button onClick={startListening} style={{ padding: "20px 16px", borderRadius: 6, border: "1px solid rgba(26,26,26,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", fontFamily: SANS }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#c2410c"; e.currentTarget.style.background = "#fff9f3"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(26,26,26,0.1)"; e.currentTarget.style.background = "#fff"; }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>🎙️</div>
                  <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, marginBottom: 2 }}>Just tell me</div>
                  <div style={{ fontSize: 11, color: "#666", lineHeight: 1.3 }}>"Heard about The Bear on a podcast"</div>
                </button>
              )}
              <button onClick={() => fileRef.current?.click()} style={{ padding: "20px 16px", borderRadius: 6, border: "1px solid rgba(26,26,26,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", fontFamily: SANS }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#c2410c"; e.currentTarget.style.background = "#fff9f3"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(26,26,26,0.1)"; e.currentTarget.style.background = "#fff"; }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>📸</div>
                <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, marginBottom: 2 }}>Got a screenshot?</div>
                <div style={{ fontSize: 11, color: "#666", lineHeight: 1.3 }}>TikTok, text msg, Instagram, anywhere</div>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const file = e.target.files?.[0]; if (file) processImage(file); }} />

            <div style={{ padding: "14px 16px", borderRadius: 6, background: "rgba(26,26,26,0.04)", border: "1px dashed rgba(26,26,26,0.15)", fontFamily: SANS, fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 28 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Tip</div>
              You can also paste an image directly (⌘V) or a whole paragraph — I'll find the title.
            </div>

            <Eyebrow num="◦" color="#1a1a1a">Or just browse</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
              {trending.slice(0, 6).map(t => <TitleCard key={t.id} item={t} onClick={(item) => { onResult(item); onClose(); }} size="sm" />)}
            </div>
          </div>
        )}

        {mode === "listening" && (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#c2410c", margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#fff", animation: "pulse 1.4s ease-in-out infinite", boxShadow: "0 0 0 12px rgba(194,65,12,0.15)" }}>🎙️</div>
            <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.02em", marginBottom: 28, color: "#1a1a1a" }}>I'm listening.</div>
            {transcript && (
              <div style={{ padding: "16px 20px", borderRadius: 6, marginBottom: 24, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", fontFamily: SERIF, fontSize: 17, color: "#1a1a1a", lineHeight: 1.4, textAlign: "left", minHeight: 60 }}>{transcript}</div>
            )}
            <button onClick={stopListening} style={{ padding: "14px 36px", borderRadius: 4, background: "#1a1a1a", color: "#faf8f3", border: "none", fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>I'm done talking</button>
            <button onClick={() => { recognitionRef.current?.stop(); reset(); }} style={{ display: "block", margin: "16px auto 0", background: "transparent", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase" }}>Cancel</button>
          </div>
        )}

        {mode === "processing" && (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.02em", marginBottom: 12, color: "#1a1a1a" }}>{status || "Thinking..."}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase" }}>One moment</div>
            <div style={{ margin: "32px auto 0", width: 140, height: 3, background: "rgba(194,65,12,0.15)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: "40%", height: "100%", background: "#c2410c", animation: "slide 1.4s ease infinite" }} />
            </div>
          </div>
        )}

        {mode === "resolved" && (
          <div style={{ padding: "0 24px" }}>
            {extracted && (
              <div style={{ padding: "14px 16px", borderRadius: 6, marginBottom: 24, background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#c2410c", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>I heard · {extracted.confidence} confidence</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, fontStyle: "italic", color: "#1a1a1a", lineHeight: 1.15, marginBottom: 6, letterSpacing: "-0.02em" }}>"{extracted.title}"</div>
                {extracted.reasoning && (<div style={{ fontFamily: SANS, fontSize: 11, color: "#666", lineHeight: 1.4 }}>{extracted.reasoning}</div>)}
              </div>
            )}
            <Eyebrow num="◦" color="#1a1a1a">Is this it?</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              {results.map(r => <TitleCard key={r.id} item={r} onClick={(item) => { onResult(item); onClose(); }} size="sm" />)}
            </div>
            <button onClick={reset} style={{ width: "100%", padding: "12px", borderRadius: 4, marginBottom: 12, background: "transparent", color: "#1a1a1a", border: "1px solid #1a1a1a", fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}>Try again</button>
          </div>
        )}

        {mode === "notfound" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.02em", marginBottom: 12, color: "#1a1a1a" }}>I couldn't catch it.</div>
            <div style={{ fontFamily: SERIF, fontSize: 15, color: "#666", lineHeight: 1.5, marginBottom: 24 }}>
              {extracted?.reasoning || "Try typing the title directly, or paste in a clearer screenshot."}
            </div>
            <button onClick={reset} style={{ width: "100%", padding: "14px", borderRadius: 4, marginBottom: 12, background: "#1a1a1a", color: "#faf8f3", border: "none", fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}>Try another way</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TITLE MODAL ──────────────────────────────────────────────────────

function TitleModal({ item, onClose, onActorClick, onTitleSwap }) {
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [inList, setInList] = useState(false);
  const streamers = getStreamers(item.id);
  const isTV = item.media_type === "tv";
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);

  useEffect(() => {
    api("credits", { id: item.id }).then(setCast);
    api("similar", { id: item.id }).then(setSimilar);
    const saved = JSON.parse(localStorage.getItem("heard_list") || "[]");
    setInList(saved.some(s => s.id === item.id));
  }, [item.id]);

  function toggleList() {
    const saved = JSON.parse(localStorage.getItem("heard_list") || "[]");
    const next = inList
      ? saved.filter(s => s.id !== item.id)
      : [...saved, item];
    localStorage.setItem("heard_list", JSON.stringify(next));
    setInList(!inList);
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = `${title}. ${year ? `From ${year}. ` : ""}${item.overview || ""}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }

  const runtime = item.runtime;
  const genres = (item.genres || []).slice(0, 3);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(20,18,15,0.55)", backdropFilter: "blur(20px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.2s ease" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#faf8f3", borderRadius: "32px 32px 0 0", width: "100%", maxWidth: 600, maxHeight: "94vh", overflowY: "auto", paddingBottom: 60, boxShadow: "0 -20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ position: "relative", height: 320, overflow: "hidden", borderRadius: "32px 32px 0 0" }}>
          {item.backdrop_path ? (
            <img src={`${BG}${item.backdrop_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : item.poster_path ? (
            <img src={`${POSTER}${item.poster_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(12px) scale(1.2)" }} />
          ) : <div style={{ background: "#1a1a1a", width: "100%", height: "100%" }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(250,248,243,1) 100%)" }} />
          <div style={{ position: "absolute", top: 18, right: 18, display: "flex", gap: 8 }}>
            <button onClick={speak} title="Read aloud" style={{ background: "rgba(250,248,243,0.9)", backdropFilter: "blur(10px)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#1a1a1a", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>🔊</button>
            <button onClick={onClose} style={{ background: "rgba(250,248,243,0.9)", backdropFilter: "blur(10px)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#1a1a1a", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 300 }}>✕</button>
          </div>
          <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
              {year}{year && " · "}{isTV ? "Series" : "Film"}{runtime ? ` · ${runtime}min` : ""}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 400, color: "#fff", lineHeight: 0.98, letterSpacing: "-0.02em", fontStyle: "italic" }}>{title}</div>
          </div>
        </div>

        <div style={{ padding: "28px 24px 0" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 24, fontFamily: MONO, fontSize: 10, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", flexWrap: "wrap" }}>
            {item.vote_average > 0 && <span>★ {item.vote_average.toFixed(1)}/10</span>}
            {genres.map(g => <span key={g}>· {g}</span>)}
          </div>
          <button onClick={toggleList} style={{ width: "100%", padding: "14px", borderRadius: 4, marginBottom: 28, background: inList ? "transparent" : "#1a1a1a", color: inList ? "#1a1a1a" : "#faf8f3", border: inList ? "1px solid #1a1a1a" : "none", fontFamily: SANS, fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {inList ? "✓ Saved" : "+ Save for later"}
          </button>
          {item.overview && (
            <p style={{ fontFamily: SERIF, fontSize: 17, color: "#2a2a2a", lineHeight: 1.55, marginBottom: 36, fontWeight: 400, letterSpacing: "-0.005em" }}>{item.overview}</p>
          )}

          <div style={{ marginBottom: 40 }}>
            <Eyebrow num="01" color="#c2410c">Where to watch</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: streamers.length === 1 ? "1fr" : "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              {streamers.map(s => <StreamerCard key={s.name} s={s} />)}
            </div>
          </div>

          {cast.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <Eyebrow num="02" color="#1a1a1a">Cast · tap for their other work</Eyebrow>
              <div style={{ display: "flex", gap: 18, overflowX: "auto", paddingBottom: 4 }}>
                {cast.map(a => (
                  <div key={a.id} onClick={() => onActorClick(a)} style={{ flexShrink: 0, cursor: "pointer", textAlign: "left", width: 74 }}>
                    <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#e8e3db", overflow: "hidden", marginBottom: 8, border: "1px solid rgba(0,0,0,0.06)" }}>
                      {a.profile_path ? (
                        <img src={`${POSTER}${a.profile_path}`} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#999" }}>◯</div>}
                    </div>
                    <div style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.25, marginBottom: 2 }}>{a.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <Eyebrow num="03" color="#1a1a1a">If you liked this</Eyebrow>
              <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
                {similar.map(s => <TitleCard key={s.id} item={s} onClick={onTitleSwap} size="md" />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ACTOR MODAL ──────────────────────────────────────────────────────

function ActorModal({ actor, onClose, onTitleClick }) {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    api("actorCredits", { id: actor.id }).then(d => {
      setCredits(d);
      setLoading(false);
    });
  }, [actor.id]);

  const filtered = filter === "all" ? credits : credits.filter(c => c.media_type === filter);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,18,15,0.55)", backdropFilter: "blur(20px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#faf8f3", borderRadius: "32px 32px 0 0", width: "100%", maxWidth: 600, maxHeight: "94vh", overflowY: "auto", paddingBottom: 60 }}>
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", padding: 0 }}>← Back</button>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase" }}>Filmography</span>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#e8e3db", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }}>
              {actor.profile_path ? (
                <img src={`${POSTER}${actor.profile_path}`} alt={actor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#999" }}>◯</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 500, fontStyle: "italic", lineHeight: 1.05, marginBottom: 6, letterSpacing: "-0.02em", color: "#1a1a1a" }}>{actor.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#666", letterSpacing: "0.12em", textTransform: "uppercase" }}>Where have you seen them?</div>
              {actor.known_for_department && (
                <div style={{ fontFamily: SANS, fontSize: 12, color: "#999", marginTop: 4 }}>
                  {actor.known_for_department}{actor.place_of_birth ? ` · ${actor.place_of_birth}` : ""}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px 0", display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ k: "all", l: "All" }, { k: "movie", l: "Films" }, { k: "tv", l: "Series" }].map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: "7px 14px", borderRadius: 99, border: filter === f.k ? "1px solid #1a1a1a" : "1px solid transparent", background: filter === f.k ? "#1a1a1a" : "transparent", color: filter === f.k ? "#faf8f3" : "#666", fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em" }}>{f.l}</button>
            ))}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.1em" }}>{filtered.length} · BY POPULARITY</span>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", fontFamily: MONO, fontSize: 11, color: "#999", letterSpacing: "0.15em" }}>LOADING...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, padding: "24px" }}>
            {filtered.map(c => <TitleCard key={c.id} item={c} onClick={onTitleClick} size="sm" />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────

export default function Heard() {
  const [tab, setTab] = useState("home");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actorSelected, setActorSelected] = useState(null);
  const [trending, setTrending] = useState([]);
  const [moodResults, setMoodResults] = useState([]);
  const [activeMood, setActiveMood] = useState(null);
  const [moodLoading, setMoodLoading] = useState(false);
  const [myList, setMyList] = useState([]);
  const [issueNum, setIssueNum] = useState("№ 001");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    api("trending").then(setTrending);
    refreshList();
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
    setIssueNum(`№ ${String(week).padStart(3, "0")}`);
  }, []);

  useEffect(() => {
    function onPaste(e) {
      if (captureOpen || selected || actorSelected) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          setCaptureOpen(true);
          return;
        }
      }
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [captureOpen, selected, actorSelected]);

  function refreshList() { setMyList(JSON.parse(localStorage.getItem("heard_list") || "[]")); }

  async function handleMood(mood) {
    if (activeMood?.label === mood.label) { setActiveMood(null); setMoodResults([]); return; }
    setActiveMood(mood);
    setMoodLoading(true);
    const results = await api("byGenre", { genre: mood.genre });
    setMoodResults(results);
    setMoodLoading(false);
  }

  function removeFromList(item) {
    const next = myList.filter(m => m.id !== item.id);
    localStorage.setItem("heard_list", JSON.stringify(next));
    setMyList(next);
  }

  function handleSearch(val) {
    setSearchQuery(val);
    clearTimeout(searchDebounceRef.current);
    if (!val.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      const r = await api("search", { query: val });
      setSearchResults(r);
      setSearching(false);
    }, 200);
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  const featured = trending[0];

  const tabs = [
    { k: "home", l: "Front" },
    { k: "search", l: "Find" },
    { k: "mood", l: "Mood" },
    { k: "list", l: "Saved" },
  ];

  return (
    <>
      <style>{FONTS_LINK + `
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 12px rgba(194,65,12,0.15) } 50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(194,65,12,0.05) } }
        @keyframes slide { 0% { transform: translateX(-100%) } 100% { transform: translateX(350%) } }
        ::-webkit-scrollbar { display: none }
        * { -webkit-tap-highlight-color: transparent }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important }
        }
      `}</style>

      <div style={{ fontFamily: SANS, background: "#faf8f3", minHeight: "100vh", maxWidth: 600, margin: "0 auto", position: "relative", paddingBottom: 110, color: "#1a1a1a" }}>
        {/* MASTHEAD */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(250,248,243,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(26,26,26,0.08)" }}>
          {tab === "search" ? (
            <div style={{ padding: "20px 24px 18px" }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
                Search · type a title
              </div>
              <input autoFocus value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="search..."
                style={{ width: "100%", padding: "8px 0", border: "none", borderBottom: "1px solid #1a1a1a", background: "transparent", outline: "none", fontFamily: SERIF, fontSize: 28, fontStyle: "italic", fontWeight: 500, color: "#1a1a1a", letterSpacing: "-0.02em", boxSizing: "border-box" }} />
            </div>
          ) : (
            <div style={{ padding: "20px 24px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
                <span>{today}</span>
                <span>{issueNum}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 500, fontStyle: "italic", lineHeight: 0.9, letterSpacing: "-0.035em", color: "#1a1a1a" }}>
                  {tab === "home" ? "heard." : tab === "mood" ? "what's the vibe." : "saved."}
                </div>
                {tab === "home" && (
                  <div style={{ fontFamily: MONO, fontSize: 9, color: "#c2410c", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "right", lineHeight: 1.4 }}>Find where<br />to watch<br />anything.</div>
                )}
                {tab === "list" && (
                  <div style={{ fontFamily: MONO, fontSize: 10, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase" }}>{myList.length} {myList.length === 1 ? "title" : "titles"}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* HOME */}
        {tab === "home" && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            <div style={{ padding: "24px 24px 40px" }}>
              <div onClick={() => setCaptureOpen(true)} style={{ padding: "28px 24px", borderRadius: 6, background: "#1a1a1a", color: "#faf8f3", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "45%", background: "radial-gradient(circle at right, rgba(194,65,12,0.4), transparent 70%)", pointerEvents: "none" }} />
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#c2410c", fontWeight: 600, marginBottom: 12 }}>Tap to capture</div>
                <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 500, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 16 }}>What did you<br />hear about?</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.6)" }}>
                  <span>🎙️ Speak</span><span>·</span><span>📸 Screenshot</span><span>·</span><span>✎ Type</span><span>·</span><span>📋 Paste anything</span>
                </div>
              </div>
            </div>

            {featured && (
              <div style={{ padding: "0 24px 44px" }}>
                <Eyebrow num="01" color="#c2410c">The Feature</Eyebrow>
                <div onClick={() => setSelected(featured)} style={{ cursor: "pointer" }}>
                  <div style={{ position: "relative", aspectRatio: "16/10", borderRadius: 4, overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.1)" }}>
                    {featured.backdrop_path && (
                      <img src={`${BG}${featured.backdrop_path}`} alt={featured.title || featured.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)" }} />
                    <div style={{ position: "absolute", top: 14, left: 14, padding: "6px 10px", background: "#c2410c", color: "#fff", fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Trending № 1</div>
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 10, color: "#1a1a1a" }}>{featured.title || featured.name}</div>
                  {featured.overview && (
                    <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, color: "#444", marginBottom: 10, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{featured.overview}</p>
                  )}
                  <div style={{ fontFamily: MONO, fontSize: 10, color: "#c2410c", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Read more →</div>
                </div>
              </div>
            )}

            <div style={{ padding: "0 24px 44px" }}>
              <Eyebrow num="02" color="#1a1a1a">The rankings — this week</Eyebrow>
              <div style={{ display: "flex", gap: 22, overflowX: "auto", paddingBottom: 8, marginLeft: -4, paddingLeft: 4 }}>
                {trending.slice(1, 8).map((t, i) => <TitleCard key={t.id} item={t} onClick={setSelected} size="lg" rank={i + 2} />)}
              </div>
            </div>

            <div style={{ padding: "0 24px 44px" }}>
              <Eyebrow num="03" color="#1a1a1a">Pick a mood, not a genre</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {MOODS.slice(0, 6).map(m => (
                  <button key={m.label} onClick={() => { setTab("mood"); handleMood(m); }}
                    style={{ padding: "18px 16px", borderRadius: 4, border: "1px solid rgba(26,26,26,0.08)", cursor: "pointer", background: "#fff", textAlign: "left", fontFamily: SANS, transition: "all 0.2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.background = m.tint + "30"; e.currentTarget.style.borderColor = m.tint; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(26,26,26,0.08)"; }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{m.emoji}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: "#666", lineHeight: 1.3 }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: "0 24px 44px" }}>
              <Eyebrow num="04" color="#1a1a1a">Also in rotation</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                {trending.slice(8, 14).map(t => <TitleCard key={t.id} item={t} onClick={setSelected} size="sm" />)}
              </div>
            </div>

            <div style={{ textAlign: "center", padding: "32px 24px 20px", borderTop: "1px solid rgba(26,26,26,0.08)", margin: "0 24px" }}>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, fontStyle: "italic", color: "#1a1a1a", letterSpacing: "-0.02em" }}>heard.</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 6 }}>Est. 2026 · For the curious viewer</div>
            </div>
          </div>
        )}

        {/* FIND */}
        {tab === "search" && (
          <div style={{ padding: "20px 24px", animation: "slideUp 0.3s ease" }}>
            {searching && (
              <div style={{ textAlign: "center", padding: 30, fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase" }}>Searching...</div>
            )}
            {!searching && searchQuery && searchResults.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontFamily: SERIF, fontSize: 28, fontStyle: "italic", color: "#999", marginBottom: 12, letterSpacing: "-0.02em" }}>Nothing found.</div>
                <div style={{ fontFamily: SERIF, fontSize: 15, color: "#999", lineHeight: 1.4, marginBottom: 24 }}>Try a different spelling, an actor's name, or a keyword from the plot.</div>
                <button onClick={() => setCaptureOpen(true)} style={{ padding: "12px 24px", borderRadius: 4, background: "#1a1a1a", color: "#faf8f3", border: "none", fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>Try capture instead →</button>
              </div>
            )}
            {!searchQuery && (
              <>
                <Eyebrow num="◦" color="#1a1a1a">Popular right now</Eyebrow>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}>
                  {trending.slice(0, 12).map(t => <TitleCard key={t.id} item={t} onClick={setSelected} size="sm" />)}
                </div>
                <div style={{ padding: "16px 18px", borderRadius: 6, background: "rgba(194,65,12,0.08)", border: "1px dashed rgba(194,65,12,0.3)", fontFamily: SANS, fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: "#c2410c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Can't remember the title?</div>
                  Use <button onClick={() => setCaptureOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 13, color: "#c2410c", textDecoration: "underline", padding: 0, fontWeight: 600 }}>capture</button> — speak it, paste a screenshot, or describe what you heard.
                </div>
              </>
            )}
            {searchResults.length > 0 && (
              <div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                  {searchResults.map(r => <TitleCard key={r.id} item={r} onClick={setSelected} size="sm" />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MOOD */}
        {tab === "mood" && (
          <div style={{ padding: "20px 24px 20px", animation: "slideUp 0.3s ease" }}>
            <Eyebrow num="◦" color="#1a1a1a">Pick your poison</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 36 }}>
              {MOODS.map(m => {
                const active = activeMood?.label === m.label;
                return (
                  <button key={m.label} onClick={() => handleMood(m)}
                    style={{ padding: "16px 14px", borderRadius: 4, border: `1px solid ${active ? "#1a1a1a" : "rgba(26,26,26,0.08)"}`, cursor: "pointer", background: active ? m.tint : "#fff", textAlign: "left", fontFamily: SANS, transition: "all 0.2s ease" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{m.emoji}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontFamily: SANS, fontSize: 10, color: active ? "#1a1a1a" : "#666" }}>{m.desc}</div>
                  </button>
                );
              })}
            </div>

            {moodLoading && (
              <div style={{ textAlign: "center", padding: 40, fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.2em", textTransform: "uppercase" }}>Finding the perfect watch...</div>
            )}

            {!moodLoading && moodResults.length > 0 && (
              <div>
                <Eyebrow num="◦" color="#c2410c">{activeMood.emoji} for {activeMood.label.toLowerCase()}</Eyebrow>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                  {moodResults.map(r => <TitleCard key={r.id} item={r} onClick={setSelected} size="sm" />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SAVED */}
        {tab === "list" && (
          <div style={{ padding: "20px 24px", animation: "slideUp 0.3s ease" }}>
            {myList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 300, fontStyle: "italic", color: "#d4cfc4", marginBottom: 20, letterSpacing: "-0.02em" }}>empty.</div>
                <div style={{ fontFamily: SERIF, fontSize: 17, color: "#666", lineHeight: 1.4, marginBottom: 8, maxWidth: 280, margin: "0 auto 8px" }}>Your saved titles will live here — the show from the podcast, the film a friend won't shut up about.</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 16 }}>Tap the capture button</div>
              </div>
            ) : (
              <>
                <Eyebrow num="◦" color="#1a1a1a">Your collection</Eyebrow>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                  {myList.map(m => (
                    <div key={m.id} style={{ position: "relative" }}>
                      <TitleCard item={m} onClick={setSelected} size="sm" />
                      <button onClick={(e) => { e.stopPropagation(); removeFromList(m); }}
                        style={{ position: "absolute", top: 6, right: 6, background: "rgba(26,26,26,0.85)", backdropFilter: "blur(6px)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 13, fontWeight: 300 }}>✕</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <button onClick={() => setCaptureOpen(true)} aria-label="Capture a show recommendation"
          style={{ position: "fixed", bottom: 90, right: "50%", transform: "translateX(calc(50% + 250px))", width: 64, height: 64, borderRadius: "50%", background: "#c2410c", color: "#fff", border: "none", cursor: "pointer", zIndex: 40, boxShadow: "0 4px 20px rgba(194,65,12,0.4), 0 1px 3px rgba(0,0,0,0.1)", fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>＋</button>

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 600, background: "rgba(250,248,243,0.95)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(26,26,26,0.08)", display: "flex", padding: "14px 0 22px", zIndex: 50 }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 0", position: "relative", fontFamily: MONO, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: tab === t.k ? 600 : 500, color: tab === t.k ? "#1a1a1a" : "#999" }}>
              {tab === t.k && (
                <div style={{ position: "absolute", top: -15, left: "50%", transform: "translateX(-50%)", width: 20, height: 2, background: "#c2410c" }} />
              )}
              {t.l}
            </button>
          ))}
        </div>

        {captureOpen && <CaptureModal onClose={() => setCaptureOpen(false)} onResult={setSelected} trending={trending} />}
        {selected && <TitleModal item={selected} onClose={() => { setSelected(null); refreshList(); }} onActorClick={setActorSelected} onTitleSwap={setSelected} />}
        {actorSelected && <ActorModal actor={actorSelected} onClose={() => setActorSelected(null)} onTitleClick={(item) => { setActorSelected(null); setSelected(item); }} />}
      </div>
    </>
  );
}
