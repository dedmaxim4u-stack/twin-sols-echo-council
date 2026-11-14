(() => {
  "use strict";

  const { crew: CREW, sources: SOURCES, events: EVENTS, endings: ENDINGS } = window.GAME_DATA;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const pairKey = (a, b) => [a, b].sort().join("-");

  const screens = {
    start: $("#start-screen"),
    game: $("#game-screen"),
    ending: $("#ending-screen")
  };

  const ui = {
    startButton: $("#start-button"),
    aboutButton: $("#about-button"),
    sol: $("#sol-number"),
    resources: $("#resource-strip"),
    missionScore: $("#mission-score"),
    moduleGrid: $("#module-grid"),
    echoCount: $("#echo-count"),
    echoList: $("#echo-list"),
    sceneKicker: $("#scene-kicker"),
    sceneTitle: $("#scene-title"),
    crewStage: $("#crew-stage"),
    alertRibbon: $("#alert-ribbon"),
    speaker: $("#speaker-name"),
    dialogue: $("#dialogue-text"),
    councilGrid: $("#council-grid"),
    choiceGrid: $("#choice-grid"),
    crewCards: $("#crew-cards"),
    talkCounter: $("#talk-counter"),
    crewClimate: $("#crew-climate"),
    relationshipLines: $("#relationship-lines"),
    crewButton: $("#crew-button"),
    dataButton: $("#data-button"),
    soundButton: $("#sound-button"),
    sourceButton: $("#source-button"),
    modal: $("#modal"),
    modalClose: $("#modal-close"),
    modalKicker: $("#modal-kicker"),
    modalTitle: $("#modal-title"),
    modalBody: $("#modal-body"),
    cutscene: $("#cutscene"),
    cutsceneImage: $("#cutscene-image"),
    cutsceneKicker: $("#cutscene-kicker"),
    cutsceneTitle: $("#cutscene-title"),
    cutsceneText: $("#cutscene-text"),
    effectChips: $("#effect-chips"),
    continueButton: $("#continue-button"),
    endingTitle: $("#ending-title"),
    endingSummary: $("#ending-summary"),
    endingStats: $("#ending-stats"),
    epilogueList: $("#epilogue-list"),
    causeMap: $("#cause-map"),
    twinTimeline: $("#twin-timeline"),
    replayButton: $("#replay-button"),
    rewindButton: $("#rewind-button")
  };

  const initialState = () => ({
    sol: 1,
    resources: { power: 78, air: 76, radiation: 70, science: 5 },
    modules: { greenhouse: 68, comms: 66, shelter: 61, rover: 74 },
    crew: Object.fromEntries(Object.keys(CREW).map(id => [id, { health: 100, fatigue: 12, trust: 50 }])),
    relations: {
      [pairKey("jack", "riley")]: 48,
      [pairKey("maya", "theo")]: 55,
      [pairKey("jack", "maya")]: 58,
      [pairKey("jack", "theo")]: 51,
      [pairKey("maya", "riley")]: 62,
      [pairKey("riley", "theo")]: 57
    },
    flags: {},
    scheduled: [],
    history: [],
    talksLeft: 1,
    sound: true,
    lastAlternatives: [],
    currentChoice: null,
    finalSnapshot: null,
    notices: []
  });

  let state = initialState();
  let currentEvent = EVENTS[0];
  let audioContext = null;
  let typingTimer = null;

  function switchScreen(name) {
    Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle("active", key === name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveGame() {
    localStorage.setItem("twin-sols-save-v1", JSON.stringify(state));
  }

  function loadGame() {
    const raw = localStorage.getItem("twin-sols-save-v1");
    if (!raw) return false;
    try {
      const loaded = JSON.parse(raw);
      if (!loaded || loaded.sol < 1 || loaded.sol > 10) return false;
      state = loaded;
      return true;
    } catch {
      return false;
    }
  }

  function resetGame() {
    localStorage.removeItem("twin-sols-save-v1");
    state = initialState();
  }

  function initializeAudio() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext?.state === "suspended") audioContext.resume();
  }

  function playBlip(crewId = "theo", offset = 0) {
    if (!state.sound || !audioContext) return;
    const voice = CREW[crewId]?.voice || CREW.theo.voice;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = voice.wave;
    osc.frequency.value = voice.frequency + (offset % 4) * 7;
    gain.gain.setValueAtTime(.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .045);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + .05);
  }

  function speakerToCrewId(speaker) {
    return Object.keys(CREW).find(id => CREW[id].short === speaker) || "theo";
  }

  function typeDialogue(speaker, text) {
    clearInterval(typingTimer);
    ui.speaker.textContent = speaker;
    ui.dialogue.textContent = "";
    const voiceId = speakerToCrewId(speaker);
    let index = 0;
    typingTimer = setInterval(() => {
      index += 1;
      ui.dialogue.textContent = text.slice(0, index);
      if (index % (CREW[voiceId]?.voice.speed || 3) === 0 && /[a-z0-9]/i.test(text[index - 1] || "")) playBlip(voiceId, index);
      if (index >= text.length) clearInterval(typingTimer);
    }, 12);
  }

  function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  }

  function averageTrust() {
    return average(Object.values(state.crew).map(person => person.trust));
  }

  function averageHealth() {
    return average(Object.values(state.crew).map(person => person.health));
  }

  function crewClimateValue() {
    return average(Object.values(state.relations));
  }

  function climateLabel(value = crewClimateValue()) {
    if (value >= 72) return "UNITED";
    if (value >= 55) return "STEADY";
    if (value >= 38) return "STRAINED";
    if (value >= 22) return "FRACTURED";
    return "HOSTILE";
  }

  function meterClass(value) {
    if (value <= 24) return "danger";
    if (value <= 44) return "warn";
    return "";
  }

  function resourceName(key) {
    return ({ power: "POWER", air: "LIFE SUPPORT", radiation: "RADIATION SAFETY" })[key] || key.toUpperCase();
  }

  function renderResources() {
    const keys = ["power", "air", "radiation"];
    ui.resources.innerHTML = keys.map(key => {
      const value = Math.round(state.resources[key]);
      return `<div class="resource-meter">
        <div class="resource-label"><span>${resourceName(key)}</span><span>${value}%</span></div>
        <div class="meter-track"><div class="meter-fill ${meterClass(value)}" style="width:${value}%"></div></div>
      </div>`;
    }).join("");
    ui.missionScore.textContent = `SCIENCE ${String(Math.round(state.resources.science)).padStart(2, "0")}`;
  }

  function moduleState(value) {
    if (value >= 75) return "READY";
    if (value >= 50) return "OPERATIONAL";
    if (value >= 25) return "DEGRADED";
    return "CRITICAL";
  }

  function renderModules() {
    const meta = {
      greenhouse: ["GREENHOUSE", "♣"],
      comms: ["COMMUNICATIONS", "⌁"],
      shelter: ["SHELTER", "◆"],
      rover: ["ROVER", "◎"]
    };
    ui.moduleGrid.innerHTML = Object.entries(state.modules).map(([key, value]) => {
      const [name, icon] = meta[key];
      return `<div class="module-card ${value < 25 ? "low" : ""}">
        <div class="module-top"><span>${name}</span><span class="module-icon">${icon}</span></div>
        <div class="module-bar"><i style="width:${clamp(value)}%"></i></div>
        <p class="module-state">${moduleState(value)} • ${Math.round(value)}%</p>
      </div>`;
    }).join("");
  }

  function healthLabel(value) {
    if (value >= 80) return ["FIT", "good"];
    if (value >= 55) return ["HURT", "warn"];
    if (value >= 30) return ["INJURED", "bad"];
    return ["CRITICAL", "bad"];
  }

  function fatigueLabel(value) {
    if (value < 30) return ["RESTED", "good"];
    if (value < 55) return ["TIRED", "warn"];
    if (value < 80) return ["EXHAUSTED", "bad"];
    return ["COLLAPSE RISK", "bad"];
  }

  function trustLabel(value) {
    if (value >= 75) return ["LOYAL", "good"];
    if (value >= 55) return ["TRUSTING", "good"];
    if (value >= 35) return ["UNCERTAIN", "warn"];
    if (value >= 18) return ["DISTRUSTFUL", "bad"];
    return ["DEFIANT", "bad"];
  }

  function renderCrew() {
    ui.crewCards.innerHTML = Object.entries(CREW).map(([id, person]) => {
      const stats = state.crew[id];
      const [health, healthClass] = healthLabel(stats.health);
      const [fatigue, fatigueClass] = fatigueLabel(stats.fatigue);
      const [trust, trustClass] = trustLabel(stats.trust);
      return `<article class="crew-card" data-crew="${id}" tabindex="0" role="button" aria-label="Open ${person.name} status">
        <img class="crew-avatar" src="${person.image}" alt="${person.name}">
        <div><h3>${person.name}</h3><p class="crew-role">${person.role}</p>
          <div class="status-row">
            <span class="status-chip ${healthClass}">${health}</span>
            <span class="status-chip ${fatigueClass}">${fatigue}</span>
            <span class="status-chip ${trustClass}">${trust}</span>
          </div>
        </div>
      </article>`;
    }).join("");

    $$(".crew-card").forEach(card => {
      const open = () => openCrewDetail(card.dataset.crew);
      card.addEventListener("click", open);
      card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") open(); });
    });

    const climate = crewClimateValue();
    ui.crewClimate.textContent = climateLabel(climate);
    ui.talkCounter.textContent = `${state.talksLeft} TALK${state.talksLeft === 1 ? "" : "S"}`;
    const pairs = [
      ["jack", "riley", "JACK ↔ RILEY"],
      ["maya", "theo", "MAYA ↔ THEO"],
      [null, null, "WHOLE CREW"]
    ];
    ui.relationshipLines.innerHTML = pairs.map(([a,b,label]) => {
      const value = a ? state.relations[pairKey(a,b)] : climate;
      return `<div class="relationship-row"><span>${label}</span><b>${climateLabel(value)}</b></div>`;
    }).join("");
  }

  function renderStage() {
    ui.crewStage.innerHTML = Object.entries(CREW).map(([id, person]) => `
      <button class="stage-character" data-stage-crew="${id}" aria-label="Talk to ${person.name}">
        <img src="${person.image}" alt="">
        <span class="stage-name">${person.short}</span>
      </button>`).join("");
    $$(".stage-character").forEach(button => button.addEventListener("click", () => openCrewDetail(button.dataset.stageCrew)));
  }

  function renderEchoQueue() {
    const pending = state.scheduled.filter(item => item.dueSol > state.sol).sort((a,b) => a.dueSol - b.dueSol);
    ui.echoCount.textContent = `${pending.length} PENDING`;
    ui.echoList.innerHTML = pending.length
      ? pending.map(item => `<p><b>SOL ${item.dueSol}</b><br>${item.title}</p>`).join("")
      : "<p>No delayed effects yet.</p>";
  }

  function requirementMet(requirement) {
    if (!requirement) return true;
    if (requirement.kind === "module") return state.modules[requirement.key] >= requirement.min;
    if (requirement.kind === "flag") return Boolean(state.flags[requirement.key]);
    if (requirement.kind === "crewHealth") return state.crew[requirement.key].health >= requirement.min;
    if (requirement.kind === "combined") return state.modules[requirement.module] >= requirement.min && crewClimateValue() >= requirement.relationMin;
    return true;
  }

  function renderCouncil(event) {
    ui.councilGrid.innerHTML = Object.entries(event.council).map(([id, line]) => `
      <div class="council-note"><img src="${CREW[id].image}" alt=""><b>${CREW[id].short}:</b> ${line}</div>`).join("");
  }

  function renderChoices(event) {
    ui.choiceGrid.innerHTML = event.choices.map((choice, index) => {
      const unlocked = requirementMet(choice.requirement);
      const hint = unlocked ? choice.hint : choice.requirement.label;
      return `<button class="choice-button ${unlocked ? "" : "locked"}" data-choice="${index}" ${unlocked ? "" : "disabled"}>
        <span class="choice-index">${index + 1}</span><b>${choice.title}</b><small>${hint}</small>
      </button>`;
    }).join("");
    $$(".choice-button:not(.locked)").forEach(button => button.addEventListener("click", () => chooseOption(Number(button.dataset.choice))));
  }

  function applyDueEffects() {
    const due = state.scheduled.filter(item => item.dueSol <= state.sol);
    state.scheduled = state.scheduled.filter(item => item.dueSol > state.sol);
    state.notices = [];
    due.forEach(item => {
      applyEffects(item.effects, { scheduleNested: false });
      state.notices.push(`${item.title}: ${item.text}`);
      state.history.push({ sol: state.sol, title: item.title, cause: item.text, delayed: true });
    });
  }

  function renderSol() {
    currentEvent = EVENTS[state.sol - 1];
    if (!currentEvent) return finishMission();
    state.talksLeft = 1;
    applyDueEffects();
    if (state.sol === 10 && !state.finalSnapshot) state.finalSnapshot = deepClone(state);

    ui.sol.textContent = `SOL ${String(state.sol).padStart(2, "0")}`;
    ui.sceneKicker.textContent = currentEvent.kicker;
    ui.sceneTitle.textContent = currentEvent.title;
    ui.alertRibbon.textContent = currentEvent.source === "donki" ? "ARCHIVED SPACE WEATHER" : "TRAINING SCENARIO";
    const noticeText = state.notices.length ? ` Earlier choices return: ${state.notices.join(" ")}` : "";
    typeDialogue(currentEvent.speaker, currentEvent.text + noticeText);
    renderResources();
    renderModules();
    renderStage();
    renderCrew();
    renderEchoQueue();
    renderCouncil(currentEvent);
    renderChoices(currentEvent);
    saveGame();
  }

  function applyEffects(effects = {}, options = { scheduleNested: true }) {
    const chips = [];
    if (effects.resources) {
      Object.entries(effects.resources).forEach(([key, delta]) => {
        state.resources[key] = clamp(state.resources[key] + delta);
        chips.push({ text: `${key === "radiation" ? "SAFETY" : key.toUpperCase()} ${delta > 0 ? "+" : ""}${delta}`, positive: delta > 0 });
      });
    }
    if (effects.modules) {
      Object.entries(effects.modules).forEach(([key, delta]) => {
        state.modules[key] = clamp(state.modules[key] + delta);
        chips.push({ text: `${key.toUpperCase()} ${delta > 0 ? "+" : ""}${delta}`, positive: delta > 0 });
      });
    }
    if (effects.crew) {
      Object.entries(effects.crew).forEach(([id, changes]) => {
        Object.entries(changes).forEach(([key, delta]) => {
          state.crew[id][key] = clamp(state.crew[id][key] + delta);
          if (Math.abs(delta) >= 5) chips.push({ text: `${CREW[id].short} ${key.toUpperCase()} ${delta > 0 ? "+" : ""}${delta}`, positive: key === "fatigue" ? delta < 0 : delta > 0 });
        });
      });
    }
    if (effects.relations) {
      Object.entries(effects.relations).forEach(([key, delta]) => {
        state.relations[key] = clamp((state.relations[key] ?? 50) + delta);
        if (Math.abs(delta) >= 5) chips.push({ text: `RELATIONSHIP ${delta > 0 ? "+" : ""}${delta}`, positive: delta > 0 });
      });
    }
    if (effects.flags) Object.assign(state.flags, effects.flags);
    if (effects.schedule && options.scheduleNested !== false) {
      effects.schedule.forEach(item => state.scheduled.push({ ...deepClone(item), dueSol: state.sol + item.delay }));
      chips.push({ text: `${effects.schedule.length} DELAYED EFFECT${effects.schedule.length === 1 ? "" : "S"}`, positive: false });
    }
    return chips;
  }

  function chooseOption(index) {
    initializeAudio();
    const choice = currentEvent.choices[index];
    if (!choice || !requirementMet(choice.requirement)) return;
    const snapshot = deepClone(state);
    const chips = applyEffects(choice.effects);
    state.currentChoice = { sol: state.sol, title: choice.title, cause: choice.cause };
    state.history.push({ sol: state.sol, title: choice.title, cause: choice.cause, snapshot });
    state.lastAlternatives = currentEvent.choices.filter((_, i) => i !== index).map(item => ({ title: item.title, hint: item.hint }));
    renderResources();
    renderModules();
    renderCrew();
    renderEchoQueue();
    saveGame();
    showCutscene(choice.cutscene, chips);
  }

  function showCutscene(cutscene, chips) {
    const person = CREW[cutscene.image];
    const image = person ? person.image : "assets/base-concept.png";
    ui.cutsceneImage.style.backgroundImage = `radial-gradient(circle at center, rgba(224,165,43,.18), transparent 58%), url('${image}')`;
    ui.cutsceneKicker.textContent = `SOL ${String(state.sol).padStart(2,"0")} • CONSEQUENCE`;
    ui.cutsceneTitle.textContent = cutscene.title;
    ui.cutsceneText.textContent = cutscene.text;
    ui.effectChips.innerHTML = chips.slice(0, 8).map(chip => `<span class="effect-chip ${chip.positive ? "positive" : "negative"}">${chip.text}</span>`).join("");
    ui.continueButton.textContent = state.sol >= 10 ? "REVEAL ENDING" : "CONTINUE TO NEXT SOL";
    ui.cutscene.hidden = false;
    playBlip(cutscene.image || "theo", 1);
  }

  function criticalEndingTriggered() {
    return state.sol >= 4 && (state.resources.air <= 0 || state.resources.radiation <= 0 || averageHealth() < 15);
  }

  function continueAfterCutscene() {
    ui.cutscene.hidden = true;
    if (criticalEndingTriggered()) {
      finishMission("redNomads");
      return;
    }
    if (state.sol >= 10) {
      finishMission();
      return;
    }
    state.sol += 1;
    renderSol();
  }

  function endingKey() {
    const climate = crewClimateValue();
    const trust = averageTrust();
    const { power, air, radiation, science } = state.resources;
    const { greenhouse, comms, rover } = state.modules;
    if (state.flags.final_rover_relay && rover >= 15 && climate >= 38) return "pathfinder";
    if (air < 20 || radiation < 18 || averageHealth() < 28) return science >= 55 && comms >= 20 ? "lastMessage" : "redNomads";
    if (climate < 30 || trust < 28 || state.flags.crew_fight && climate < 42) return "brokenCouncil";
    if (science >= 72 && (air < 48 || radiation < 45 || power < 25)) return "scienceAtAnyCost";
    if (comms < 24 && air >= 35) return "silentStation";
    if (greenhouse >= 68 && air >= 45 && state.flags.plants_saved_crew) return "greenDawn";
    if (average([power, air, radiation]) >= 48 && climate >= 50 && trust >= 45 && science >= 42) return "trueHome";
    return "heldTogether";
  }

  function epilogueFor(id) {
    const person = CREW[id];
    const stats = state.crew[id];
    let fate;
    if (stats.health < 30) fate = "enters long-term recovery after the mission";
    else if (stats.fatigue > 78) fate = "finishes the mission exhausted and finally accepts mandatory rest";
    else if (stats.trust >= 72) fate = "remains one of the commander's closest allies";
    else if (stats.trust < 28) fate = "requests reassignment before the next expedition";
    else fate = "stays with Echo Station, carrying both pride and unanswered doubts";
    return `<div class="epilogue-item"><b>${person.name}</b> ${fate}.</div>`;
  }

  function finishMission(forcedKey = null) {
    ui.cutscene.hidden = true;
    const key = forcedKey || endingKey();
    const ending = ENDINGS[key];
    ui.endingTitle.textContent = ending.title;
    ui.endingSummary.textContent = ending.summary;
    const stats = [
      ["SCIENCE RESULT", `${Math.round(state.resources.science)}%`],
      ["CREW CLIMATE", climateLabel()],
      ["AVERAGE TRUST", `${Math.round(averageTrust())}%`],
      ["BASE SURVIVAL", `${Math.round(average([state.resources.power, state.resources.air, state.resources.radiation]))}%`]
    ];
    ui.endingStats.innerHTML = stats.map(([label,value]) => `<div class="ending-stat"><span>${label}</span><b>${value}</b></div>`).join("");
    ui.epilogueList.innerHTML = Object.keys(CREW).map(epilogueFor).join("");
    const causes = state.history.slice(-6);
    ui.causeMap.innerHTML = causes.map(item => `<div class="cause-item"><b>SOL ${item.sol}: ${item.title}</b><br>${item.cause}</div>`).join("");
    const alternatives = state.lastAlternatives.map(item => `<b>${item.title}</b> — ${item.hint}`).join("<br>");
    ui.twinTimeline.innerHTML = `<b>TWIN SOLS — THE FUTURE YOU DID NOT CHOOSE</b><br>${alternatives || "No stable alternate timeline remained."}`;
    ui.rewindButton.hidden = !state.finalSnapshot;
    localStorage.removeItem("twin-sols-save-v1");
    switchScreen("ending");
  }

  function openModal(kicker, title, html) {
    ui.modalKicker.textContent = kicker;
    ui.modalTitle.textContent = title;
    ui.modalBody.innerHTML = html;
    ui.modal.hidden = false;
  }

  function closeModal() {
    ui.modal.hidden = true;
  }

  function aboutGame() {
    openModal("MISSION BRIEF", "HOW TWIN SOLS WORKS", `
      <p>You command Echo Station for ten Martian sols. Each day combines a visual-novel crew scene with a real engineering trade-off.</p>
      <h3>THREE CORE RESOURCES</h3>
      <p><b>Power</b> runs every system. <b>Life Support</b> keeps the air safe. <b>Radiation Safety</b> protects the crew from accumulated exposure.</p>
      <h3>NOT JUST METERS</h3>
      <p>Your choices also change the greenhouse, communications, shelter, rover, science result, crew health, fatigue, trust, relationships, hidden story flags, and future options.</p>
      <h3>THE ECHO RULE</h3>
      <p>Some consequences arrive one or two sols later. Earth messages are delayed, so expert advice may describe a situation that has already changed.</p>
      <p><b>There is no free safe choice.</b> Every option protects something and spends something else.</p>`);
  }

  function openSourceCard() {
    const source = SOURCES[currentEvent?.source || "donki"];
    const fact = currentEvent?.dataFact ? `<p><b>Scenario record:</b> ${currentEvent.dataFact}</p>` : "";
    openModal("REAL DATA", source.label, `<div class="data-card"><h3>${source.title}</h3>${fact}<p>${source.note}</p><p><a href="${source.url}" target="_blank" rel="noopener">Open official source ↗</a></p></div><p>This game converts real or archived data into a simplified educational scenario. It is not an operational safety forecast.</p>`);
  }

  function openAllSources() {
    const cards = Object.values(SOURCES).map(source => `<div class="data-card"><h3>${source.label}</h3><p>${source.note}</p><a href="${source.url}" target="_blank" rel="noopener">Official source ↗</a></div>`).join("");
    openModal("SCIENCE TRACE", "DATA BEHIND THE MISSION", `<p>Every science-linked event identifies its source. Archived data is always labeled as archived.</p>${cards}`);
  }

  function openCrewOverview() {
    const rows = Object.entries(CREW).map(([id, person]) => {
      const stats = state.crew[id];
      return `<div class="data-card"><h3>${person.name} — ${person.role}</h3><p>Health ${Math.round(stats.health)} • Fatigue ${Math.round(stats.fatigue)} • Trust ${Math.round(stats.trust)}</p><p>${person.bio}</p></div>`;
    }).join("");
    openModal("CREW FILE", "ECHO STATION COUNCIL", rows);
  }

  function privateLine(id) {
    const stats = state.crew[id];
    if (stats.fatigue >= 68) return CREW[id].talks.tired;
    if (stats.trust >= 68) return CREW[id].talks.high;
    if (stats.trust <= 32) return CREW[id].talks.low;
    return CREW[id].talks.default;
  }

  function openCrewDetail(id) {
    const person = CREW[id];
    const stats = state.crew[id];
    const canTalk = state.talksLeft > 0;
    openModal("PRIVATE CONVERSATION", person.name, `
      <div class="crew-detail">
        <img src="${person.image}" alt="${person.name}">
        <div><p class="crew-role">${person.role} • VALUES ${person.value.toUpperCase()}</p><p>${person.bio}</p>
        <p><b>Health:</b> ${Math.round(stats.health)} &nbsp; <b>Fatigue:</b> ${Math.round(stats.fatigue)} &nbsp; <b>Trust:</b> ${Math.round(stats.trust)}</p>
        <div class="data-card"><b>${person.short}:</b> “${privateLine(id)}”</div>
        <button class="button button-primary talk-button" data-talk="${id}" ${canTalk ? "" : "disabled"}>${canTalk ? "SPEND TODAY'S TALK" : "NO TALKS LEFT TODAY"}</button></div>
      </div>`);
    const button = ui.modalBody.querySelector("[data-talk]");
    if (button && canTalk) button.addEventListener("click", () => performPrivateTalk(id));
    playBlip(id, 0);
  }

  function performPrivateTalk(id) {
    if (state.talksLeft <= 0) return;
    state.talksLeft -= 1;
    state.crew[id].trust = clamp(state.crew[id].trust + 4);
    state.crew[id].fatigue = clamp(state.crew[id].fatigue - 3);
    const weakestPair = Object.entries(state.relations).filter(([key]) => key.includes(id)).sort((a,b) => a[1] - b[1])[0];
    if (weakestPair) state.relations[weakestPair[0]] = clamp(state.relations[weakestPair[0]] + 2);
    state.history.push({ sol: state.sol, title: `Private talk with ${CREW[id].name}`, cause: "You spent limited command time listening instead of operating a system." });
    renderCrew();
    saveGame();
    closeModal();
    typeDialogue(CREW[id].short, privateLine(id));
  }

  function startMission() {
    initializeAudio();
    if (!loadGame()) resetGame();
    switchScreen("game");
    renderSol();
  }

  function setInitialStartState() {
    const raw = localStorage.getItem("twin-sols-save-v1");
    if (raw) ui.startButton.textContent = "CONTINUE MISSION";
  }

  ui.startButton.addEventListener("click", startMission);
  ui.aboutButton.addEventListener("click", aboutGame);
  ui.modalClose.addEventListener("click", closeModal);
  ui.modal.addEventListener("click", event => { if (event.target === ui.modal) closeModal(); });
  ui.sourceButton.addEventListener("click", openSourceCard);
  ui.dataButton.addEventListener("click", openAllSources);
  ui.crewButton.addEventListener("click", openCrewOverview);
  ui.soundButton.addEventListener("click", () => {
    initializeAudio();
    state.sound = !state.sound;
    ui.soundButton.textContent = state.sound ? "SOUND ON" : "SOUND OFF";
    saveGame();
  });
  ui.continueButton.addEventListener("click", continueAfterCutscene);
  ui.replayButton.addEventListener("click", () => { resetGame(); switchScreen("game"); renderSol(); });
  ui.rewindButton.addEventListener("click", () => {
    if (!state.finalSnapshot) return;
    const snapshot = deepClone(state.finalSnapshot);
    state = snapshot;
    state.finalSnapshot = deepClone(snapshot);
    switchScreen("game");
    renderSol();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!ui.modal.hidden) closeModal();
      return;
    }
    if (!ui.cutscene.hidden && event.key === "Enter") {
      continueAfterCutscene();
      return;
    }
    if (screens.game.classList.contains("active") && ui.cutscene.hidden && ["1","2","3"].includes(event.key)) {
      const button = ui.choiceGrid.querySelector(`[data-choice="${Number(event.key)-1}"]:not(.locked)`);
      button?.click();
    }
  });

  setInitialStartState();
})();
