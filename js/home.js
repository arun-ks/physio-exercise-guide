import { getUserId } from "./storage.js";

const userId = getUserId();

let exercises = [];
let historyMap = {};

async function load() {
  const [exRes, histRes] = await Promise.all([
    fetch("/api/exercises"),
    fetch(`/api/history?userId=${userId}`)
  ]);

  exercises = await exRes.json();
  const history = await histRes.json();

  historyMap = {};
  history.forEach(h => {
    historyMap[h.ExID] = h.LastCompletedTime;
  });

  render();
}

function daysSince(ts) {
  if (!ts) return "Never";

  const diff = Date.now() / 1000 - ts;
  return Math.floor(diff / 86400) + " days ago";
}

function render(filter = "") {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  const filtered = exercises.filter(e => {
    if (!filter) return true;
    return e.MuscleGroups.toLowerCase().includes(filter.toLowerCase());
  });

  filtered.forEach(e => {
    const div = document.createElement("div");
    div.className = "card";

    const last = historyMap[e.ExID];

    const duration =
      e.SetsCount *
      (e.RepCount * (e.RepDurationSec + e.RepBreakSec)) +
      (e.SetsCount - 1) * e.SetBreakSec;

    div.innerHTML = `
      <img src="${e.Image1}" onclick="openExercise('${e.ExID}')"/>
      <h3>${e.Name}</h3>
      <p>${e.RepCount} reps × ${e.SetsCount} sets</p>
      <p>${e.MuscleGroups}</p>
      <p>~ ${Math.round(duration / 60)} min</p>
      <p>Last: ${daysSince(last)}</p>
    `;

    div.onclick = () => {
      window.location = `exercise.html?exid=${e.ExID}`;
    };

    grid.appendChild(div);
  });
}

document.getElementById("filterInput").addEventListener("input", (e) => {
  render(e.target.value);
});

load();
