import { getUserId } from "./storage.js";

const userId = getUserId();
let exercises = [];

console.log("[HOME] userId:", userId);

async function load() {
  console.time("[HOME] total load");

  const res = await fetch(`/api/home?userId=${encodeURIComponent(userId)}`);
  console.log("[HOME] /api/home status:", res.status);

  exercises = await res.json();
  console.log("[HOME] exercises loaded:", exercises);

  render();

  console.timeEnd("[HOME] total load");
}

function daysSince(ts) {
  if (!ts) return "Never";

  const diff = Date.now() / 1000 - Number(ts);
  const days = Math.floor(diff / 86400);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function estimatedMinutes(e) {
  const seconds =
    e.SetsCount * (e.RepCount * (e.RepDurationSec + e.RepBreakSec)) +
    (e.SetsCount - 1) * e.SetBreakSec;

  return Math.max(1, Math.round(seconds / 60));
}

function render(filter = "") {
  console.time("[HOME] render");

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

const search = filter.trim().toLowerCase();
const filtered = exercises.filter(e => {
  if (!search) return true;

  const haystack = [
    e.ExID,
    e.Name,
    e.AlternateNames,
    e.MuscleGroups,
    e.DifficultyLevel
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
});

  console.log("[HOME] filtered count:", filtered.length);

  filtered.forEach(e => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img class="card-img" src="${e.Image1 || ""}" alt="${e.Name || ""}">
      <div class="card-body">
        <h3>${e.Name}</h3>
        <p><strong>${e.RepCount}</strong> reps × <strong>${e.SetsCount}</strong> sets</p>
        <p>${e.MuscleGroups}</p>
        <p>~ ${estimatedMinutes(e)} min</p>
        <p>Last: ${daysSince(e.LastCompletedTime)}</p>
      </div>
    `;

    card.onclick = () => {
      console.log("[HOME] opening exercise:", e.ExID);
      window.location = `exercise.html?exid=${encodeURIComponent(e.ExID)}`;
    };

    grid.appendChild(card);
  });

  console.timeEnd("[HOME] render");
}

document.getElementById("filterInput").addEventListener("input", e => {
  render(e.target.value);
});

load();
