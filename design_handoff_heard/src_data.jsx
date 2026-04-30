// data.jsx — Mock database, streamers, moods, AI extraction sim
// Lifted from the original prototype, expanded for new flows.

const POSTER = "https://image.tmdb.org/t/p/w500";
const BG = "https://image.tmdb.org/t/p/original";

const STREAMERS = [
  { id: "netflix", name: "Netflix", color: "#E50914", textOn: "#fff", monthly: "$15.49", short: "NFLX" },
  { id: "prime", name: "Prime Video", color: "#00A8E1", textOn: "#fff", monthly: "$8.99", short: "PRIME" },
  { id: "appletv", name: "Apple TV+", color: "#1a1a1a", textOn: "#fff", monthly: "$9.99", short: "ATV" },
  { id: "max", name: "Max", color: "#002BE7", textOn: "#fff", monthly: "$9.99", short: "MAX" },
  { id: "hulu", name: "Hulu", color: "#1CE783", textOn: "#000", monthly: "$7.99", short: "HULU" },
  { id: "disney", name: "Disney+", color: "#113CCF", textOn: "#fff", monthly: "$7.99", short: "D+" },
  { id: "peacock", name: "Peacock", color: "#0047AB", textOn: "#fff", monthly: "$5.99", short: "PEAC" },
];

const STREAMER_BY_ID = Object.fromEntries(STREAMERS.map(s => [s.id, s]));

const MOODS = [
  { label: "Belly Laughs", emoji: "🪩", genre: "comedy", tint: "#FFE066", desc: "Comedies that actually deliver" },
  { label: "Ugly Cry", emoji: "🌧", genre: "drama", tint: "#A8C7FA", desc: "Dramas that hit hard" },
  { label: "On Edge", emoji: "🔪", genre: "thriller", tint: "#FF6B6B", desc: "Thrillers, chills, suspense" },
  { label: "Warm & Fuzzy", emoji: "🌸", genre: "romance", tint: "#FFB5C5", desc: "Romance, comfort, heart" },
  { label: "Big Ideas", emoji: "🌌", genre: "scifi", tint: "#B794F4", desc: "Sci-fi & mind-benders" },
  { label: "Adrenaline", emoji: "⚡", genre: "action", tint: "#FF8C42", desc: "Action, heists, set pieces" },
  { label: "True Stuff", emoji: "📰", genre: "documentary", tint: "#7DD3C0", desc: "Documentaries worth your time" },
  { label: "Kids Are Up", emoji: "🧸", genre: "family", tint: "#FCD34D", desc: "Family picks that don't suck" },
];

