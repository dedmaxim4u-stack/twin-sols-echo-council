(() => {
  "use strict";
  const { crew: CREW, sources: SOURCES, events: EVENTS, endings: ENDINGS } = window.GAME_DATA;
  const $ = s => document.querySelector(s);
  const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
  const clone = v => JSON.parse(JSON.stringify(v));
  const pairKey = (a, b) => [a, b].sort().join("-");
  const average = values => values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);

  const ROOMS = {
    hub: { name: "COMMAND HUB", subtitle: "The crew gathers here to plan the day.", bg: "assets/vn/hub.png", icon: "⌂" },
    greenhouse: { name: "GREENHOUSE", subtitle: "Food, oxygen, and patient work grow together.", bg: "assets/vn/greenhouse.png", icon: "♧", module: "greenhouse" },
    engineering: { name: "LIFE SUPPORT BAY", subtitle: "Air recyclers, water filters, and the power bus.", bg: "assets/vn/engineering.png", icon: "⚡", module: "shelter" },
    medbay: { name: "MEDBAY", subtitle: "Rest is a mission resource too.", bg: "assets/vn/medbay.png", icon: "+" },
    comms: { name: "SCIENCE & COMMS", subtitle: "Earth answers late, so Echo must think ahead.", bg: "assets/vn/comms.png", icon: "◉", module: "comms" },
    rover: { name: "ROVER BAY", subtitle: "Every trip spends power and radiation margin.", bg: "assets/vn/rover.png", icon: "◎", module: "rover" }
  };
  const SHEETS = Object.fromEntries(Object.keys(CREW).map(id => [id, `assets/vn/${id}-sheet.png`]));
  const schedules = {
    jack: ["engineering", "rover", "engineering", "hub", "rover", "engineering", "hub", "engineering", "rover", "hub"],
    maya: ["medbay", "hub", "medbay", "engineering", "medbay", "hub", "medbay", "engineering", "medbay", "hub"],
    riley: ["greenhouse", "greenhouse", "hub", "greenhouse", "engineering", "greenhouse", "hub", "greenhouse", "rover", "hub"],
    theo: ["comms", "comms", "rover", "comms", "hub", "comms", "comms", "hub", "comms", "hub"]
  };

  const screens = { start: $("#start-screen"), game: $("#game-screen"), ending: $("#ending-screen") };
  const ui = {
    start: $("#start-button"), about: $("#about-button"), sol: $("#sol-number"), phase: $("#phase-label"), resources: $("#resource-strip"),
    bg: $("#location-bg"), stage: $("#location-stage"), place: $("#location-name"), subtitle: $("#location-subtitle"), time: $("#time-label"),
    characters: $("#character-layer"), roomActions: $("#room-actions"), speaker: $("#speaker-name"), dialogue: $("#dialogue-text"), choices: $("#choice-grid"),
    actions: $("#action-counter"), hint: $("#advance-hint"), mapButton: $("#map-button"), status: $("#status-button"), data: $("#data-button"), sound: $("#sound-button"), source: $("#source-button"),
    map: $("#map-overlay"), mapGrid: $("#map-grid"), council: $("#council-button"), modal: $("#modal"), modalKicker: $("#modal-kicker"), modalTitle: $("#modal-title"), modalBody: $("#modal-body"),
    cutscene: $("#cutscene"), cutBg: $("#cutscene-bg"), cutSprite: $("#cutscene-sprite"), cutKicker: $("#cutscene-kicker"), cutTitle: $("#cutscene-title"), cutText: $("#cutscene-text"), chips: $("#effect-chips"), continue: $("#continue-button"),
    endingTitle: $("#ending-title"), endingSummary: $("#ending-summary"), endingStats: $("#ending-stats"), causeMap: $("#cause-map"), epilogues: $("#epilogue-list"), replay: $("#replay-button"), rewind: $("#rewind-button")
  };

  const initialState = () => ({
    sol: 1, phase: "explore", location: "hub", actionsLeft: 2, preparedSol: 0,
    resources: { power: 78, air: 76, radiation: 70, science: 5 },
    modules: { greenhouse: 68, comms: 66, shelter: 61, rover: 74 },
    crew: Object.fromEntries(Object.keys(CREW).map(id => [id, { health: 100, fatigue: 12, trust: 50 }])),
    relations: { [pairKey("jack", "riley")]: 48, [pairKey("maya", "theo")]: 55, [pairKey("jack", "maya")]: 58, [pairKey("jack", "theo")]: 51, [pairKey("maya", "riley")]: 62, [pairKey("riley", "theo")]: 57 },
    flags: {}, scheduled: [], history: [], talkedToday: {}, workedToday: {}, moods: {}, notices: [], sound: true, finalSnapshot: null, resolvedSol: 0
  });
  let state = initialState();
  let currentEvent = EVENTS[0];
  let typingTimer = null;
  let audioContext = null;

  function switchScreen(name) { Object.entries(screens).forEach(([key, el]) => el.classList.toggle("active", key === name)); }
  function save() { localStorage.setItem("twin-sols-save-v2", JSON.stringify(state)); }
  function load() { try { const raw = localStorage.getItem("twin-sols-save-v2"); if (!raw) return false; const parsed = JSON.parse(raw); if (!parsed?.sol || parsed.sol > 10) return false; state = parsed; return true; } catch { return false; } }
  function reset() { localStorage.removeItem("twin-sols-save-v2"); state = initialState(); }
  function initAudio() { if (!audioContext) { const Ctx = window.AudioContext || window.webkitAudioContext; if (Ctx) audioContext = new Ctx(); } if (audioContext?.state === "suspended") audioContext.resume(); }
  function blip(id = "theo") { if (!state.sound || !audioContext) return; const v = CREW[id]?.voice || CREW.theo.voice; const o = audioContext.createOscillator(); const g = audioContext.createGain(); o.type = v.wave; o.frequency.value = v.frequency + Math.random() * 18; g.gain.setValueAtTime(.025, audioContext.currentTime); g.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .035); o.connect(g).connect(audioContext.destination); o.start(); o.stop(audioContext.currentTime + .04); }
  function typeLine(speaker, text, voice = null) { clearInterval(typingTimer); ui.speaker.textContent = speaker; ui.dialogue.textContent = ""; let i = 0; const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches; if (reduced) { ui.dialogue.textContent = text; return; } typingTimer = setInterval(() => { ui.dialogue.textContent += text[i++] || ""; if (i % 4 === 0 && voice) blip(voice); if (i >= text.length) clearInterval(typingTimer); }, 9); }

  function crewRoom(id) { return schedules[id][(state.sol - 1) % schedules[id].length]; }
  function crewHere(room = state.location) { return Object.keys(CREW).filter(id => crewRoom(id) === room); }
  function moodFor(id) { const s = state.crew[id]; if (state.moods[id]) return state.moods[id]; if (s.health < 45 || s.fatigue > 68) return "worried"; if (s.trust < 30) return "angry"; if (s.trust > 70) return "relieved"; return "calm"; }
  function climate() { return Math.round(average(Object.values(state.relations))); }
  function avgTrust() { return average(Object.values(state.crew).map(c => c.trust)); }
  function avgHealth() { return average(Object.values(state.crew).map(c => c.health)); }
  function currentSource() { return SOURCES[currentEvent?.source] || SOURCES.osdr; }

  function prepareSol() {
    currentEvent = EVENTS[state.sol - 1];
    if (!currentEvent) return finishMission();
    if (state.preparedSol !== state.sol) {
      state.preparedSol = state.sol; state.phase = "explore"; state.location = "hub"; state.actionsLeft = 2; state.talkedToday = {}; state.workedToday = {}; state.moods = {}; state.notices = [];
      applyDueEffects();
      Object.values(state.crew).forEach(person => { person.fatigue = clamp(person.fatigue - 4); if (person.fatigue > 72) person.health = clamp(person.health - 2); });
      if (state.sol === 10 && !state.finalSnapshot) state.finalSnapshot = clone(state);
    }
    renderScene(true); save();
  }

  function renderScene(morning = false) {
    currentEvent = EVENTS[state.sol - 1];
    const room = ROOMS[state.location];
    ui.sol.textContent = `SOL ${String(state.sol).padStart(2, "0")}`;
    ui.phase.textContent = state.phase === "council" ? "EVENING COUNCIL" : "FREE TIME";
    ui.time.textContent = state.phase === "council" ? "18:40" : state.actionsLeft === 2 ? "08:10" : state.actionsLeft === 1 ? "12:30" : "17:50";
    ui.place.textContent = room.name; ui.subtitle.textContent = room.subtitle; ui.actions.textContent = state.phase === "council" ? "BIG DECISION" : `${state.actionsLeft} FREE ACTION${state.actionsLeft === 1 ? "" : "S"}`;
    ui.actions.style.background = state.actionsLeft ? "#e8f1e7" : "#f3d6cf";
    if (!ui.bg.src.endsWith(room.bg.replace("assets/", "/assets/"))) { ui.stage.classList.add("room-change"); setTimeout(() => { ui.bg.src = room.bg; ui.stage.classList.remove("room-change"); }, 120); }
    renderResources(); renderCharacters(); renderRoomActions();
    if (state.phase === "council") renderCouncil();
    else if (morning) {
      const echo = state.notices.length ? ` An earlier choice returns today: ${state.notices.join(" ")}` : "";
      typeLine(currentEvent.speaker, `${currentEvent.text}${echo}`, speakerId(currentEvent.speaker));
      ui.choices.innerHTML = ""; ui.hint.textContent = "Explore two rooms, then join the evening council";
    }
    renderMap();
  }

  function renderResources() {
    const items = [["power", "⚡", "POWER"], ["air", "◌", "LIFE SUPPORT"], ["radiation", "◇", "RAD SAFETY"]];
    ui.resources.innerHTML = items.map(([key, icon, label]) => `<div class="resource ${state.resources[key] < 30 ? "low" : ""}" title="${label}: ${Math.round(state.resources[key])}%"><span class="resource-icon">${icon}</span><span><b>${label}</b><span class="resource-track"><i class="resource-fill" style="width:${state.resources[key]}%"></i></span></span><strong>${Math.round(state.resources[key])}</strong></div>`).join("");
  }

  function renderCharacters() {
    let ids = state.phase === "council" ? [speakerId(currentEvent.speaker)].filter(Boolean) : crewHere();
    ui.characters.innerHTML = ids.length ? ids.map(id => `<button class="character" data-character="${id}" aria-label="Talk to ${CREW[id].name}"><span class="character-sprite expression ${moodFor(id)}" style="background-image:url('${SHEETS[id]}')"></span><span class="name-tag">${CREW[id].name} • ${moodFor(id).toUpperCase()}</span></button>`).join("") : "";
    ui.characters.querySelectorAll("[data-character]").forEach(button => button.addEventListener("click", () => { if (state.phase === "explore") openTalk(button.dataset.character); }));
  }

  function renderRoomActions() {
    if (state.phase !== "explore") { ui.roomActions.innerHTML = ""; return; }
    const configs = {
      greenhouse: ["Tend the oxygen crop", "Power −4 • Greenhouse +7 • Air +2", { resources: { power: -4, air: 2 }, modules: { greenhouse: 7 }, crew: { riley: { fatigue: 4 } } }],
      engineering: ["Tune the air recycler", "Power −3 • Life Support +5 • Jack tires", { resources: { power: -3, air: 5 }, modules: { shelter: 5 }, crew: { jack: { fatigue: 5 } } }],
      medbay: ["Schedule recovery time", "Power −2 • Most tired crewmate rests • Science −1", { resources: { power: -2, science: -1 } }],
      comms: ["Decode a delayed packet", "Power −3 • Comms +5 • Science +2", { resources: { power: -3, science: 2 }, modules: { comms: 5 }, crew: { theo: { fatigue: 4 } } }],
      rover: ["Charge and test the rover", "Power −5 • Rover +7 • Science +1", { resources: { power: -5, science: 1 }, modules: { rover: 7 }, crew: { jack: { fatigue: 3 } } }]
    };
    const item = configs[state.location];
    if (!item) { ui.roomActions.innerHTML = ""; return; }
    const used = state.workedToday[state.location] || state.actionsLeft <= 0;
    ui.roomActions.innerHTML = `<button class="room-action" ${used ? "disabled" : ""}><b>${used ? "✓ Work completed" : item[0]}</b><small>${item[1]}</small></button>`;
    ui.roomActions.querySelector("button")?.addEventListener("click", () => workRoom(item));
  }

  function workRoom(config) {
    if (state.actionsLeft <= 0 || state.workedToday[state.location]) return;
    const effects = clone(config[2]);
    if (state.location === "medbay") { const id = Object.keys(state.crew).sort((a, b) => state.crew[b].fatigue - state.crew[a].fatigue)[0]; effects.crew = { [id]: { fatigue: -12, health: 4, trust: 2 } }; state.moods[id] = "relieved"; }
    const chips = applyEffects(effects); state.workedToday[state.location] = true; consumeAction();
    typeLine("STATION LOG", `${config[0]} complete. It helped one part of Echo Station, but ${costSentence(chips)}`, null);
    state.history.push({ sol: state.sol, title: config[0], cause: `You used limited free time in the ${ROOMS[state.location].name}.` });
    renderScene(); save();
  }

  function costSentence(chips) { const negative = chips.filter(c => !c.positive).map(c => c.text.toLowerCase()); return negative.length ? `${negative.join(" and ")} was the cost.` : "crew time was the cost."; }
  function consumeAction() { state.actionsLeft = Math.max(0, state.actionsLeft - 1); if (state.actionsLeft === 0) ui.hint.textContent = "Free time is over — go to the evening council"; }

  function openTalk(id) {
    const person = CREW[id]; const stats = state.crew[id]; const already = state.talkedToday[id];
    typeLine(person.short, stats.fatigue > 68 ? person.talks.tired : stats.trust < 32 ? person.talks.low : stats.trust > 70 ? person.talks.high : person.talks.default, id);
    if (already || state.actionsLeft <= 0) { ui.choices.innerHTML = `<button class="choice" disabled><b>${already ? "You already spoke today" : "No free actions left"}</b><small>Return tomorrow, or go to council.</small></button>`; return; }
    const councilLine = currentEvent.council[id];
    ui.choices.innerHTML = `
      <button class="choice" data-talk="listen"><b>Listen without interrupting</b><small>Trust +4 • Fatigue −3 • uses 1 action</small></button>
      <button class="choice" data-talk="risk"><b>Ask about today's risk</b><small>Reveals their council advice • Trust +2 • uses 1 action</small></button>
      <button class="choice" data-talk="push"><b>Ask for extra help</b><small>Improves this room • Fatigue +7 • Trust may fall • uses 1 action</small></button>`;
    ui.choices.querySelectorAll("[data-talk]").forEach(b => b.addEventListener("click", () => resolveTalk(id, b.dataset.talk, councilLine)));
  }

  function resolveTalk(id, kind, councilLine) {
    if (state.actionsLeft <= 0 || state.talkedToday[id]) return;
    state.talkedToday[id] = true; let line; let effects;
    if (kind === "listen") { effects = { crew: { [id]: { trust: 4, fatigue: -3 } } }; line = "Thanks for listening. It is easier to solve a hard problem when someone hears the whole thing."; state.moods[id] = "relieved"; }
    else if (kind === "risk") { effects = { crew: { [id]: { trust: 2 } } }; line = councilLine || "The safest-looking choice still has a cost. Check what it changes tomorrow."; state.moods[id] = "calm"; }
    else { const module = ROOMS[state.location].module; effects = { crew: { [id]: { fatigue: 7, trust: -2 } } }; if (module) effects.modules = { [module]: 6 }; else effects.resources = { science: 2 }; line = "I can do it, but tired hands make tomorrow's work harder. Please remember that."; state.moods[id] = "worried"; }
    applyEffects(effects); consumeAction(); state.history.push({ sol: state.sol, title: `Talked with ${CREW[id].name}`, cause: kind === "push" ? "You gained extra work by spending crew energy and trust." : "You spent limited time listening before deciding." });
    typeLine(CREW[id].short, line, id); ui.choices.innerHTML = ""; ui.actions.textContent = `${state.actionsLeft} FREE ACTION${state.actionsLeft === 1 ? "" : "S"}`; ui.time.textContent = state.actionsLeft === 1 ? "12:30" : "17:50"; renderResources(); renderCharacters(); renderRoomActions(); renderMap(); save();
  }

  function renderMap() {
    ui.mapGrid.innerHTML = Object.entries(ROOMS).map(([id, room]) => { const people = crewHere(id).map(p => CREW[p].short).join(" • ") || "No crew here"; const system = room.module ? `${Math.round(state.modules[room.module])}% condition` : "Council room"; return `<button class="map-room ${state.location === id ? "current" : ""}" data-room="${id}" style="background-image:url('${room.bg}')"><b>${room.icon} ${room.name}</b><span>${people}</span><small>${system}</small></button>`; }).join("");
    ui.mapGrid.querySelectorAll("[data-room]").forEach(b => b.addEventListener("click", () => travel(b.dataset.room)));
    ui.council.textContent = state.actionsLeft ? `Go early: crew rests, science −${state.actionsLeft} →` : "Go to evening council →";
  }
  function travel(room) { if (state.phase !== "explore") return; state.location = room; ui.map.hidden = true; renderScene(); const ids = crewHere(); typeLine("MISSION LOG", ids.length ? `${ids.map(id => CREW[id].name).join(" and ")} ${ids.length > 1 ? "are" : "is"} here. Moving between rooms does not use an action.` : "The room is quiet. You can still work on its system."); save(); }

  function showCouncil() {
    if (state.phase !== "explore") return;
    if (state.actionsLeft > 0) {
      const unused = state.actionsLeft;
      const crewRest = Object.fromEntries(Object.keys(CREW).map(id => [id, { fatigue: -2 * unused }]));
      applyEffects({ resources: { science: -unused }, crew: crewRest });
      state.history.push({ sol: state.sol, title: "Ended exploration early", cause: `The crew gained a little rest, but ${unused} unused action${unused === 1 ? "" : "s"} cost mission progress.` });
      state.actionsLeft = 0;
    }
    state.phase = "council"; state.location = "hub"; ui.map.hidden = true; renderScene(); save();
  }
  function renderCouncil() {
    typeLine(currentEvent.speaker, currentEvent.text, speakerId(currentEvent.speaker));
    if (state.resolvedSol === state.sol) {
      ui.choices.innerHTML = `<button class="choice" id="resume-after-choice"><b>The decision is already recorded</b><small>Continue without applying its effects twice.</small></button>`;
      $("#resume-after-choice").addEventListener("click", continueAfterCutscene);
      return;
    }
    ui.choices.innerHTML = currentEvent.choices.map((choice, i) => { const ok = requirementMet(choice.requirement); return `<button class="choice" data-decision="${i}" ${ok ? "" : "disabled"}><b>${i + 1}. ${choice.title}</b><small>${ok ? choice.hint : `LOCKED: ${choice.requirement.label}`}</small></button>`; }).join("");
    ui.choices.querySelectorAll("[data-decision]").forEach(b => b.addEventListener("click", () => chooseDecision(Number(b.dataset.decision))));
    ui.hint.textContent = "Every council choice has an immediate or delayed cost";
  }

  function speakerId(speaker) { const upper = String(speaker).toUpperCase(); return Object.keys(CREW).find(id => CREW[id].short === upper) || null; }
  function requirementMet(req) { if (!req) return true; if (req.kind === "module") return state.modules[req.key] >= req.min; if (req.kind === "crewHealth") return state.crew[req.key].health >= req.min; if (req.kind === "flag") return !!state.flags[req.key] === (req.value ?? true); if (req.kind === "combined") return state.modules[req.module] >= req.min && climate() >= req.relationMin; return true; }

  function applyEffects(effects = {}, options = { scheduleNested: true }) {
    const chips = [];
    const labels = { air: "LIFE SUPPORT", radiation: "RAD SAFETY" };
    if (effects.resources) Object.entries(effects.resources).forEach(([key, d]) => { state.resources[key] = clamp((state.resources[key] ?? 0) + d); chips.push({ text: `${labels[key] || key.toUpperCase()} ${d > 0 ? "+" : ""}${d}`, positive: d > 0 }); });
    if (effects.modules) Object.entries(effects.modules).forEach(([key, d]) => { state.modules[key] = clamp((state.modules[key] ?? 0) + d); chips.push({ text: `${key.toUpperCase()} ${d > 0 ? "+" : ""}${d}`, positive: d > 0 }); });
    if (effects.crew) Object.entries(effects.crew).forEach(([id, changes]) => Object.entries(changes).forEach(([key, d]) => { state.crew[id][key] = clamp(state.crew[id][key] + d); if (Math.abs(d) >= 4) chips.push({ text: `${CREW[id].short} ${key.toUpperCase()} ${d > 0 ? "+" : ""}${d}`, positive: key === "fatigue" ? d < 0 : d > 0 }); }));
    if (effects.relations) Object.entries(effects.relations).forEach(([key, d]) => { state.relations[key] = clamp((state.relations[key] ?? 50) + d); chips.push({ text: `CREW BOND ${d > 0 ? "+" : ""}${d}`, positive: d > 0 }); });
    if (effects.flags) Object.assign(state.flags, effects.flags);
    if (effects.schedule && options.scheduleNested !== false) { effects.schedule.forEach(item => state.scheduled.push({ ...clone(item), dueSol: state.sol + item.delay })); chips.push({ text: `${effects.schedule.length} FUTURE ECHO`, positive: false }); }
    return chips;
  }
  function applyDueEffects() { const due = state.scheduled.filter(i => i.dueSol <= state.sol); state.scheduled = state.scheduled.filter(i => i.dueSol > state.sol); due.forEach(item => { applyEffects(item.effects, { scheduleNested: false }); state.notices.push(`${item.title}. ${item.text}`); state.history.push({ sol: state.sol, title: item.title, cause: item.text, delayed: true }); }); }

  function chooseDecision(index) {
    initAudio(); const choice = currentEvent.choices[index]; if (!choice || !requirementMet(choice.requirement)) return;
    const snapshot = clone(state); const chips = applyEffects(choice.effects); state.resolvedSol = state.sol; state.history.push({ sol: state.sol, title: choice.title, cause: choice.cause, snapshot });
    save(); showCutscene(choice, chips);
  }
  function showCutscene(choice, chips) {
    const id = choice.cutscene.image; ui.cutBg.src = ROOMS[state.location]?.bg || ROOMS.hub.bg;
    ui.cutSprite.style.backgroundImage = SHEETS[id] ? `url('${SHEETS[id]}')` : "none"; ui.cutSprite.className = `cutscene-sprite expression ${chips.some(c => !c.positive) ? "worried" : "relieved"}`;
    ui.cutKicker.textContent = `SOL ${String(state.sol).padStart(2, "0")} • CONSEQUENCE`; ui.cutTitle.textContent = choice.cutscene.title; ui.cutText.textContent = choice.cutscene.text;
    ui.chips.innerHTML = chips.slice(0, 9).map(c => `<span class="effect-chip ${c.positive ? "positive" : ""}">${c.text}</span>`).join("");
    ui.continue.textContent = state.sol >= 10 ? "Reveal your ending" : "Continue to next sol"; ui.cutscene.hidden = false; blip(id);
  }
  function continueAfterCutscene() { ui.cutscene.hidden = true; if (state.sol >= 4 && (state.resources.air <= 0 || state.resources.radiation <= 0 || avgHealth() < 15)) return finishMission("redNomads"); if (state.sol >= 10) return finishMission(); state.sol += 1; prepareSol(); }

  function endingKey() {
    const c = climate(), trust = avgTrust(); const { power, air, radiation, science } = state.resources; const { greenhouse, comms, rover } = state.modules;
    if (state.flags.final_rover_relay && rover >= 15 && c >= 38) return "pathfinder";
    if (air < 20 || radiation < 18 || avgHealth() < 28) return science >= 55 && comms >= 20 ? "lastMessage" : "redNomads";
    if (c < 30 || trust < 28 || (state.flags.crew_fight && c < 42)) return "brokenCouncil";
    if (science >= 72 && (air < 48 || radiation < 45 || power < 25)) return "scienceAtAnyCost";
    if (comms < 24 && air >= 35) return "silentStation";
    if (greenhouse >= 68 && air >= 45 && state.flags.plants_saved_crew) return "greenDawn";
    if (average([power, air, radiation]) >= 48 && c >= 50 && trust >= 45 && science >= 42) return "trueHome";
    return "heldTogether";
  }
  function finishMission(forced = null) {
    const ending = ENDINGS[forced || endingKey()]; switchScreen("ending"); ui.endingTitle.textContent = ending.title; ui.endingSummary.textContent = ending.summary;
    ui.endingStats.innerHTML = [["POWER", state.resources.power], ["LIFE SUPPORT", state.resources.air], ["RAD SAFETY", state.resources.radiation], ["SCIENCE", state.resources.science]].map(([l, v]) => `<div class="ending-stat"><b>${Math.round(v)}</b><span>${l}</span></div>`).join("");
    ui.causeMap.innerHTML = state.history.filter(x => !x.delayed).slice(-6).map(x => `<div class="cause-item"><b>Sol ${x.sol}: ${x.title}</b><br>${x.cause}</div>`).join("");
    ui.epilogues.innerHTML = Object.keys(CREW).map(id => { const s = state.crew[id]; const fate = s.health < 30 ? "needs a long recovery" : s.fatigue > 78 ? "finally accepts a full rest cycle" : s.trust >= 72 ? "volunteers for your next mission" : s.trust < 28 ? "asks for a different commander" : "stays at Echo Station with new questions"; return `<div class="epilogue-item"><b>${CREW[id].name}</b> ${fate}.</div>`; }).join("");
    localStorage.removeItem("twin-sols-save-v2");
  }

  function openModal(kicker, title, body) { ui.modalKicker.textContent = kicker; ui.modalTitle.textContent = title; ui.modalBody.innerHTML = body; ui.modal.hidden = false; }
  function closeModal() { ui.modal.hidden = true; }
  function openAbout() { openModal("HOW TO PLAY", "A day at Echo Station", `<ol><li><b>Morning:</b> read the real mission problem.</li><li><b>Explore:</b> open the map and visit rooms. You get two actions for a talk or system job.</li><li><b>Council:</b> choose one plan. Every plan spends something now or later.</li><li><b>Consequence:</b> see the cutscene, changed resources, trust, fatigue, and future options.</li></ol><p class="notice">There is no perfect button. The lesson is to understand the trade-off and try a different timeline.</p><p>Expected playtime: about 35–55 minutes for all 10 sols. A short replay to chase another ending takes about 15–25 minutes.</p>`); }
  function openSources() { openModal("SCIENCE LIBRARY", "Real data behind the story", `<p>The story is fictional, but its constraints come from real space research. Static archived examples are never presented as a live forecast.</p><div class="source-list">${Object.values(SOURCES).map(s => `<div class="source-item"><b>${s.label}: ${s.title}</b><p>${s.note}</p><a href="${s.url}" target="_blank" rel="noopener">Open source ↗</a></div>`).join("")}</div>`); }
  function openCurrentSource() { const s = currentSource(); openModal(s.label, s.title, `<p>${currentEvent.dataFact || s.note}</p><p>${s.note}</p><a href="${s.url}" target="_blank" rel="noopener">Open the original source ↗</a>`); }
  function openCrew() { openModal("CREW STATUS", `Crew climate: ${climate()} / 100`, `<p>Trust changes how each person responds. Fatigue makes repairs risky. Relationships can unlock or remove future plans.</p><div class="crew-list">${Object.keys(CREW).map(id => { const p = CREW[id], s = state.crew[id]; return `<div class="crew-status"><img src="${p.image}" alt="${p.name}"><div><b>${p.name}</b><small>${p.role} • ${moodFor(id)}</small><div class="mini-bars">${[["HEALTH", s.health], ["TRUST", s.trust], ["ENERGY", 100 - s.fatigue]].map(([l,v]) => `<span class="mini-bar">${l}<i><span style="width:${v}%"></span></i><b>${Math.round(v)}</b></span>`).join("")}</div></div></div>`; }).join("")}</div>`); }

  function startMission() { initAudio(); if (!load()) reset(); switchScreen("game"); prepareSol(); }
  ui.start.addEventListener("click", startMission); ui.about.addEventListener("click", openAbout); ui.mapButton.addEventListener("click", () => { if (state.phase === "explore") { renderMap(); ui.map.hidden = false; } });
  ui.status.addEventListener("click", openCrew); ui.data.addEventListener("click", openSources); ui.source.addEventListener("click", openCurrentSource); ui.council.addEventListener("click", showCouncil);
  ui.sound.addEventListener("click", () => { initAudio(); state.sound = !state.sound; ui.sound.querySelector("span").textContent = state.sound ? "ON" : "OFF"; save(); });
  ui.continue.addEventListener("click", continueAfterCutscene); ui.replay.addEventListener("click", () => { reset(); switchScreen("game"); prepareSol(); }); ui.rewind.addEventListener("click", () => { if (!state.finalSnapshot) return; state = clone(state.finalSnapshot); switchScreen("game"); prepareSol(); });
  document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => b.dataset.close === "map" ? ui.map.hidden = true : closeModal()));
  [ui.map, ui.modal].forEach(el => el.addEventListener("click", e => { if (e.target === el) el.hidden = true; }));
  document.addEventListener("keydown", e => { if (e.key === "Escape") { ui.map.hidden = true; closeModal(); } if (!ui.cutscene.hidden && (e.key === "Enter" || e.key === " ")) continueAfterCutscene(); if (state.phase === "council" && ["1","2","3"].includes(e.key)) ui.choices.querySelector(`[data-decision="${Number(e.key)-1}"]:not(:disabled)`)?.click(); });
  if (localStorage.getItem("twin-sols-save-v2")) ui.start.textContent = "Continue mission";
})();
