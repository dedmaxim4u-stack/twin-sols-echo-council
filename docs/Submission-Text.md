# TWIN SOLS: ECHO COUNCIL - Submission Text

## 1. Summary

TWIN SOLS: ECHO COUNCIL is a browser-based visual novel and junior astronaut mission trainer for children ages 7-12. Players lead a fictional Mars outpost through ten sols, balancing Power, Life Support and Radiation Safety while crew trust, health, fatigue, food production, communications and rover condition shape which plans remain possible. Every Council choice gives something useful and charges an immediate or delayed cost, so the player can connect a decision with its consequences. NASA DONKI events seed the solar-weather training risk, while OSDR, RadLab and Mars Trek ground health, radiation and terrain lessons. Live, cached and archived data are labelled separately, and the game never presents research data as an operational Mars forecast. The project matters because it turns difficult mission-planning ideas into a story children can explore, replay and discuss without an account or installation.

## 2. Project Demonstration

Public slide presentation: https://github.com/dedmaxim4u-stack/twin-sols-echo-council/blob/main/docs/Twin-Sols-Echo-Council-Pitch.pdf

Live game: https://twin-sols.vercel.app

Source code: https://github.com/dedmaxim4u-stack/twin-sols-echo-council

The demonstration contains seven slides, including the title slide.

## 3. Project Details

TWIN SOLS: ECHO COUNCIL combines a resource-management simulation with a visual novel. The player explores Echo Station by selecting highlighted exits, talks with four specialists and spends three time blocks each sol on conversations, repairs, research or rest. Movement, Status, Crew and NASA data inspection are free. At the Crew Council, the game presents three technical plans with their current resource change and future risk. After the decision, a consequence scene shows the result. The player then returns to the Commander Cabin and chooses Sleep, which applies overnight consumption, recovery and delayed effects before the next sol.

The simulation keeps three primary resources visible: Power, Life Support and Radiation Safety. Greenhouse, communications, shelter, rover condition and science form a deeper layer. Crew health, trust, energy and conflict flags affect whether a technically valid plan can succeed. This means social choices support the engineering mechanics rather than replace them.

NASA data enters the game in traceable ways. The browser requests current DONKI FLR, SEP and CME records to seed the solar-event training level. A cached record or bundled archived snapshot keeps the game playable offline. OSDR research themes inform fatigue, recovery, health and plant consequences. RadLab provides real ISS dose-rate units as a comparison, not a Mars measurement. Mars Trek grounds Gale Crater terrain and rover-route decisions. The game labels every record as LIVE NASA DATA, CACHED NASA DATA or ARCHIVED NASA TRAINING RECORD and links players to the official sources.

The intended impact is a clear learning conversation: "What did I gain, and what did I spend now or later?" The story, character reactions and nine endings encourage replay without treating failure as punishment. The interface uses plain English, large controls, keyboard, mouse and touch input, reduced-motion support, contextual definitions and a focused HUD for children ages 7-12. No account or download is required.

The game uses HTML5, CSS and JavaScript, with JSON data snapshots, local browser saves, GitHub for public source code and Vercel for deployment. Codex using GPT-5.6 Sol supported implementation, debugging, UI iteration, content structuring and presentation drafting. Toktobekov Adylbek directed the project, prompts and story. Narynbekov Alimbek contributed ideas and concept development. Automated tests evaluate all 59,049 Council choice chains and confirm that all nine endings remain reachable.

## 4. NASA Data

| Link Text | Link URL |
|---|---|
| NASA Open APIs | https://api.nasa.gov/ |
| NASA CCMC DONKI | https://ccmc.gsfc.nasa.gov/tools/DONKI/ |
| NASA Open Science Data Repository (OSDR) | https://osdr.nasa.gov/bio/repo/ |
| OSDR RadLab Radiation Dosimetry Database | https://visualization.osdr.nasa.gov/radlab/gui/data-api/ |
| NASA Mars Trek | https://trek.nasa.gov/mars/ |

## 5. Space Agency Partner and Other Data

| Link Text | Link URL |
|---|---|
| Canadian Space Agency - Space Resources for STEM and Youth Organizations | https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp |
| Canadian Space Agency - Food Production on the Moon and in Remote Areas | https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/ |
| TWIN SOLS Source Code on GitHub | https://github.com/dedmaxim4u-stack/twin-sols-echo-council |
| TWIN SOLS Live Game on Vercel | https://twin-sols.vercel.app |
| OpenAI Codex | https://openai.com/codex/ |
| Ren'Py Visual Novel Interface Documentation (design reference) | https://www.renpy.org/doc/html/screen_special.html |
| WCAG 2.2 Target Size Guidance (accessibility reference) | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum |

## Team

- Toktobekov Adylbek - captain, prompt direction and story writing
- Narynbekov Alimbek - ideas and concept development

## AI Disclosure

Codex using GPT-5.6 Sol supported implementation, debugging, UI iteration, content structuring and presentation drafting. The team chose the concept, story direction, mechanics and final project decisions.