const ACTORS = {
  1: { id: 1, name: "Jeremy Allen White", profile_path: "/yDHfPAoUiuYPY6bBnCWiPF7eEgL.jpg", known_for_department: "Acting", place_of_birth: "Brooklyn, New York, USA" },
  2: { id: 2, name: "Ayo Edebiri", profile_path: "/ihp3qqWBpNgcd9YGbb2z8Y5HVHO.jpg", known_for_department: "Acting", place_of_birth: "Boston, Massachusetts, USA" },
  3: { id: 3, name: "Pedro Pascal", profile_path: "/g7qKrVNmHxS4kV5kqjg7W4d6ybT.jpg", known_for_department: "Acting", place_of_birth: "Santiago, Chile" },
  4: { id: 4, name: "Bella Ramsey", profile_path: "/okAhpyI0hAvYTvG8AiLLUM4lzT.jpg", known_for_department: "Acting", place_of_birth: "Nottingham, England, UK" },
  5: { id: 5, name: "Zendaya", profile_path: "/3nCTOpZLTA7WnJUzTcyHy3cBJJE.jpg", known_for_department: "Acting", place_of_birth: "Oakland, California, USA" },
  6: { id: 6, name: "Timothée Chalamet", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg", known_for_department: "Acting", place_of_birth: "New York City, NY, USA" },
  7: { id: 7, name: "Adam Driver", profile_path: "/wZFeTLtnvTAn7c6ZDaKpCoNOL4F.jpg", known_for_department: "Acting", place_of_birth: "San Diego, California, USA" },
  8: { id: 8, name: "Florence Pugh", profile_path: "/1bgvI8pQ0YnTt1W0YMvzdh17WiW.jpg", known_for_department: "Acting", place_of_birth: "Oxford, England, UK" },
  9: { id: 9, name: "Cillian Murphy", profile_path: "/llkbyWKwpfowZ6C8peBjIV9jj99.jpg", known_for_department: "Acting", place_of_birth: "Douglas, Cork, Ireland" },
  10: { id: 10, name: "Emily Blunt", profile_path: "/5nCSG5TL1bP0geDAFGdKqbypvMK.jpg", known_for_department: "Acting", place_of_birth: "London, England, UK" },
};

// Titles. Each title has a streamerIds array — what platforms it's on.
const TITLES = [
  { id: 101, title: "The Bear", media_type: "tv", year: "2022", vote_average: 8.6, popularity: 520, runtime: 30,
    genres: ["drama", "comedy"], poster_path: "/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg", backdrop_path: "/v2FB5NmHNLiLRq4Yj04rG1MjrHA.jpg",
    overview: "A young chef from the fine dining world returns to Chicago to run his late brother's beloved Italian beef sandwich shop.",
    castIds: [1, 2], similarIds: [103, 108, 115], streamerIds: ["hulu"] },
  { id: 102, title: "The Last of Us", media_type: "tv", year: "2023", vote_average: 8.7, popularity: 480, runtime: 55,
    genres: ["drama", "scifi", "action"], poster_path: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", backdrop_path: "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, smuggles Ellie out of an oppressive quarantine zone.",
    castIds: [3, 4], similarIds: [110, 106, 107], streamerIds: ["max"] },
  { id: 103, title: "Succession", media_type: "tv", year: "2018", vote_average: 8.8, popularity: 310, runtime: 60,
    genres: ["drama", "comedy"], poster_path: "/7HW47XbkNQ5fiwQFYGWdw9gs144.jpg", backdrop_path: "/1zSzjFU1fHFbLGWY6AYPLnDGq0z.jpg",
    overview: "The Roy family controls the biggest media and entertainment company in the world. Their world changes when their father steps down.",
    castIds: [], similarIds: [101, 108, 115], streamerIds: ["max"] },
  { id: 105, title: "Dune: Part Two", media_type: "movie", year: "2024", vote_average: 8.2, popularity: 600, runtime: 166,
    genres: ["scifi", "adventure", "action"], poster_path: "/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg", backdrop_path: "/87Bu2cMg0g9LCVjX0t0WIJACPSB.jpg",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    castIds: [6, 8, 5, 7], similarIds: [102, 106, 107], streamerIds: ["max"] },
  { id: 106, title: "Oppenheimer", media_type: "movie", year: "2023", vote_average: 8.1, popularity: 450, runtime: 181,
    genres: ["drama"], poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", backdrop_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    castIds: [9, 10, 8], similarIds: [105, 103], streamerIds: ["peacock"] },
  { id: 107, title: "Severance", media_type: "tv", year: "2022", vote_average: 8.7, popularity: 380, runtime: 50,
    genres: ["thriller", "scifi", "drama", "mystery"], poster_path: "/lFf6LLrQjYldcZItzOkGmMMigP7.jpg", backdrop_path: "/sSMHSdoGUPXXLrWHDhBL2YK8Zqf.jpg",
    overview: "Mark leads a team of office workers whose memories have been surgically divided between work and personal lives.",
    castIds: [], similarIds: [102, 103, 108], streamerIds: ["appletv"] },
  { id: 108, title: "Fleabag", media_type: "tv", year: "2016", vote_average: 8.6, popularity: 220, runtime: 27,
    genres: ["comedy", "drama"], poster_path: "/9f3n7ZnbcTTfFaluEv4f18b3y2a.jpg", backdrop_path: "/7OGdC9o5LrXnTabFaF6WYmxhGJ0.jpg",
    overview: "A dry-witted woman, known only as Fleabag, has no filter as she navigates life and love in London.",
    castIds: [], similarIds: [101, 103, 115], streamerIds: ["prime"] },
  { id: 110, title: "The Mandalorian", media_type: "tv", year: "2019", vote_average: 8.4, popularity: 290, runtime: 40,
    genres: ["scifi", "action", "adventure"], poster_path: "/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg", backdrop_path: "/o7qi2v4uWQ8bZ1tW3KI0Ztn2epk.jpg",
    overview: "After the fall of the Empire, a lone gunfighter makes his way through the lawless galaxy with a mysterious child.",
    castIds: [3], similarIds: [102, 105], streamerIds: ["disney"] },
  { id: 111, title: "Poor Things", media_type: "movie", year: "2023", vote_average: 7.9, popularity: 280, runtime: 141,
    genres: ["comedy", "drama", "scifi"], poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg", backdrop_path: "/esTIxQVrZFH12FJhQLu6QS1SjwP.jpg",
    overview: "The fantastical evolution of Bella Baxter, brought back to life by an unorthodox scientist.",
    castIds: [8], similarIds: [108, 115, 103], streamerIds: ["hulu"] },
  { id: 115, title: "Hacks", media_type: "tv", year: "2021", vote_average: 8.2, popularity: 190, runtime: 30,
    genres: ["comedy", "drama"], poster_path: "/aMB0Xr2yaEn5MiQdRfWqOeuctIo.jpg", backdrop_path: "/5PO9jvSyF9AMHWfkxT48UlnPCRY.jpg",
    overview: "A dark mentorship forms between a legendary Las Vegas stand-up comedian and an entitled young comedy writer.",
    castIds: [], similarIds: [108, 101, 111], streamerIds: ["max"] },
  { id: 122, title: "Past Lives", media_type: "movie", year: "2023", vote_average: 7.9, popularity: 200, runtime: 105,
    genres: ["romance", "drama"], poster_path: "/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg", backdrop_path: "/yCQQgIEXSTItCKyKNLhf6PVgYe9.jpg",
    overview: "Two deeply connected childhood friends are wrenched apart, then reunited two decades later in New York for one fateful week.",
    castIds: [], similarIds: [108, 111], streamerIds: ["prime"] },
  { id: 130, title: "Slow Horses", media_type: "tv", year: "2022", vote_average: 8.3, popularity: 240, runtime: 60,
    genres: ["thriller", "drama"], poster_path: "/oE6oDPGDQuU1DLBCDpMQDQrfRcG.jpg", backdrop_path: "/4Tlu3z5GNaY7Jzb2gfgT1ZFnMKR.jpg",
    overview: "A team of British intelligence agents who serve in a dumping ground department of MI5, and the rumpled, brilliant boss who watches over them.",
    castIds: [], similarIds: [107, 103, 113], streamerIds: ["appletv"] },
  { id: 131, title: "Ted Lasso", media_type: "tv", year: "2020", vote_average: 8.7, popularity: 360, runtime: 30,
    genres: ["comedy", "drama"], poster_path: "/9zoQrHnZAXCBcdkoSxNBMKqnePZ.jpg", backdrop_path: "/9zoQrHnZAXCBcdkoSxNBMKqnePZ.jpg",
    overview: "American football coach Ted Lasso heads to London to manage AFC Richmond, a struggling English Premier League football team.",
    castIds: [], similarIds: [108, 115, 101], streamerIds: ["appletv"] },
  { id: 132, title: "Pachinko", media_type: "tv", year: "2022", vote_average: 8.5, popularity: 180, runtime: 60,
    genres: ["drama"], poster_path: "/xpax3tIM9k1mmULAFgseOWsOfJV.jpg", backdrop_path: "/xpax3tIM9k1mmULAFgseOWsOfJV.jpg",
    overview: "An epic story of love, sacrifice, ambition, and loyalty told through the lens of one Korean immigrant family across four generations.",
    castIds: [], similarIds: [122, 103, 132], streamerIds: ["appletv"] },
  { id: 133, title: "Silo", media_type: "tv", year: "2023", vote_average: 8.2, popularity: 220, runtime: 60,
    genres: ["scifi", "thriller", "drama"], poster_path: "/tlliQuCupf8fpTH7RAor3aKMGy.jpg", backdrop_path: "/tlliQuCupf8fpTH7RAor3aKMGy.jpg",
    overview: "In a ruined and toxic future, thousands live in a giant silo deep underground. After its sheriff breaks a cardinal rule, secrets unspool.",
    castIds: [], similarIds: [107, 102, 130], streamerIds: ["appletv"] },
  { id: 134, title: "The Morning Show", media_type: "tv", year: "2019", vote_average: 8.0, popularity: 260, runtime: 60,
    genres: ["drama"], poster_path: "/q2THTJ2gVfwYJxbNLCa3FEcNUhE.jpg", backdrop_path: "/q2THTJ2gVfwYJxbNLCa3FEcNUhE.jpg",
    overview: "An inside look at the lives of the people who help America wake up in the morning, exploring the unique challenges faced by the men and women who carry out this daily televised ritual.",
    castIds: [], similarIds: [103, 134], streamerIds: ["appletv"] },
  { id: 135, title: "Killers of the Flower Moon", media_type: "movie", year: "2023", vote_average: 7.6, popularity: 210, runtime: 206,
    genres: ["drama", "thriller"], poster_path: "/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg", backdrop_path: "/1X7vow16X7CnCoexXh4H4F2yDJv.jpg",
    overview: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one — until the FBI steps in.",
    castIds: [], similarIds: [106, 113], streamerIds: ["appletv"] },
  { id: 136, title: "Napoleon", media_type: "movie", year: "2023", vote_average: 6.4, popularity: 200, runtime: 158,
    genres: ["drama", "action"], poster_path: "/jNG3If28r5wcuy2X62IUqQz5pBy.jpg", backdrop_path: "/jNG3If28r5wcuy2X62IUqQz5pBy.jpg",
    overview: "An epic that details the checkered rise and fall of French Emperor Napoleon Bonaparte and his relentless journey to power.",
    castIds: [], similarIds: [106, 105], streamerIds: ["appletv"] },
];

const TITLES_BY_ID = Object.fromEntries(TITLES.map(t => [t.id, t]));

const TITLES_BY_ACTOR = {};
for (const t of TITLES) {
  for (const aid of (t.castIds || [])) {
    if (!TITLES_BY_ACTOR[aid]) TITLES_BY_ACTOR[aid] = [];
    TITLES_BY_ACTOR[aid].push(t);
  }
}

const GENRE_MAP = {
  comedy: ["comedy"], drama: ["drama"], thriller: ["thriller", "mystery", "crime"],
  romance: ["romance"], scifi: ["scifi", "fantasy"], action: ["action", "adventure"],
  documentary: ["documentary"], family: ["family", "animation"],
};

// Mood blurbs — editorial, voicey
const MOOD_BLURBS = {
  drama: "For when you want to feel things that aren't your own.",
  comedy: "Sharp, weird, occasionally devastating. The good kind of laugh.",
  thriller: "Pulse-up shows that earn their tension.",
  romance: "Less rom-com slop, more aching.",
  scifi: "Big ideas, served with care.",
  action: "Choreography over chaos.",
  documentary: "Real stories, told beautifully.",
  family: "Watchable with the kids, worth your time too.",
};

// Sync mock API — components handle their own pseudo-loading.
const MockAPI = {
  trending: () => [...TITLES].sort((a, b) => b.popularity - a.popularity),
  search: (q) => {
    const ql = (q || "").toLowerCase().trim();
    if (!ql) return [];
    const actorIds = Object.values(ACTORS).filter(a => a.name.toLowerCase().includes(ql)).map(a => a.id);
    return TITLES.filter(t => {
      if (t.title.toLowerCase().includes(ql)) return true;
      if ((t.castIds || []).some(id => actorIds.includes(id))) return true;
      if ((t.overview || "").toLowerCase().includes(ql)) return true;
      return false;
    });
  },
  byGenre: (g) => {
    const gs = GENRE_MAP[g] || [g];
    return TITLES.filter(t => (t.genres || []).some(x => gs.includes(x)))
      .sort((a, b) => b.popularity - a.popularity);
  },
  byStreamer: (sid) => TITLES.filter(t => (t.streamerIds || []).includes(sid))
    .sort((a, b) => b.popularity - a.popularity),
  trending: () => [...TITLES].sort((a, b) => b.popularity - a.popularity).slice(0, 10),
  trendingOn: (sid) => TITLES.filter(t => (t.streamerIds || []).includes(sid)).sort((a, b) => b.popularity - a.popularity).slice(0, 8),
  buzz: () => {
    // titles ordered by a fake "talked-about-this-week" metric
    const buzzData = [
      { id: 102, mentions: 12480, change: "+340%", source: "TikTok · #LastOfUs" },
      { id: 101, mentions: 8920, change: "+120%", source: "Reddit · r/television" },
      { id: 107, mentions: 7340, change: "+85%", source: "X · #Severance" },
      { id: 105, mentions: 6210, change: "+67%", source: "Letterboxd reviews" },
      { id: 130, mentions: 4880, change: "+44%", source: "NYT recommended" },
      { id: 132, mentions: 3120, change: "+28%", source: "TikTok BookTok" },
      { id: 122, mentions: 2940, change: "+19%", source: "Twitter / X" },
      { id: 111, mentions: 2210, change: "+11%", source: "Awards chatter" },
    ];
    return buzzData.map(b => ({ ...b, item: TITLES_BY_ID[b.id] })).filter(b => b.item);
  },
  credits: (id) => (TITLES_BY_ID[id]?.castIds || []).map(aid => ACTORS[aid]),
  similar: (id) => {
    const t = TITLES_BY_ID[id]; if (!t) return [];
    return (t.similarIds || []).map(s => TITLES_BY_ID[s]).filter(Boolean);
  },
  actorCredits: (id) => {
    const direct = TITLES_BY_ACTOR[id] || [];
    if (direct.length >= 4) return [...direct].sort((a, b) => b.popularity - a.popularity);
    // pad deterministically so filmography is full
    const padded = [...direct];
    for (const t of TITLES) {
      if (padded.find(p => p.id === t.id)) continue;
      if ((id + t.id) % 3 !== 0) continue;
      padded.push(t);
      if (padded.length >= 12) break;
    }
    return padded.sort((a, b) => b.popularity - a.popularity);
  },
  actor: (id) => ACTORS[id],
  title: (id) => TITLES_BY_ID[id],
};

// AI extraction sim — fuzzy keyword + half-remembered phrases
const PHRASE_HINTS = [
  { match: ["bear", "chicago", "chef", "kitchen", "carmy"], titleId: 101, conf: "high" },
  { match: ["last of us", "joel", "ellie", "fungus", "infected", "zombie"], titleId: 102, conf: "high" },
  { match: ["succession", "roy", "media", "tycoon"], titleId: 103, conf: "high" },
  { match: ["dune", "paul", "fremen", "spice", "arrakis"], titleId: 105, conf: "high" },
  { match: ["oppenheimer", "atomic", "bomb", "nolan"], titleId: 106, conf: "high" },
  { match: ["severance", "innie", "outie", "lumon"], titleId: 107, conf: "high" },
  { match: ["fleabag", "phoebe", "waller-bridge", "priest"], titleId: 108, conf: "high" },
  { match: ["mandalorian", "grogu", "baby yoda"], titleId: 110, conf: "high" },
  { match: ["poor things", "bella", "yorgos", "lanthimos"], titleId: 111, conf: "medium" },
  { match: ["hacks", "vegas", "comedian", "deborah"], titleId: 115, conf: "medium" },
  { match: ["past lives", "korean", "celine song"], titleId: 122, conf: "medium" },
  { match: ["slow horses", "mi5", "spy", "british"], titleId: 130, conf: "medium" },
  { match: ["ted lasso", "soccer", "football"], titleId: 131, conf: "high" },
  { match: ["pachinko", "korean immigrant", "min jin lee"], titleId: 132, conf: "medium" },
  { match: ["silo", "post-apocalyptic", "underground"], titleId: 133, conf: "medium" },
];

function extractTitleSync(input) {
  const q = (input || "").toLowerCase();
  // direct title hit?
  for (const t of TITLES) {
    if (q.includes(t.title.toLowerCase())) {
      return { title: t.title, confidence: "high", reasoning: `matched "${t.title}" directly`, candidates: [t.id] };
    }
  }
  // phrase hint?
  let best = null, bestScore = 0;
  for (const h of PHRASE_HINTS) {
    const hits = h.match.filter(m => q.includes(m)).length;
    if (hits > bestScore) { bestScore = hits; best = h; }
  }
  if (best && bestScore > 0) {
    const t = TITLES_BY_ID[best.titleId];
    const conf = bestScore >= 2 ? "high" : best.conf === "high" ? "medium" : "low";
    return {
      title: t.title, confidence: conf,
      reasoning: bestScore >= 2 ? `matched ${bestScore} keywords from your description` : "best guess from a couple of clues",
      candidates: [t.id],
    };
  }
  return { title: null, confidence: "low", reasoning: "couldn't pin down a title from that — try saying a name or a more specific detail" };
}

window.HEARD_DATA = {
  POSTER, BG, STREAMERS, STREAMER_BY_ID, MOODS, MOOD_BLURBS,
  ACTORS, TITLES, TITLES_BY_ID, MockAPI, extractTitleSync,
};
