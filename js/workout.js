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

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  speechSynthesis.speak(utterance);
}

function setStatus(text) {
  document.getElementById("status").innerText = text;
}

async function countdown(seconds, label = "") {
  for (let i = seconds; i > 0; i--) {
    if (!running) return;

    const text = label ? `${label}: ${i}` : `${i}`;
    setStatus(text);
    speak(String(i));

    await sleep(1000);
  }
}

async function startWorkout() {
  running = true;

  document.getElementById("start").disabled = true;

  speak("Get ready");
  await countdown(5, "Starting in");

  for (let s = 0; s < exercise.SetsCount; s++) {
    if (!running) return;

    speak(`Set ${s + 1}`);

    for (let r = 0; r < exercise.RepCount; r++) {
      if (!running) return;

      const repText = `Set ${s + 1} of ${exercise.SetsCount}, Rep ${r + 1} of ${exercise.RepCount}`;
      setStatus(repText);
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

  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserID: userId,
      ExID: exid,
      CompletedTime: Math.floor(Date.now() / 1000)
    })
  });

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
