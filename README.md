# Daily

A small, hardcoded workout and food dashboard. React, TypeScript, Vite, and plain CSS. No backend, account, or settings screen.

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. Use Node 22.18+.

## Checks

- `npm test` runs Vitest unit and React component tests in jsdom.
- `npm run test:watch` runs the same tests interactively.
- `npm run build` type-checks the application and tests, then builds the app.

Tests cover both workout sequences, every screen, exercise guides, native dialogs, timer transitions, pause/resume, restart confirmation, navigation with preserved sessions, side-plank holds, the last three audio cues, mute, unavailable audio, and wake-lock cleanup. There is no end-to-end test suite or browser test dependency.

Browser QA is separate from these unit tests. The integrated browser was used to check the overview, both previews, every workout phase, completion, nutrition, and help dialogs. Phone viewport checks include 320×568, 360×640, 390×844, 430×932, and 844×390 landscape. Main screens fit the viewport without scrolling or off-screen controls; workout controls are at least 44×44 CSS pixels. Longer notes scroll inside native dialogs. These are browser viewport checks, not physical-device tests.

## Movement diagram review

The diagrams use one set of adult proportions, fixed-length limb segments, and three key poses per movement. Strength movements repeat the middle pose on the return; the side plank is a stationary hold. Right-side steps mirror the figure. CSS controls the pose cycle, pause, and reduced-motion behavior.

All 33 key poses were reviewed together for consistent scale, joint connections, floor contact, and equipment placement. Geometry tests check segment lengths, planted support points, elbow/knee angles, neutral hinges, fixed curl elbows, overhead alignment, pelvic movement, and the isometric plank. These checks protect the drawing geometry; they do not constitute clinical validation of exercise technique.

Form references checked on 25 October 2026:

| Diagram                       | Reference and comparison                                                                                                                                                                                                                                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Squat                         | [ACE bodyweight squat](https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/) and [StrengthLog filmed demonstration](https://www.strengthlog.com/best-bodyweight-exercises/): planted feet, hips back/down, thighs approximately parallel.                                                                               |
| Hip hinge / Romanian deadlift | [Rehab Hero kettlebell RDL](https://www.rehabhero.ca/exercise/kettlebell-romanian-deadlift), including its demonstration photo: soft knees, hips moving back, neutral trunk, weight near the legs. The warm-up uses the same pattern without a weight.                                                                                                  |
| Arm circles                   | [Health and Wellbeing Queensland](https://hw.qld.gov.au/physical-activity/arm-circles/), written steps: straight arms circle from the shoulders in a large windmill path. A curved arrow connects the three sampled positions.                                                                                                                          |
| Push-up                       | [NASM push-up](https://www.nasm.org/resource-center/exercise-library/push-up) and [StrengthLog filmed demonstration](https://www.strengthlog.com/best-bodyweight-exercises/): hands/toes planted, aligned trunk/legs, elbows bend on descent.                                                                                                           |
| Reverse lunge                 | [Original Kettlebell step photos](https://www.originalkettlebell.com/exercise/kettlebell-reverse-lunge/): two-hand chest hold, backward step, rear heel raised, rear knee near the floor, return to standing. The app completes each side separately.                                                                                                   |
| One-arm press                 | [Original Kettlebell single-arm press photos](https://www.originalkettlebell.com/en-us/exercise/kettlebell-single-arm-press): rack position, vertical forearm, extended arm overhead, bell behind the wrist.                                                                                                                                            |
| Reverse crunch                | [ACE reverse crunch](https://www.acefitness.org/resources/everyone/exercise-library/76/reverse-crunch/) and [trainer demonstration photos](https://hips.hearstapps.com/hmg-prod/images/766/images/reverse-crunch-1492648561.jpg?resize=980%3A%2A): head/shoulders down, bent knees, pelvis curls toward the ribs.                                       |
| Supported one-arm row         | [Physitrack kettlebell row video](https://us.physitrack.com/home-exercise-video/kettlebell-single-arm-bent-over-row) and [Nuffield Health instructions](https://www.nuffieldhealth.com/article/how-to-kettlebell-row): free hand visibly supported, trunk still, elbow draws back and the weight rises toward the side.                                 |
| Curl                          | [StrengthLog kettlebell curl demonstration](https://www.strengthlog.com/kettlebell-curl/) and [Mayo Clinic instructions](https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/biceps-curl/vid-20084675): fixed upper arm, elbow flexion, no torso swing. StrengthLog shows both arms; the app illustrates the same motion one arm at a time. |
| Side plank                    | [NASM side plank](https://www.nasm.org/resource-center/exercise-library/side-plank) and [US Marine Corps video](https://www.dvidshub.net/video/640254/side-plank): forearm support, elbow below shoulder, stacked hips/feet, straight legs, static hold.                                                                                                |

References informed original SVG drawings; no reference photos or videos are bundled in the app. The rest screen's bottle is decorative.

## The routine

The workouts and food notes come from the supplied ChatGPT conversation, **Training plan questions**. Workout 1 is A (push-ups, reverse lunges, overhead presses, reverse crunches); Workout 2 is B (rows, Romanian deadlifts, curls, side planks).

The player uses a 5-second lead-in, a 3-minute warm-up, 3 rounds per exercise pair, 60-second rests after each round except the final one, and a 35-second hold on each side of the side plank. These fixed choices use the original plan’s ranges. Strength sets stay rep-based: tap **Set complete** after the prescribed reps. Each side has its own step.

Your original plan calls for **2 rounds in week one**, then 3 thereafter. This app implements the regular 3-round routine. If using the two-handed curl alternative, complete the reps on the first arm step and skip the second arm step.

Sounds play for the final three seconds and interval changes using Web Audio, enabled by the start button. The timer uses elapsed time rather than counting callbacks. Navigating away pauses the current workout; returning to it preserves progress until the page reloads. The browser’s screen wake lock is used where available. Keep the tab open and the device awake for reliable audio; mobile browsers can suspend background pages. Refreshing resets the session.

The app uses a `100dvh` grid, safe-area padding, and CSS container units to fit the movement ring around the available space. It prevents page overscroll, and long guidance lives in native dialogs. All movement animation uses CSS and respects reduced-motion preferences. Google Fonts is the only external visual request; system font fallbacks work offline. All workout data, diagrams, timers, and audio are local.
