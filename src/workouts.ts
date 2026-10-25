export type Movement =
  | "squat"
  | "hinge"
  | "circles"
  | "pushup"
  | "lunge"
  | "press"
  | "crunch"
  | "row"
  | "deadlift"
  | "curl"
  | "plank"
  | "rest";

export interface Exercise {
  name: string;
  reps: string;
  movement: Movement;
  cue: string;
  detail: string;
  sides?: boolean;
  seconds?: number;
}

export interface Workout {
  id: "a" | "b";
  number: string;
  name: string;
  subtitle: string;
  days: string;
  description: string;
  exercises: [Exercise, Exercise, Exercise, Exercise];
}

export const warmup: Exercise[] = [
  {
    name: "Bodyweight squats",
    reps: "10 reps",
    movement: "squat",
    cue: "Sit your hips back. Keep your heels grounded.",
    detail: "",
  },
  {
    name: "Unloaded hip hinges",
    reps: "10 reps",
    movement: "hinge",
    cue: "Soft knees. Push your hips back with a long spine.",
    detail: "",
  },
  {
    name: "Arm circles",
    reps: "Both directions",
    movement: "circles",
    cue: "Keep your elbows straight. Circle from your shoulders in both directions.",
    detail: "",
  },
  {
    name: "Easy push-ups",
    reps: "5 reps",
    movement: "pushup",
    cue: "Keep your body in one line. Take it easy.",
    detail: "",
  },
];

export const workouts: Workout[] = [
  {
    id: "a",
    number: "01",
    name: "Push & core",
    subtitle: "Push. Squat. Press. Crunch.",
    days: "MON · WED · FRI",
    description:
      "Build your push strength, work your legs, and finish with your core. Four movements. One good session.",
    exercises: [
      {
        name: "Push-ups",
        reps: "10–15 reps",
        movement: "pushup",
        cue: "Lower as one unit. Press the floor away.",
        detail:
          "Hands just wider than shoulders. Keep your elbows angled back and your core engaged.",
      },
      {
        name: "Kettlebell reverse lunges",
        reps: "8–12 reps",
        movement: "lunge",
        sides: true,
        cue: "Keep the working foot planted. Step back with the other leg.",
        detail:
          "Hold the 10 kg kettlebell at your chest with both hands. The named leg stays forward; step the other foot back, lower with control, then return to standing. Complete one leg, then switch.",
      },
      {
        name: "One-arm overhead press",
        reps: "6–12 reps",
        movement: "press",
        sides: true,
        cue: "Brace your core. Press straight overhead.",
        detail:
          "Keep your ribs down. If 10 kg is too heavy for 6 clean reps, use elevated pike push-ups with your hands on a sturdy sofa or chair.",
      },
      {
        name: "Reverse crunches",
        reps: "12–20 reps",
        movement: "crunch",
        cue: "Curl your pelvis up. Lower with control.",
        detail:
          "Keep your knees bent. Lift your hips slightly off the floor without swinging your legs.",
      },
    ],
  },
  {
    id: "b",
    number: "02",
    name: "Pull & stability",
    subtitle: "Row. Hinge. Curl. Hold.",
    days: "TUE · THU · SAT",
    description:
      "Give your back, biceps, and posterior chain their turn. Finish strong with a little stillness.",
    exercises: [
      {
        name: "One-arm kettlebell row",
        reps: "10–15 reps",
        movement: "row",
        sides: true,
        cue: "Pull your elbow toward your hip. Keep your back still.",
        detail:
          "Hinge forward and support your free hand on a sturdy surface. Lower the kettlebell with control.",
      },
      {
        name: "Kettlebell Romanian deadlift",
        reps: "12–20 reps",
        movement: "deadlift",
        cue: "Hips back. Long spine. Stand tall.",
        detail:
          "Hold the kettlebell with both hands. Keep your knees soft and the weight close to your legs.",
      },
      {
        name: "Kettlebell biceps curl",
        reps: "6–12 reps",
        movement: "curl",
        sides: true,
        cue: "Keep your elbow by your side. No swinging.",
        detail:
          "If 10 kg is too heavy, use both hands for 12–20 reps total: finish that set and skip the other arm. When it gets easy, lower for 3–4 seconds.",
      },
      {
        name: "Side plank",
        reps: "35 sec",
        movement: "plank",
        seconds: 35,
        sides: true,
        cue: "Elbow below shoulder. Stack your hips and hold still.",
        detail:
          "Elbow under your shoulder. Lift your hips and hold a straight line. The timer gives you 35 seconds on each side, within your plan’s 25–45 second range.",
      },
    ],
  },
];

export interface Step {
  kind: "prepare" | "warmup" | "exercise" | "rest";
  name: string;
  seconds?: number;
  exercise?: Exercise;
  side?: "Left" | "Right";
  round?: number;
  block?: number;
}

export function buildSteps(workout: Workout): Step[] {
  const steps: Step[] = [
    { kind: "prepare", name: "Get ready", seconds: 5 },
    { kind: "warmup", name: "Warm up", seconds: 180 },
  ];
  for (let block = 0; block < 2; block++) {
    for (let round = 1; round <= 3; round++) {
      for (const exercise of workout.exercises.slice(
        block * 2,
        block * 2 + 2,
      )) {
        for (const side of exercise.sides
          ? (["Left", "Right"] as const)
          : [undefined]) {
          steps.push({
            kind: "exercise",
            name: exercise.name,
            exercise,
            seconds: exercise.seconds,
            side,
            round,
            block: block + 1,
          });
        }
      }
      if (block !== 1 || round !== 3)
        steps.push({
          kind: "rest",
          name: "Take a breather",
          seconds: 60,
          round,
          block: block + 1,
        });
    }
  }
  return steps;
}
