import { getUserId } from "./storage.js";

const userId = getUserId();
const params = new URLSearchParams(window.location.search);
const exid = params.get("exid");

let exercise;
let running = false;

async function load() {
  const res = await fetch("/api/exercises");
  const all = await res.json();

  exercise = all.find(e => e.ExID === exid);

  document.getElementById("img").src = exercise.Image1;
  document.getElementById("instructions").innerText = exercise.Instructions;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function startWorkout() {
  running = true;

  await sleep(5000);

  for (let s = 0; s < exercise.SetsCount; s++) {

    for (let r = 0; r < exercise.RepCount; r++) {
      if (!running) return;

      document.getElementById("status").innerText =
        `Set ${s + 1}, Rep ${r + 1}`;

      await sleep(exercise.RepDurationSec * 1000);
    }

    if (s < exercise.SetsCount - 1) {
      document.getElementById("status").innerText = "Rest";
      await sleep(exercise.SetBreakSec * 1000);
    }
  }

  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserID: userId,
      ExID: exid,
      CompletedTime: Math.floor(Date.now() / 1000)
    })
  });

  window.location = "/";
}

document.getElementById("start").onclick = startWorkout;

document.getElementById("leave").onclick = () => {
  running = false;
  window.location = "/";
};

load();
