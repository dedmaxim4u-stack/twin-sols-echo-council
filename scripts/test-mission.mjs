import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../dist/data.js", import.meta.url), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const { events } = sandbox.window.GAME_DATA;
const clamp = n => Math.max(0, Math.min(100, n));
const pair = (a, b) => [a, b].sort().join("-");
const avg = values => values.reduce((sum, value) => sum + value, 0) / values.length;

function initial() {
  return {
    sol: 1,
    resources: { power: 78, air: 76, radiation: 70, science: 5 },
    modules: { greenhouse: 68, comms: 66, shelter: 61, rover: 74 },
    crew: Object.fromEntries(["jack", "maya", "riley", "theo"].map(id => [id, { health: 100, fatigue: 12, trust: 50 }])),
    relations: { [pair("jack", "riley")]: 48, [pair("maya", "theo")]: 55, [pair("jack", "maya")]: 58, [pair("jack", "theo")]: 51, [pair("maya", "riley")]: 62, [pair("riley", "theo")]: 57 },
    flags: {}, scheduled: []
  };
}

function copy(value) { return JSON.parse(JSON.stringify(value)); }
function climate(state) { return Math.round(avg(Object.values(state.relations))); }
function allowed(state, requirement) {
  if (!requirement) return true;
  if (requirement.kind === "module") return state.modules[requirement.key] >= requirement.min;
  if (requirement.kind === "crewHealth") return state.crew[requirement.key].health >= requirement.min;
  if (requirement.kind === "flag") return Boolean(state.flags[requirement.key]) === requirement.value;
  if (requirement.kind === "combined") return state.modules[requirement.module] >= requirement.min && climate(state) >= requirement.relationMin;
  return true;
}
function apply(state, effects, schedule = true) {
  for (const [key, value] of Object.entries(effects.resources || {})) state.resources[key] = clamp((state.resources[key] || 0) + value);
  for (const [key, value] of Object.entries(effects.modules || {})) state.modules[key] = clamp((state.modules[key] || 0) + value);
  for (const [id, changes] of Object.entries(effects.crew || {})) for (const [key, value] of Object.entries(changes)) state.crew[id][key] = clamp(state.crew[id][key] + value);
  for (const [key, value] of Object.entries(effects.relations || {})) state.relations[key] = clamp((state.relations[key] || 50) + value);
  Object.assign(state.flags, effects.flags || {});
  if (schedule) for (const item of effects.schedule || []) state.scheduled.push({ ...copy(item), dueSol: state.sol + item.delay });
}
function morning(state) {
  if (state.sol > 1) {
    state.resources.power = clamp(state.resources.power - 2);
    state.resources.air = clamp(state.resources.air - 2);
    for (const person of Object.values(state.crew)) person.fatigue = clamp(person.fatigue - 6);
  }
  const due = state.scheduled.filter(item => item.dueSol <= state.sol);
  state.scheduled = state.scheduled.filter(item => item.dueSol > state.sol);
  due.forEach(item => apply(state, item.effects || {}, false));
}
function ending(state) {
  const low = Math.min(state.resources.power, state.resources.air, state.resources.radiation);
  const trust = avg(Object.values(state.crew).map(person => person.trust));
  if (state.flags.final_rover_relay && climate(state) >= 60 && trust >= 60) return "trueHome";
  if (state.flags.final_rover_relay && state.resources.science >= 60) return "pathfinder";
  if (state.flags.final_legacy && state.modules.greenhouse >= 70) return "greenDawn";
  if (state.flags.final_legacy && state.resources.science >= 75 && low < 20) return "scienceAtAnyCost";
  if (state.flags.final_legacy) return "lastMessage";
  if (state.flags.final_shelter && (climate(state) < 50 || trust < 45)) return "brokenCouncil";
  if (state.flags.final_shelter && state.modules.comms < 30) return "silentStation";
  if (state.flags.final_shelter && low < 8) return "redNomads";
  return "heldTogether";
}

const reached = new Map();
const finals = [];
function walk(state, sol, path) {
  state.sol = sol;
  morning(state);
  const missionEvent = events[sol - 1];
  for (let choiceIndex = 0; choiceIndex < missionEvent.choices.length; choiceIndex++) {
    const choice = missionEvent.choices[choiceIndex];
    if (!allowed(state, choice.requirement)) continue;
    const next = copy(state);
    const effects = copy(choice.effects || {});
    if (sol === 2) {
      effects.resources ||= {};
      effects.resources.radiation = (effects.resources.radiation || 0) - 4;
    }
    apply(next, effects);
    const nextPath = [...path, choiceIndex + 1];
    if (sol === 10) {
      finals.push(next);
      const key = ending(next);
      if (!reached.has(key)) reached.set(key, { path: nextPath, state: next });
    } else walk(next, sol + 1, nextPath);
  }
}

walk(initial(), 1, []);
for (const flag of ["final_shelter", "final_legacy", "final_rover_relay"]) {
  const group = finals.filter(state => state.flags[flag]);
  const range = fn => [Math.min(...group.map(fn)), Math.max(...group.map(fn))].map(Math.round).join("–");
  console.log(`RANGE ${flag} count=${group.length} low=${range(s => Math.min(s.resources.power,s.resources.air,s.resources.radiation))} science=${range(s => s.resources.science)} comms=${range(s => s.modules.comms)} climate=${range(climate)} trust=${range(s => avg(Object.values(s.crew).map(p => p.trust)))}`);
}
const required = ["trueHome", "greenDawn", "pathfinder", "scienceAtAnyCost", "silentStation", "brokenCouncil", "redNomads", "lastMessage", "heldTogether"];
for (const key of required) {
  const result = reached.get(key);
  console.log(`${result ? "PASS" : "FAIL"} ${key}${result ? ` choices=${result.path.join("")}` : ""}`);
}
if (required.some(key => !reached.has(key))) process.exitCode = 1;
