import { getUserId } from "./storage.js";

const userId = getUserId();
const params = new URLSearchParams(window.location.search);
const exid = params.get("exid");

let exercise;
let running = false;

console.log("[WORKOUT] exid:", exid);
console.log("[WORKOUT] userId:", userId);

async function load() {
  console.time("[WORKOUT] load exercise");

  const res = await fetch(`/api/exercises?exid=${encodeURIComponent(exid)}`);
  console.log("[WORKOUT] /api/exercises status:", res.status);

  const rows = await res.json();
  exercise = rows[0];

  console.log("[WORKOUT] exercise loaded:", exercise);

  if (!exercise) {
    document.getElementById("status").innerText = "Exercise not found";
    return;
  }

  document.getElementById("exerciseName").innerText = exercise.Name || "";
  
  document.getElementById("img").src = exercise.Image1 || "";
  document.getElementById("instructions").innerText = exercise.Instructions || "";

  /* document.getElementById("details").innerHTML = `
    <p><strong>Reps:</strong> ${exercise.RepCount}</p>
    <p><strong>Rep duration:</strong> ${exercise.RepDurationSec} sec</p>
    <p><strong>Rep break:</strong> ${exercise.RepBreakSec} sec</p>
    <p><strong>Sets:</strong> ${exercise.SetsCount}</p>
    <p><strong>Set break:</strong> ${exercise.SetBreakSec} sec</p>
  `; */
  document.getElementById("details").innerHTML = `
	<p><strong>Sets x Reps :</strong> ${exercise.SetsCount} x ${exercise.RepCount}</p>
    <p><strong>Time : </strong> ${exercise.RepDurationSec} sec/rep</p>
    <p><strong>Breaks:</strong> ${exercise.RepBreakSec} sec/rep & ${exercise.SetBreakSec} sec/set </p>
  `;

  
  console.timeEnd("[WORKOUT] load exercise");
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    console.warn("[WORKOUT] speechSynthesis not supported");
    return;
  }

  console.log("[AUDIO]", text);

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  speechSynthesis.speak(utterance);
}

function setStatus(text) {
  console.log("[STATUS]", text);
  document.getElementById("status").innerText = text;
}

async function countdown(seconds, label = "") {
  for (let i = seconds; i > 0; i--) {
    if (!running) return;

    setStatus(label ? `${label}: ${i}` : `${i}`);
    speak(String(i));

    await sleep(1000);
  }
}

async function repCountdown(setNo, totalSets, repNo, totalReps, seconds) {
  speak(String(repNo));

  for (let i = seconds; i > 0; i--) {
    if (!running) return;

    setStatus(`Set ${setNo}/${totalSets}, Rep ${repNo}/${totalReps} — ${i}s`);
    await sleep(1000);
  }
}

async function startWorkout() {
  if (!exercise) return;

  running = true;
  document.getElementById("start").disabled = true;

  speak("Get ready");
  await countdown(5, "Starting in");

  for (let s = 0; s < exercise.SetsCount; s++) {
    if (!running) return;

    speak(`Set ${s + 1}`);

    for (let r = 0; r < exercise.RepCount; r++) {
      if (!running) return;

      await repCountdown(s + 1, exercise.SetsCount, r + 1, exercise.RepCount, exercise.RepDurationSec);
      speak(String(r + 1));

      await sleep(exercise.RepDurationSec * 1000);

      if (exercise.RepBreakSec > 0) {
        await sleep(exercise.RepBreakSec * 1000);
      }
    }

    if (s < exercise.SetsCount - 1) {
      speak("Rest");
      await countdown(exercise.SetBreakSec, "Rest");
    }
  }

  speak("Exercise complete");
  setStatus("Exercise complete");

  console.time("[WORKOUT] save history");

  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserID: userId,
      ExID: exid,
      CompletedTime: Math.floor(Date.now() / 1000)
    })
  });

  console.timeEnd("[WORKOUT] save history");

  await sleep(3000);
  window.location = "/";
}

document.getElementById("start").onclick = startWorkout;

document.getElementById("leave").onclick = () => {
  running = false;
  speechSynthesis.cancel();
  window.location = "/";
};

load();
