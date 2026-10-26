export type Movement =
  | "march"
  | "squat"
  | "circles"
  | "pushup"
  | "lunge"
  | "press"
  | "crunch"
  | "row"
  | "bridge"
  | "curl"
  | "plank"
  | "rest";

export interface Exercise {
  name: string;
  reps: string;
  movement: Movement;
  cue: string;
  detail: string;
  sides?: "arm" | "leg" | "side";
  seconds?: number;
}

export interface Workout {
  id: "a" | "b";
  label: "A" | "B";
  name: string;
  subtitle: string;
  days: string;
  description: string;
  exercises: [Exercise, Exercise, Exercise, Exercise];
}

export const pairRounds = [3, 2] as const;
export const workoutMinutes = "20–25";

export const workouts: Workout[] = [
  {
    id: "a",
    label: "A",
    name: "Push-ups & abs",
    subtitle: "Push. Crunch. Lunge. Press.",
    days: "MON · WED · FRI",
    description: "Push-ups and abs come first. Follow with lunges and overhead presses, with time for controlled reps.",
    exercises: [
      {
        name: "Push-ups",
        reps: "8–20 reps",
        movement: "pushup",
        cue: "Lower as one unit. Press the floor away.",
        detail:
          "Choose a version that makes the last repetitions challenging. Keep your body in one line and your elbows angled back. If standard push-ups are too easy, elevate your feet on a low, stable surface.",
      },
      {
        name: "Reverse crunches",
        reps: "10–20 reps",
        movement: "crunch",
        cue: "Curl your pelvis up. Lower without swinging your knees.",
        detail:
          "Keep your head and shoulders on the mat and your knees bent. Curl your pelvis slightly off the floor, rather than just swinging your knees. Progress by reducing momentum and lengthening your legs slightly.",
      },
      {
        name: "Kettlebell reverse lunges",
        reps: "8–12 reps",
        movement: "lunge",
        sides: "leg",
        cue: "Keep the working foot planted. Step back with the other leg.",
        detail:
          "Hold the kettlebell at your chest with both hands. The named leg stays forward; step the other foot back, lower with control, then return to standing. Complete both legs before moving on.",
      },
      {
        name: "One-arm overhead press",
        reps: "6–12 reps",
        movement: "press",
        sides: "arm",
        cue: "Keep your ribs down. Press without leaning backward.",
        detail:
          "Brace your core and press from the rack to a straight arm overhead without leaning backward. If 10 kg is too heavy for six controlled repetitions, substitute pike push-ups: complete one set on the first arm step and skip the second arm step.",
      },
    ],
  },
  {
    id: "b",
    label: "B",
    name: "Biceps first",
    subtitle: "Curl. Hold. Row. Bridge.",
    days: "TUE · THU · SAT",
    description:
      "Prioritize biceps and side planks. Finish with supported rows and single-leg glute bridges. No deadlifts.",
    exercises: [
      {
        name: "Kettlebell biceps curl",
        reps: "6–15 reps",
        movement: "curl",
        sides: "arm",
        cue: "Keep your torso still and your elbow by your side.",
        detail:
          "Curl without swinging your torso. If 10 kg is too heavy, hold the kettlebell with both hands for 10–20 repetitions: complete one set on the first arm step and skip the second arm step. Eventually increase resistance as you progress.",
      },
      {
        name: "Side plank",
        reps: "20–40 sec",
        movement: "plank",
        seconds: 30,
        sides: "side",
        cue: "Elbow below shoulder. End the hold before your hips sag or rotate.",
        detail:
          "Stack your hips and keep a straight line on your forearm. The fixed timer uses 30 seconds per side, within your 20–40-second range. Tap Skip hold sooner if your hips start to sag or rotate. Complete both sides before moving on.",
      },
      {
        name: "Supported one-arm row",
        reps: "10–20 reps",
        movement: "row",
        sides: "arm",
        cue: "Brace your free hand. Pull your elbow toward your hip.",
        detail:
          "Support your free hand on a sturdy surface. Keep your back and torso still while pulling your elbow toward your hip, then lower with control. Complete both arms before moving on.",
      },
      {
        name: "Single-leg glute bridge",
        reps: "10–15 reps",
        movement: "bridge",
        sides: "leg",
        cue: "Press through your planted foot. Lift your hips with a level pelvis.",
        detail:
          "Lie on your back with one foot planted. The named leg is the working leg. Lift your hips while keeping your pelvis level; do not finish by arching your lower back. Start with the other foot lightly assisting if needed. Progress to one leg, then add the kettlebell securely across your hips when bodyweight becomes easy. Complete both legs before moving on.",
      },
    ],
  },
];

type WarmupExercise = Exercise & { seconds: number };

export function warmupFor(workout: Workout): WarmupExercise[] {
  return [
    {
      name: "Brisk marching",
      reps: "45 sec",
      seconds: 45,
      movement: "march",
      cue: "Stand tall. Alternate your knees and pump the opposite arm.",
      detail: "",
    },
    {
      name: "Bodyweight squats",
      reps: "30 sec",
      seconds: 30,
      movement: "squat",
      cue: "Sit your hips back. Keep your heels grounded.",
      detail: "",
    },
    {
      name: "Arm circles",
      reps: "45 sec · both directions",
      seconds: 45,
      movement: "circles",
      cue: "Keep your elbows straight. Circle from your shoulders in both directions.",
      detail: "",
    },
    ...workout.exercises.map((exercise) => ({
      ...exercise,
      name: `Easy ${exercise.name.toLowerCase()}`,
      reps: exercise.movement === "plank" ? "Short easy holds, both sides" : "A few easy reps",
      seconds: 15,
    })),
  ];
}

export function warmupAt(moves: WarmupExercise[], elapsed: number): WarmupExercise {
  for (const move of moves) {
    if (elapsed < move.seconds) return move;
    elapsed -= move.seconds;
  }
  return moves[moves.length - 1];
}

export interface Step {
  kind: "prepare" | "warmup" | "exercise" | "rest";
  name: string;
  seconds?: number;
  exercise?: Exercise;
  side?: "Left" | "Right";
  round?: number;
  rounds?: number;
  block?: number;
}

export function buildSteps(workout: Workout): Step[] {
  const steps: Step[] = [
    { kind: "prepare", name: "Get ready", seconds: 5 },
    { kind: "warmup", name: "Warm up", seconds: warmupFor(workout).reduce((sum, move) => sum + move.seconds, 0) },
  ];
  for (const [block, rounds] of pairRounds.entries()) {
    for (let round = 1; round <= rounds; round++) {
      for (const exercise of workout.exercises.slice(block * 2, block * 2 + 2)) {
        for (const side of exercise.sides ? (["Left", "Right"] as const) : [undefined]) {
          steps.push({
            kind: "exercise",
            name: exercise.name,
            exercise,
            seconds: exercise.seconds,
            side,
            round,
            rounds,
            block: block + 1,
          });
        }
      }
      if (block !== pairRounds.length - 1 || round !== rounds)
        steps.push({
          kind: "rest",
          name: "Take a breather",
          seconds: 60,
          round,
          rounds,
          block: block + 1,
        });
    }
  }
  return steps;
}
