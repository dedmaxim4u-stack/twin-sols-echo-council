window.V4_SCENES = (() => {
  const interactions = [
    { jack:"Every cable on this station leads to somebody's air. I need you to see that before the lights dim.", maya:"A power shortage becomes a health problem faster than most people expect.", riley:"The greenhouse is not decoration. Every dark lamp takes something from tomorrow.", theo:"The packet is ready, but a perfect transmission is useless if the habitat cannot breathe." },
    { jack:"The shelter printer can work faster, but it will drink from every battery we have.", maya:"Radiation safety is a margin, not a magic wall. We decide how much risk the crew carries.", riley:"Shielding keeps us safe, but cold roots can erase weeks of patient work.", theo:"The sky looks quiet. The data says that quiet is not the same thing as safe." },
    { jack:"Riley thinks I only hear machines. I hear failures before anyone else does.", maya:"An argument is also mission data. It tells us where trust is failing.", riley:"Jack calls the crop load optional. I call it the part that keeps paying us back.", theo:"When two experts disagree, the loudest voice is not automatically the best model." },
    { jack:"Earth's advice is useful, but the recycler will not wait for a reply.", maya:"Delay changes responsibility. We must act before someone else can approve it.", riley:"A late message can still teach us something—just not what to do this minute.", theo:"I used to wait for Earth. Now I send the question and keep thinking." },
    { jack:"A promise is a system too. Break it often enough and nobody plans around you.", maya:"Keeping every promise can be unsafe. Breaking one without explaining it is worse.", riley:"I marked the recovery shift on the door because I believed your word had weight.", theo:"We can fund air, plants, and science only by admitting what will not happen today." },
    { jack:"My hands are steady enough. That is not the same as saying I am rested.", maya:"Heroic work is still tired work. Exhaustion changes what a safe plan means.", riley:"The rover can bring knowledge home, but not if we spend a person to save it.", theo:"A remote command is slower, but sometimes patience is the safer tool." },
    { jack:"Silence gets the work done for an hour. It does not solve what happens after.", maya:"If we treat conflict as wasted time, it returns as an emergency.", riley:"I can work in another room. I cannot grow trust behind a sealed door.", theo:"The whole station feels the argument even when nobody is speaking." },
    { jack:"The recycler seal needs one careful repair, not three people reaching for it.", maya:"Thin air makes everyone hurry. Hurrying is exactly what makes errors multiply.", riley:"The greenhouse can share oxygen, but the plants will remember the loss.", theo:"The bypass is fast. Fast solutions often send their bill to another system." },
    { jack:"A mission that cannot come home is not a mission plan. It is a wish.", maya:"Enough science to learn and enough power to return—that balance is the real result.", riley:"The storm will not care how valuable the sample was.", theo:"That ridge could answer years of questions. I need someone to help me name the limit." },
    { jack:"Whatever we choose tonight, every system will carry a piece of it.", maya:"The safest ending is not always the strongest ending. The crew must understand the cost.", riley:"A green light in the storm would mean we planned for a future beyond survival.", theo:"This is our last local decision before the long red night. It should sound like all of us." }
  ];

  const morning = [
    [["MAYA","Commander, three systems want the same eight energy units."],["JACK","Then today is not about finding a free choice. It is about naming the cost."]],
    [["THEO","A real solar-weather record raised today's training risk."],["MAYA","Research context, not a Mars forecast. We still prepare as if the trade-off matters."]],
    [["RILEY","The greenhouse is cold, and Jack thinks the recycler comes first."],["JACK","I think air comes before tomatoes. That is not the same accusation."]],
    [["THEO","Earth finally answered yesterday's question."],["MAYA","And Mars has already moved on. We decide with both clocks visible."]],
    [["RILEY","You made a promise. The station has now sent us the bill."],["JACK","Keeping it will move that bill somewhere else."]],
    [["THEO","The rover is whispering from behind the ridge."],["JACK","And any repair team will spend battery, time, and exposure margin."]],
    [["MAYA","Operations pause. The crew cannot repair hardware while trust is breaking."],["RILEY","Then let us finally say what the quiet has been hiding."]],
    [["JACK","Recycler efficiency is falling. We have one clean attempt."],["MAYA","No rushing. Thin air makes bad plans feel urgent."]],
    [["THEO","The ridge sample could define the mission."],["MAYA","Only if the mission survives long enough to bring the result home."]],
    [["MAYA","The long red night begins at local sunset."],["THEO","Shelter, greenhouse and relay. We can carry only one plan all the way through."]]
  ];

  const council = [
    [["MAYA","Life support, greenhouse, or communications."],["RILEY","Whichever room goes dark will remember this choice."],["THEO","And whichever stays lit must earn the power."],["JACK","Commander, choose the system we protect first."]],
    [["THEO","The training seed is locked."],["MAYA","Shielding saves margin; the traverse saves science."],["JACK","Splitting power protects neither perfectly."],["RILEY","That is why this is a real trade-off."]],
    [["RILEY","I will not call living systems optional."],["JACK","And I will not call a failing recycler patient."],["MAYA","We can promise, take sides, or make them repair one system together."],["THEO","The relationship is part of the plan."]],
    [["THEO","Earth says wait. My local model says the window is open."],["MAYA","Both datasets are honest. They arrive at different times."],["JACK","We need a decision before another reply can reach us."],["RILEY","Then show us which uncertainty we are paying for."]],
    [["RILEY","The greenhouse shift is due."],["JACK","So is the recycler strain."],["THEO","Science can fund both only by disappearing for a day."],["MAYA","A promise, air, or the mission result."]],
    [["JACK","I can reach the rover, but I am not fresh."],["THEO","I can try remote recovery, but the signal is weak."],["MAYA","Or we abandon it and bring the battery home."],["RILEY","Every option saves something different."]],
    [["MAYA","No one returns to work until this council names the conflict."],["JACK","Then name the lost hours too."],["RILEY","Trust is not a decoration on the schedule."],["THEO","Commander, decide how the crew works together tomorrow."]],
    [["JACK","Precision repair, greenhouse oxygen, or emergency bypass."],["RILEY","My option costs the crop cycle."],["THEO","Mine costs communications and science."],["MAYA","There is no clean air without a cost somewhere else."]],
    [["THEO","Full run, small sample, or turn home now."],["MAYA","The storm reserve is part of the science plan."],["JACK","A dead rover cannot deliver a brilliant result."],["RILEY","Choose how much discovery tomorrow can afford."]],
    [["MAYA","Seal the shelter, keep life growing, or send the rover as a relay."],["JACK","One plan. No spare power."],["RILEY","One future."],["THEO","And nine sols of consequences standing behind us."]]
  ];

  const responses = {
    jack:{listen:"Good. A steady repair begins with someone hearing the warning before it becomes an alarm.",risk:"The first failure point is always the part we pretended had no cost.",help:"That gives my hands a chance to stay steady. The power still came from somewhere."},
    maya:{listen:"Being heard lowers the chance that tired people hide a mistake.",risk:"The danger we name early is the danger we can plan around.",help:"Rest is not free, Commander. It is still cheaper than an injury."},
    riley:{listen:"Slow systems need someone willing to listen before the damage is obvious.",risk:"Watch tomorrow's crop cycle. Living systems send consequences late.",help:"The seedlings will use every minute you gave them. So will I."},
    theo:{listen:"Thanks. A signal becomes clearer when I stop trying to prove it immediately.",risk:"The model's weakest point is delay. I will mark it instead of hiding it.",help:"That buys me a cleaner hour. We paid for it in battery, so I will use it well."}
  };
  return { interactions, morning, council, responses };
})();
