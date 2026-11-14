window.GAME_DATA = (() => {
  const crew = {
    jack: {
      name: "Jack Mercer",
      short: "JACK",
      role: "SYSTEMS ENGINEER",
      image: "assets/jack-mercer.png",
      color: "#e0a52b",
      voice: { wave: "square", frequency: 128, speed: 3 },
      value: "Reliability",
      bio: "Jack trusts machines because they never hide what is broken. He respects honest plans, fair workloads, and repairs done before they become emergencies.",
      talks: {
        high: "You have listened when the warning lights were still quiet. That matters. Tell me the risk, and I will do the work.",
        low: "Another order? Fine. But do not ask me to pretend the station is healthy when you keep borrowing from tomorrow.",
        tired: "I can still hold a wrench. I cannot promise my hands will be steady.",
        default: "Every system here is connected. Take power from one pipe and another room starts counting down."
      }
    },
    maya: {
      name: "Maya Brooks",
      short: "MAYA",
      role: "MEDICAL OFFICER",
      image: "assets/maya-brooks.png",
      color: "#c84d2b",
      voice: { wave: "sine", frequency: 186, speed: 4 },
      value: "Crew safety",
      bio: "Maya protects the crew from radiation, exhaustion, and each other. She values truth and will challenge plans that treat people like spare parts.",
      talks: {
        high: "You cannot remove every danger, Commander. But you can make sure the crew understands what they are choosing.",
        low: "You keep asking for trust after the decision is already made. That is not how trust works.",
        tired: "My patients need rest. So does their doctor. Mars does not care, but you should.",
        default: "Radiation does not shout when it hurts you. That is why we must think before the alarm."
      }
    },
    riley: {
      name: "Riley Stone",
      short: "RILEY",
      role: "ASTROBIOLOGIST",
      image: "assets/riley-stone.png",
      color: "#6e9e54",
      voice: { wave: "triangle", frequency: 235, speed: 3 },
      value: "Living systems",
      bio: "Riley runs the greenhouse. She sees every seedling as part of the base's life-support system, not decoration, and remembers every time it is treated as expendable.",
      talks: {
        high: "The seedlings recovered because you gave them a chance. People are not so different.",
        low: "You call the greenhouse optional until everyone needs what it produces.",
        tired: "I counted the leaves three times. I still cannot remember whether I watered row four.",
        default: "Food, oxygen, morale. The greenhouse pays us back slowly, which makes it easy to sacrifice too early."
      }
    },
    theo: {
      name: "Theo Reed",
      short: "THEO",
      role: "SCIENCE & COMMS",
      image: "assets/theo-reed.png",
      color: "#4e92a0",
      voice: { wave: "sawtooth", frequency: 275, speed: 2 },
      value: "Discovery",
      bio: "Theo listens to Earth through minutes of silence. He wants Echo Station to discover something worth the risk, but ambition and fatigue can make weak signals look certain.",
      talks: {
        high: "I checked the packet twice. If you give me the window, I can turn this mission into more than survival.",
        low: "You only ask for data when it agrees with the choice you already made.",
        tired: "The signal repeated. Or I repeated it. Give me a minute to check.",
        default: "Earth can advise us, but the answer arrives after Mars has already moved on."
      }
    }
  };

  const sources = {
    donki: {
      label: "NASA DONKI",
      title: "Solar-weather event data",
      url: "https://ccmc.gsfc.nasa.gov/DONKI-API",
      note: "Archived solar-flare and coronal-mass-ejection records seed the training events. They are research data, not an operational Mars forecast."
    },
    radlab: {
      label: "NASA OSDR RADLAB",
      title: "Mars radiation measurements",
      url: "https://visualization.osdr.nasa.gov/radlab/gui/data-api/",
      note: "MSL-RAD-Surface measurements provide an authentic baseline for the game's radiation lessons."
    },
    osdr: {
      label: "NASA OSDR",
      title: "Space biology and health research",
      url: "https://visualization.osdr.nasa.gov/biodata/api/",
      note: "Curated research themes inform fatigue, health, plant, and crew-recovery consequences."
    },
    marstrek: {
      label: "NASA MARS TREK",
      title: "Gale Crater terrain context",
      url: "https://trek.nasa.gov/mars/",
      note: "Real Mars mapping and terrain context ground Echo Station's fictional site near Gale Crater."
    },
    csa: {
      label: "CANADIAN SPACE AGENCY",
      title: "Food production on the Moon and in remote areas",
      url: "https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/",
      note: "The greenhouse trade-offs draw on educator resources about food production in isolated environments."
    }
  };

  const events = [
    {
      sol: 1,
      kicker: "POWER BUDGET",
      title: "Eight watts too few",
      speaker: "MAYA",
      source: "osdr",
      text: "Echo Station wakes with a simple problem: every system works, but not all at full power. Life support, the greenhouse, and the communications array each want the same eight energy units.",
      council: {
        jack: "Protect life support. A quiet machine can still be one hour from failure.",
        maya: "Air first. Healthy people can repair everything else.",
        riley: "The greenhouse returns oxygen and food later. Cutting it is borrowing from tomorrow.",
        theo: "A communications window closes in nine minutes. Science cannot wait forever."
      },
      choices: [
        {
          title: "Stabilize life support",
          hint: "Safer air now; the science window and greenhouse lose time.",
          effects: { resources: { power: -8, air: 13, science: -2 }, modules: { greenhouse: -5, comms: -4 }, crew: { jack: { trust: 5 }, maya: { trust: 5 }, riley: { trust: -3 }, theo: { trust: -3 } }, relations: { "jack-riley": -3 }, flags: { air_first: true } },
          cause: "You protected breathing systems before mission progress.",
          cutscene: { image: "jack", title: "The fans breathe again", text: "Jack reroutes the final battery bank. Air begins moving through the habitat, while the greenhouse lamps dim to amber." }
        },
        {
          title: "Keep the greenhouse warm",
          hint: "Plants recover slowly; the communications window closes.",
          effects: { resources: { power: -8, air: 4, science: -3 }, modules: { greenhouse: 15, comms: -7 }, crew: { riley: { trust: 8 }, jack: { trust: -2 }, theo: { trust: -4 } }, relations: { "jack-riley": -4 }, flags: { greenhouse_first: true }, schedule: [{ delay: 2, title: "Greenhouse oxygen return", text: "Healthy plants ease the life-support load.", effects: { resources: { air: 8 }, modules: { greenhouse: 3 } } }] },
          cause: "You invested scarce power in a system that pays back later.",
          cutscene: { image: "riley", title: "Warm light, cold silence", text: "The seedlings lift toward the lamps. Across the habitat, Theo watches Earth's carrier signal disappear." }
        },
        {
          title: "Transmit the science packet",
          hint: "Mission progress rises; air and food systems run on minimum power.",
          effects: { resources: { power: -10, air: -5, science: 12 }, modules: { comms: 13, greenhouse: -6 }, crew: { theo: { trust: 8, fatigue: 10 }, maya: { trust: -3 }, riley: { trust: -3 } }, flags: { first_packet_sent: true }, schedule: [{ delay: 2, title: "Earth acknowledges Echo", text: "A delayed reply confirms that the science packet arrived intact.", effects: { resources: { science: 4 }, crew: { theo: { trust: 2 } } } }] },
          cause: "You traded present stability for mission value and a future reply.",
          cutscene: { image: "theo", title: "A signal crosses the dark", text: "The dish turns toward a pale point in the sky. Echo Station exhales on reserve power while the packet races home." }
        }
      ]
    },
    {
      sol: 2,
      kicker: "SPACE WEATHER ALERT",
      title: "The Sun sends a warning",
      speaker: "THEO",
      source: "donki",
      dataFact: "Training seed: an archived M1.7 solar flare recorded by DONKI on 11 November 2026.",
      text: "Theo matches a new alert to an archived M-class flare pattern. It is not a precise Mars forecast, but the training model raises the chance of a radiation event during tomorrow's rover window.",
      council: {
        jack: "Give me power and regolith blocks. The shelter can be stronger by night.",
        maya: "Move everyone inside now. A missed experiment can be repeated; exposure cannot.",
        riley: "If the greenhouse freezes during lockdown, we create a different emergency.",
        theo: "The rover is already near the target. We can finish before conditions change."
      },
      choices: [
        {
          title: "Reinforce the shelter",
          hint: "Strong protection; science and greenhouse power are reduced.",
          effects: { resources: { power: -13, radiation: 17, science: -4 }, modules: { shelter: 17, greenhouse: -8 }, crew: { jack: { fatigue: 17, trust: 6 }, maya: { trust: 5 }, riley: { trust: -5 } }, flags: { shelter_reinforced: true }, schedule: [{ delay: 1, title: "Cold roots", text: "The unpowered greenhouse enters recovery mode.", effects: { modules: { greenhouse: -8 }, crew: { riley: { trust: -3 } } } }] },
          cause: "You spent tonight's power on radiation protection.",
          cutscene: { image: "jack", title: "Stone over steel", text: "Jack's printer lays another shield layer above the sleeping cabin. Behind him, greenhouse lamps blink out one row at a time." }
        },
        {
          title: "Finish the rover traverse",
          hint: "High science return; the crew accepts extra exposure risk.",
          effects: { resources: { power: -8, radiation: -13, science: 16 }, modules: { rover: -13, shelter: -4 }, crew: { theo: { trust: 7, fatigue: 13 }, maya: { trust: -8 }, jack: { trust: -3 } }, flags: { rover_during_alert: true }, schedule: [{ delay: 2, title: "Exposure review", text: "The medical log shows the cost of working through the alert.", effects: { crew: { theo: { health: -9 }, maya: { fatigue: 6 } }, resources: { radiation: -5 } } }] },
          cause: "You accepted radiation risk to protect a rare science opportunity.",
          cutscene: { image: "theo", title: "Tracks under a restless sky", text: "The rover drills into untouched rock while Theo watches the radiation model climb in the corner of his screen." }
        },
        {
          title: "Split power across both systems",
          hint: "Neither plan is complete, but no system is abandoned.",
          effects: { resources: { power: -11, radiation: 7, science: 6 }, modules: { shelter: 7, greenhouse: -3, rover: -5 }, crew: { jack: { fatigue: 10 }, riley: { fatigue: 8 }, maya: { trust: 2 }, theo: { trust: 1 } }, relations: { "jack-riley": 4 }, flags: { shared_storm_work: true } },
          cause: "You shared the risk and the workload instead of maximizing one outcome.",
          cutscene: { image: "maya", title: "No perfect shelter", text: "Half the blocks cure above the bunks. Half the lamps stay on. Maya writes down the remaining risk in red ink." }
        }
      ]
    },
    {
      sol: 3,
      kicker: "CREW CONFLICT",
      title: "Cold leaves, hot words",
      speaker: "RILEY",
      source: "csa",
      text: "The greenhouse reports cold damage. Riley blames Jack's shelter work; Jack says plants cannot outrank people. Their argument is now blocking the morning repair schedule.",
      council: {
        jack: "I followed the power plan. Do not turn arithmetic into a personal attack.",
        maya: "They are exhausted. Solve the work problem before it becomes a crew problem.",
        riley: "He calls food optional because plants do not shout when they are dying.",
        theo: "We are losing the next transmission while everyone argues."
      },
      choices: [
        {
          title: "Promise Riley a greenhouse recovery shift",
          hint: "Restores hope, but creates a promise due next sol.",
          effects: { modules: { greenhouse: 7 }, crew: { riley: { trust: 7 }, jack: { trust: -2 } }, relations: { "jack-riley": -2 }, flags: { promise_greenhouse: true }, schedule: [{ delay: 1, title: "Promise due: greenhouse shift", text: "Riley expects the recovery power you promised.", effects: { flags: { greenhouse_promise_due: true } } }] },
          cause: "You calmed the conflict with a promise that must be kept later.",
          cutscene: { image: "riley", title: "A promise under glass", text: "Riley lowers her voice, but not her eyes. She marks tomorrow's recovery shift on the greenhouse door." }
        },
        {
          title: "Back Jack's emergency priorities",
          hint: "Repairs accelerate; Riley's trust and the greenhouse suffer.",
          effects: { resources: { air: 8 }, modules: { greenhouse: -11, shelter: 5 }, crew: { jack: { trust: 8 }, riley: { trust: -10 } }, relations: { "jack-riley": -14 }, flags: { sided_jack: true } },
          cause: "You declared mechanical safety more important than the greenhouse.",
          cutscene: { image: "jack", title: "The argument ends, not the anger", text: "Jack returns to the pipes. Riley carries the damaged seedlings away without looking at either of you." }
        },
        {
          title: "Mediate and assign a shared repair",
          hint: "Costs time and energy; improves cooperation and both systems.",
          effects: { resources: { power: -7, science: -3, air: 4 }, modules: { greenhouse: 9, shelter: 4 }, crew: { jack: { fatigue: 9, trust: 3 }, riley: { fatigue: 9, trust: 3 }, maya: { trust: 4 } }, relations: { "jack-riley": 16 }, flags: { jack_riley_mediated: true } },
          cause: "You spent mission time repairing a relationship as well as equipment.",
          cutscene: { image: "maya", title: "Two pairs of gloves", text: "Jack repairs a heater while Riley clears its dusty intake. Neither apologizes, but the room grows warmer." }
        }
      ]
    },
    {
      sol: 4,
      kicker: "DELAYED MESSAGE",
      title: "Earth answers yesterday",
      speaker: "THEO",
      source: "donki",
      text: "A delayed advisory reaches Echo Station. Earth recommends suspending surface work, but the message was written before the newest local readings. The crew must decide whether old expert advice beats newer incomplete data.",
      council: {
        jack: "Earth cannot hear our pumps. Local data wins.",
        maya: "Old advice can still be good advice when the risk is invisible.",
        riley: "We can protect the greenhouse and pause the rover. It is not all or nothing.",
        theo: "The local model is mine. I believe it, but I want everyone to know the uncertainty."
      },
      choices: [
        {
          title: "Follow Earth's advisory",
          hint: "Safer crew; lost science window and lower rover charge.",
          effects: { resources: { radiation: 10, science: -9, power: -4 }, modules: { shelter: 8, rover: -8, comms: 3 }, crew: { maya: { trust: 6 }, theo: { trust: -5 } }, flags: { obeyed_earth: true } },
          cause: "You trusted delayed expert advice over uncertain local interpretation.",
          cutscene: { image: "maya", title: "The rover waits outside", text: "The airlock seals. Through the window, the rover sits still beneath a sky that looks perfectly harmless." }
        },
        {
          title: "Trust Theo's local model",
          hint: "Preserves science; success depends on Theo's fatigue and communications state.",
          requirement: { kind: "module", key: "comms", min: 35, label: "Requires Communications 35+" },
          effects: { resources: { science: 11, radiation: -5, power: -5 }, modules: { rover: -5, comms: -7 }, crew: { theo: { trust: 9, fatigue: 12 }, maya: { trust: -4 } }, flags: { trusted_local_model: true }, schedule: [{ delay: 2, title: "Model review", text: "Theo's forecast is compared with the measurements that followed.", effects: { resources: { science: 5 }, crew: { theo: { trust: 2 } } } }] },
          cause: "You chose newer local data and accepted its uncertainty.",
          cutscene: { image: "theo", title: "A decision before the reply", text: "Theo sends commands to the rover. Earth's warning remains open beside his model, two truths separated by time." }
        },
        {
          title: "Pause work and verify both datasets",
          hint: "Consumes power and time; improves communications and future choices.",
          effects: { resources: { power: -9, science: 3, radiation: 4 }, modules: { comms: 12, rover: -3 }, crew: { theo: { fatigue: 8, trust: 4 }, maya: { trust: 3 }, jack: { trust: -1 } }, relations: { "maya-theo": 9 }, flags: { data_crosschecked: true } },
          cause: "You paid for better information instead of acting immediately.",
          cutscene: { image: "theo", title: "Two clocks, one decision", text: "Theo and Maya compare every timestamp. The answer arrives too late for today, but just in time for tomorrow." }
        }
      ]
    },
    {
      sol: 5,
      kicker: "PROMISE & POWER",
      title: "Tomorrow's bill arrives",
      speaker: "JACK",
      source: "csa",
      text: "The oxygen recycler draws more power than planned. At the same time, the greenhouse requests its recovery cycle. If you promised Riley that power, the whole crew is waiting to see whether your word survives an emergency.",
      council: {
        jack: "The recycler is not negotiating. Feed it power or watch the air number fall.",
        maya: "If you break a promise, say why. Silence will cost more than honesty.",
        riley: "I planned around your word, Commander. The plants cannot move their deadline.",
        theo: "A short science blackout frees enough energy for a compromise."
      },
      choices: [
        {
          title: "Keep the greenhouse promise",
          hint: "Protects trust and food; air safety drops until repairs finish.",
          requirement: { kind: "flag", key: "promise_greenhouse", label: "Available after promising Riley" },
          effects: { resources: { power: -9, air: -8, science: -3 }, modules: { greenhouse: 17 }, crew: { riley: { trust: 13 }, jack: { trust: -5 }, maya: { trust: 3 } }, relations: { "jack-riley": -4 }, flags: { promise_kept: true, greenhouse_promise_due: false }, schedule: [{ delay: 1, title: "Recycler strain", text: "The underpowered recycler needs an emergency repair.", effects: { resources: { air: -7 }, crew: { jack: { fatigue: 10 } } } }] },
          cause: "You kept your promise even when a new emergency made it expensive.",
          cutscene: { image: "riley", title: "Your word has weight", text: "The greenhouse heaters rise. Riley nods once. Behind the glass, Jack listens to the recycler cough." }
        },
        {
          title: "Break the promise and protect air",
          hint: "Life support stabilizes; Riley and the crew remember the broken word.",
          effects: { resources: { power: -8, air: 16 }, modules: { greenhouse: -15 }, crew: { jack: { trust: 6 }, riley: { trust: -14 }, maya: { trust: -5 } }, relations: { "jack-riley": -10 }, flags: { promise_broken: true, greenhouse_promise_due: false } },
          cause: "You broke a personal promise to protect immediate survival.",
          cutscene: { image: "riley", title: "The lights go out twice", text: "The recycler steadies. The greenhouse goes dark. Riley quietly removes your promise from the door." }
        },
        {
          title: "Shut down science and fund both",
          hint: "Costs mission progress; protects air, plants, and crew trust.",
          effects: { resources: { power: -12, air: 10, science: -12 }, modules: { greenhouse: 10 }, crew: { jack: { trust: 3 }, riley: { trust: 7 }, maya: { trust: 5 }, theo: { trust: -9 } }, relations: { "jack-riley": 7, "maya-theo": -5 }, flags: { science_sacrificed_for_crew: true, promise_kept: true, greenhouse_promise_due: false } },
          cause: "You protected both life systems by sacrificing the mission's scientific purpose.",
          cutscene: { image: "theo", title: "A quiet laboratory", text: "Air moves. Leaves uncurl. Theo closes an unfinished dataset and watches the progress bar disappear." }
        }
      ]
    },
    {
      sol: 6,
      kicker: "ROVER ANOMALY",
      title: "A whisper from the ridge",
      speaker: "THEO",
      source: "marstrek",
      text: "The rover stops beyond a mapped ridge. Its weak signal carries evidence of a rare layered deposit—and a failing wheel motor. Someone must decide whether the discovery is worth a surface repair.",
      council: {
        jack: "I can repair it, but not if you expect me to pretend exhaustion is courage.",
        maya: "Whoever goes needs medical clearance and a real rest plan afterward.",
        riley: "The sample may tell us whether this site once supported habitable conditions.",
        theo: "If we abandon it now, the ridge blocks the signal forever."
      },
      choices: [
        {
          title: "Send Jack for the repair",
          hint: "Best repair outcome; fatigue and health determine the human cost.",
          effects: { resources: { power: -7, science: 10, radiation: -5 }, modules: { rover: 20, shelter: -2 }, crew: { jack: { fatigue: 24, health: -7, trust: 5 }, maya: { trust: -4 } }, flags: { jack_repaired_rover: true }, schedule: [{ delay: 1, title: "Jack's hands shake", text: "The repair succeeded, but exhaustion follows Jack back inside.", effects: { crew: { jack: { fatigue: 8, health: -3 } } } }] },
          cause: "You used the most skilled engineer despite the physical cost.",
          cutscene: { image: "jack", title: "One wheel, one exhausted engineer", text: "Jack locks the motor housing as dust sweeps over the ridge. The rover rolls. He remains kneeling a moment longer." }
        },
        {
          title: "Let Theo attempt a remote recovery",
          hint: "No surface exposure; success needs strong communications.",
          requirement: { kind: "module", key: "comms", min: 45, label: "Requires Communications 45+" },
          effects: { resources: { power: -9, science: 13 }, modules: { comms: -10, rover: 9 }, crew: { theo: { fatigue: 19, trust: 7 }, jack: { trust: -2 } }, flags: { rover_remote_recovery: true } },
          cause: "You spent communications power to replace a dangerous human task.",
          cutscene: { image: "theo", title: "Repair by echo", text: "Theo sends commands into the ridge's shadow. Each response returns seconds later until the rover finally turns toward home." }
        },
        {
          title: "Abandon the rover and recover its battery",
          hint: "Protects crew and power; permanently closes rover-science choices.",
          effects: { resources: { power: 14, radiation: 5, science: -14 }, modules: { rover: -45 }, crew: { maya: { trust: 7 }, theo: { trust: -11 }, jack: { trust: 2 } }, flags: { rover_abandoned: true } },
          cause: "You converted an exploration machine into survival power.",
          cutscene: { image: "maya", title: "A light goes dark on the ridge", text: "The rover sends one final status tone. Echo Station's batteries rise as its map marker fades." }
        }
      ]
    },
    {
      sol: 7,
      kicker: "CREW BREAKING POINT",
      title: "The council fractures",
      speaker: "MAYA",
      source: "osdr",
      text: "Long work shifts and repeated risk have sharpened every disagreement. Jack and Riley's argument spills into the workshop. A tool tray hits the floor. The next action decides whether this becomes a fight or a repair.",
      council: {
        jack: "I am tired of being blamed for numbers none of us can change.",
        maya: "Stop giving orders for one minute. They need to be heard before they can work.",
        riley: "He repairs machines and breaks everything around them.",
        theo: "If we lose another shift, the final science window closes."
      },
      choices: [
        {
          title: "Stop operations and mediate",
          hint: "Loses power and science time; strongly repairs crew relationships.",
          effects: { resources: { power: -6, science: -7 }, crew: { jack: { fatigue: -12, trust: 5 }, riley: { fatigue: -12, trust: 5 }, maya: { trust: 7 }, theo: { trust: -3 } }, relations: { "jack-riley": 24, "jack-maya": 5, "riley-maya": 5 }, flags: { fight_prevented: true } },
          cause: "You treated conflict as a mission-critical system failure.",
          cutscene: { image: "maya", title: "The repair no gauge can show", text: "Maya locks the workshop. Jack and Riley sit on opposite sides of the table until anger becomes words instead of damage." }
        },
        {
          title: "Order everyone back to work",
          hint: "Preserves operations now; tension returns as a delayed consequence.",
          effects: { resources: { science: 4, air: 3 }, crew: { jack: { trust: -7, fatigue: 8 }, riley: { trust: -7, fatigue: 8 }, maya: { trust: -9 } }, relations: { "jack-riley": -16 }, flags: { conflict_suppressed: true }, schedule: [{ delay: 1, title: "Suppressed conflict erupts", text: "The unfinished argument becomes a shove in the equipment bay.", effects: { crew: { jack: { health: -5 }, riley: { health: -4 } }, modules: { greenhouse: -5 }, relations: { "jack-riley": -8 }, flags: { crew_fight: true } } }] },
          cause: "You protected today's schedule by pushing the conflict into tomorrow.",
          cutscene: { image: "jack", title: "Silence is not peace", text: "The tools start moving again. No one speaks. The quiet in the workshop feels more dangerous than the shouting." }
        },
        {
          title: "Assign Jack and Riley separate systems",
          hint: "Reduces immediate tension; cooperation remains unavailable later.",
          effects: { resources: { power: -3, science: -2 }, modules: { shelter: 5, greenhouse: 5 }, crew: { jack: { trust: 2 }, riley: { trust: 2 }, maya: { trust: -2 } }, relations: { "jack-riley": 4 }, flags: { crew_separated: true } },
          cause: "You managed conflict through distance instead of reconciliation.",
          cutscene: { image: "riley", title: "Two rooms, one station", text: "Jack takes the shelter corridor. Riley seals the greenhouse door. The work continues on opposite sides of Echo Station." }
        }
      ]
    },
    {
      sol: 8,
      kicker: "LIFE SUPPORT LEAK",
      title: "Thin air at 03:20",
      speaker: "JACK",
      source: "osdr",
      text: "A coolant crack forces the oxygen recycler below safe efficiency. The repair needs a rested technician, greenhouse oxygen, or a high-power emergency bypass. Echo Station has enough for only one clean solution.",
      council: {
        jack: "I know the line. Whether my hands can hold the seal is another question.",
        maya: "No heroics. Check health and fatigue before choosing a name.",
        riley: "A healthy greenhouse can carry part of the oxygen load—if we did not sacrifice it earlier.",
        theo: "The bypass will erase the final transmission reserve."
      },
      choices: [
        {
          title: "Jack performs the precision repair",
          hint: "Efficient and cheap; becomes dangerous if Jack is exhausted.",
          requirement: { kind: "crewHealth", key: "jack", min: 35, label: "Requires Jack health 35+" },
          effects: { resources: { air: 18, power: -5 }, crew: { jack: { fatigue: 20, health: -4, trust: 6 }, maya: { trust: -2 } }, modules: { shelter: 2 }, flags: { recycler_repaired: true } },
          cause: "You relied on skill while accepting the limits of an exhausted body.",
          cutscene: { image: "jack", title: "One steady turn", text: "Jack braces both hands around the seal. The warning tone stops. He does not let go until Maya reaches him." }
        },
        {
          title: "Route greenhouse oxygen into the habitat",
          hint: "Works only with a living greenhouse and damages the crop cycle.",
          requirement: { kind: "module", key: "greenhouse", min: 35, label: "Requires Greenhouse 35+" },
          effects: { resources: { air: 15, power: -4 }, modules: { greenhouse: -18 }, crew: { riley: { trust: 4, fatigue: 8 }, jack: { trust: -2 } }, flags: { plants_saved_crew: true } },
          cause: "A system protected earlier now returns that investment as breathable air.",
          cutscene: { image: "riley", title: "The greenhouse exhales", text: "Riley opens the emergency valves. Warm, wet air rolls into the habitat while the crop timer resets to zero." }
        },
        {
          title: "Use the emergency power bypass",
          hint: "Fastest air recovery; communications and final science lose power.",
          effects: { resources: { air: 21, power: -16, science: -6 }, modules: { comms: -13 }, crew: { maya: { trust: 5 }, theo: { trust: -8 } }, flags: { emergency_bypass: true } },
          cause: "You protected air by spending the energy reserved for communication and science.",
          cutscene: { image: "maya", title: "Air now, silence later", text: "The recycler roars back to life. On Theo's console, the link-to-Earth indicator turns gray." }
        }
      ]
    },
    {
      sol: 9,
      kicker: "FINAL SCIENCE WINDOW",
      title: "What was the mission for?",
      speaker: "THEO",
      source: "marstrek",
      text: "A terrain alignment opens a final science window at the ridge. The data could justify a permanent outpost—but only by using reserves meant for tomorrow's dust front.",
      council: {
        jack: "A successful mission with a broken station is a strange kind of success.",
        maya: "Measure the crew as carefully as the rocks. We are part of the experiment too.",
        riley: "If the sample improves future habitats, the risk has meaning. It still has a cost.",
        theo: "This is the result Echo Station was built to find."
      },
      choices: [
        {
          title: "Commit to the full science run",
          hint: "Large science gain; drains power, rover, and radiation margin.",
          requirement: { kind: "module", key: "rover", min: 25, label: "Requires Rover 25+" },
          effects: { resources: { power: -14, radiation: -10, science: 24 }, modules: { rover: -15, comms: -5 }, crew: { theo: { trust: 10, fatigue: 16 }, maya: { trust: -5 } }, flags: { final_science_run: true } },
          cause: "You spent survival margin to fulfill the scientific purpose of the mission.",
          cutscene: { image: "theo", title: "The ridge answers", text: "Layer by layer, the rover reveals the history of water in the stone. Every instrument drinks from tomorrow's battery." }
        },
        {
          title: "Take a smaller sample and return",
          hint: "Moderate science with lower risk and stronger crew support.",
          effects: { resources: { power: -7, radiation: -4, science: 11 }, modules: { rover: -7 }, crew: { theo: { trust: 2 }, maya: { trust: 3 }, jack: { trust: 2 } }, relations: { "maya-theo": 5 }, flags: { cautious_science_run: true } },
          cause: "You accepted a smaller discovery to preserve tomorrow's options.",
          cutscene: { image: "maya", title: "Enough to learn, enough to return", text: "The rover seals one sample and turns home before the batteries cross the red line." }
        },
        {
          title: "Cancel science and prepare for dust",
          hint: "Strong survival preparation; mission result and Theo's trust collapse.",
          effects: { resources: { power: 7, radiation: 6, science: -16 }, modules: { shelter: 11, rover: 4 }, crew: { jack: { trust: 5 }, maya: { trust: 6 }, theo: { trust: -14 }, riley: { trust: -2 } }, flags: { science_cancelled: true } },
          cause: "You chose survival preparation over the mission's final discovery.",
          cutscene: { image: "theo", title: "The question remains in the stone", text: "Theo retracts the rover arm. The untouched ridge disappears behind the first wall of dust." }
        }
      ]
    },
    {
      sol: 10,
      kicker: "FINAL CRISIS",
      title: "The long red night",
      speaker: "MISSION CONTROL",
      source: "radlab",
      text: "Dust darkens the solar field as the training model raises radiation exposure. Echo Station cannot power the shelter, air recycler, greenhouse, communications beacon, and rover relay together. The final choice reveals what your mission has become.",
      council: {
        jack: "Seal the shelter and protect the recycler. We survive first.",
        maya: "Choose the plan the crew can still carry out. Look at them, not only the gauges.",
        riley: "The greenhouse is food and air for the weeks after the storm—not a decoration for tonight.",
        theo: "If the beacon dies, Earth may never receive what we learned."
      },
      choices: [
        {
          title: "Seal the shelter and protect life support",
          hint: "Highest immediate survival; greenhouse, rover, and transmission are left outside the budget.",
          effects: { resources: { power: -12, air: 16, radiation: 19, science: -6 }, modules: { shelter: 17, greenhouse: -14, rover: -12, comms: -8 }, crew: { maya: { trust: 7 }, jack: { trust: 5 }, riley: { trust: -5 }, theo: { trust: -4 } }, flags: { final_shelter: true } },
          cause: "Your final allocation protected people and core life support above every mission asset.",
          cutscene: { image: "maya", title: "Four heartbeats behind one door", text: "The shelter seals as dust consumes the windows. Inside, the crew listens to the recycler and waits for morning." }
        },
        {
          title: "Keep the greenhouse and beacon alive",
          hint: "Protects long-term food and the mission record; accepts a narrower radiation margin.",
          effects: { resources: { power: -15, air: 9, radiation: -7, science: 13 }, modules: { greenhouse: 14, comms: 15, shelter: -9 }, crew: { riley: { trust: 8 }, theo: { trust: 8 }, maya: { trust: -6 }, jack: { trust: -3 } }, flags: { final_legacy: true } },
          cause: "You protected the systems that carry Echo Station beyond one night.",
          cutscene: { image: "riley", title: "A green light in the storm", text: "The greenhouse glows through the red dust. Above it, the beacon sends Echo Station's story toward Earth." }
        },
        {
          title: "Launch the rover as a mobile relay",
          hint: "A risky integrated plan; requires a functional rover and crew cooperation.",
          requirement: { kind: "combined", label: "Requires Rover 45+ and Crew Climate 40+", module: "rover", min: 45, relationMin: 40 },
          effects: { resources: { power: -10, air: 7, radiation: 5, science: 18 }, modules: { rover: -20, comms: 8, shelter: 5 }, crew: { jack: { trust: 5, fatigue: 8 }, maya: { trust: 4 }, riley: { trust: 4 }, theo: { trust: 7, fatigue: 8 } }, relations: { "jack-riley": 8, "maya-theo": 8 }, flags: { final_rover_relay: true } },
          cause: "A healthy machine and a cooperating crew created an option that did not exist on Sol One.",
          cutscene: { image: "theo", title: "Echo runs into the storm", text: "The rover climbs above the dust shadow and becomes a moving antenna. Four specialists work one plan without arguing over whose idea it was." }
        }
      ]
    }
  ];

  const endings = {
    trueHome: {
      title: "THE FIRST TRUE HOME",
      summary: "Echo Station survives as more than a shelter. Its crew, systems, and mission purpose remain strong enough to welcome the next expedition."
    },
    greenDawn: {
      title: "GREEN DAWN",
      summary: "The greenhouse becomes the heart of Echo Station. Scientific ambitions shrink, but the base proves that life can repay patient investment."
    },
    pathfinder: {
      title: "THE PATHFINDER SIGNAL",
      summary: "The rover relay carries Echo Station's data through the storm. The solution exists only because earlier choices preserved both machinery and cooperation."
    },
    scienceAtAnyCost: {
      title: "SCIENCE AT ANY COST",
      summary: "Earth receives an extraordinary dataset, but Echo Station pays for every discovery in depleted systems and exhausted people."
    },
    silentStation: {
      title: "THE SILENT STATION",
      summary: "Echo Station survives without a reliable voice to Earth. The crew must decide whether independence is freedom or isolation."
    },
    brokenCouncil: {
      title: "THE BROKEN COUNCIL",
      summary: "The hardware survives, but the crew no longer acts as one team. Every future repair now begins with an argument."
    },
    redNomads: {
      title: "THE RED NOMADS",
      summary: "The base can no longer support the crew. What remains of the mission moves into the rover and searches for a safer shelter."
    },
    lastMessage: {
      title: "THE LAST MESSAGE",
      summary: "The crew preserves the mission record and sends it home before Echo Station enters emergency shutdown."
    },
    heldTogether: {
      title: "HELD TOGETHER",
      summary: "Echo Station reaches morning with scars, unfinished work, and four people who understand exactly what their survival cost."
    }
  };

  return { crew, sources, events, endings };
})();
