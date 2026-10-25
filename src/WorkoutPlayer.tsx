import { useEffect, useMemo, useState } from "react";
import MovementDiagram from "./MovementDiagram";
import Icon from "./Icon";
import InfoDialog from "./InfoDialog";
import { buildSteps, warmup } from "./workouts";
import type { Exercise, Workout } from "./workouts";
import { formatTime } from "./timer";
import { useWorkoutTimer } from "./useWorkoutTimer";

interface Props {
  workout: Workout;
  visible: boolean;
  onBack: () => void;
  onFocusChange: (focused: boolean) => void;
}
type Info = "plan" | "warmup" | "form" | "restart" | Exercise;

export default function WorkoutPlayer({
  workout,
  visible,
  onBack,
  onFocusChange,
}: Props) {
  const steps = useMemo(() => buildSteps(workout), [workout]);
  const timer = useWorkoutTimer(steps);
  const { state, step, remaining } = timer;
  const [info, setInfo] = useState<Info | null>(null);
  const ready = state.status === "ready";
  const complete = state.status === "complete";
  const paused = state.status === "paused";
  const active = !ready && !complete;
  const isWarmup = step?.kind === "warmup";
  const isRest = step?.kind === "rest";
  const warmupExercise = warmup[Math.floor(state.elapsed / 15) % warmup.length];
  const illustration = isWarmup
    ? warmupExercise.movement
    : (step?.exercise?.movement ??
      (isRest ? "rest" : workout.exercises[0].movement));
  const next = steps[state.index + 1];
  const completedSets = steps
    .slice(0, state.index)
    .filter((item) => item.kind === "exercise").length;
  const totalSets = steps.filter((item) => item.kind === "exercise").length;
  const circumference = 2 * Math.PI * 144;
  const progress = step?.seconds
    ? Math.min(1, state.elapsed / step.seconds)
    : completedSets / totalSets;

  useEffect(() => {
    if (!visible) timer.pause();
  }, [visible, timer.pause]);
  useEffect(() => {
    if (visible) onFocusChange(!ready);
  }, [visible, ready, onFocusChange]);
  useEffect(() => {
    if (!visible) return;
    document.title = active
      ? `${formatTime(remaining ?? state.elapsed)} · ${step.name} — Daily`
      : "Daily — a little stronger";
    return () => {
      document.title = "Daily — a little stronger";
    };
  }, [visible, active, remaining, state.elapsed, step?.name]);

  if (!visible) return null;

  function showInfo(value: Info) {
    if (active) timer.pause();
    setInfo(value);
  }
  const infoTitle =
    typeof info === "object"
      ? (info?.name ?? "")
      : (
          {
            plan: "Workout notes",
            warmup: "Your warm-up",
            form: "A note on form",
            restart: "Restart this workout?",
          } as const
        )[info ?? "plan"];
  const dialog = info && (
    <InfoDialog title={infoTitle} onClose={() => setInfo(null)}>
      {info === "restart" ? (
        <>
          <p>Start from the beginning? Your current session will be cleared.</p>
          <div className="dialog-actions">
            <button className="text-button" onClick={() => setInfo(null)}>
              Cancel
            </button>
            <button
              className="primary-button"
              onClick={() => {
                timer.reset();
                setInfo(null);
              }}
            >
              Restart workout
            </button>
          </div>
        </>
      ) : info === "warmup" ? (
        <>
          <p>Continuously cycle through these movements for three minutes:</p>
          <ul className="warmup-checklist">
            {warmup.map((exercise) => (
              <li key={exercise.name}>
                <span>{exercise.name}</span>
                <strong>{exercise.reps}</strong>
              </li>
            ))}
          </ul>
        </>
      ) : info === "form" ? (
        <p>
          {step.exercise?.detail ??
            "Set your kettlebell nearby and find a little space. Keep this tab open and your device awake for countdown sounds."}
        </p>
      ) : info === "plan" ? (
        <>
          <p>{workout.description}</p>
          <p>
            Do the two exercises in each pair back-to-back, rest for 60 seconds,
            and repeat for three rounds. Complete all three rounds of Pair 1
            before starting Pair 2.
          </p>
          <p>
            Finish each set with 1–2 clean reps left. Your first week calls for
            two rounds; this timer follows the regular three-round routine.
          </p>
          <p>
            Strength sets use a stopwatch: finish the reps, then tap Set
            complete. Warm-up, rests, and plank holds count down automatically.
          </p>
          <p>Keep this tab open and your device awake for countdown sounds.</p>
        </>
      ) : (
        <>
          <MovementDiagram movement={info.movement} />
          <p>{info.cue}</p>
          <p>{info.detail}</p>
        </>
      )}
    </InfoDialog>
  );

  if (ready)
    return (
      <div className="workout-preview">
        <header className="preview-heading">
          <span className={`preview-art ${workout.id}`}>
            <MovementDiagram movement={workout.exercises[0].movement} />
          </span>
          <div>
            <span className="eyebrow">WORKOUT {workout.number}</span>
            <h1>
              {workout.name}
              <span className="period">.</span>
            </h1>
            <p>4 exercises · 20–23 minutes</p>
          </div>
        </header>
        <p className="page-description">{workout.description}</p>
        <button className="primary-button preview-start" onClick={timer.start}>
          <Icon name="play" size={21} />
          Start workout
        </button>
        <div className="preview-facts">
          <span>
            <Icon name="weight" />
            10 kg kettlebell + mat
          </span>
          <span>3 rounds per pair</span>
          <span>60 sec rests</span>
        </div>
        <section className="preview-exercises" aria-label="Workout exercises">
          <h2>Your session</h2>
          <button
            className="preview-exercise"
            onClick={() => showInfo("warmup")}
          >
            <span className="exercise-thumbnail">
              <Icon name="sun" size={26} />
            </span>
            <span>
              <strong>A little warm-up</strong>
              <small>3 minutes · four easy moves</small>
            </span>
            <Icon name="arrow" size={17} />
          </button>
          {[0, 1].map((block) => (
            <div className="preview-pair" key={block}>
              <p className="pair-label">
                PAIR {block + 1}
                <span>Back-to-back · 3 rounds</span>
              </p>
              {workout.exercises
                .slice(block * 2, block * 2 + 2)
                .map((exercise) => (
                  <button
                    className="preview-exercise"
                    key={exercise.name}
                    onClick={() => showInfo(exercise)}
                  >
                    <span className="exercise-thumbnail">
                      <MovementDiagram movement={exercise.movement} />
                    </span>
                    <span>
                      <strong>{exercise.name}</strong>
                      <small>
                        {exercise.reps}
                        {exercise.sides
                          ? exercise.movement === "lunge"
                            ? " per leg"
                            : exercise.movement === "plank"
                              ? " per side"
                              : " per arm"
                          : ""}
                      </small>
                    </span>
                    <Icon name="arrow" size={17} />
                  </button>
                ))}
            </div>
          ))}
        </section>
        <button
          className="text-button preview-help"
          onClick={() => showInfo("plan")}
        >
          Workout notes
          <Icon name="arrow" size={17} />
        </button>
        {dialog}
      </div>
    );

  return (
    <section
      className={`focus-workout ${isRest ? "is-rest" : ""}`}
      aria-label="Workout timer"
    >
      <header className="focus-top">
        <button
          className="icon-button"
          onClick={onBack}
          aria-label="Back to overview"
        >
          <Icon name="back" size={22} />
        </button>
        <span className="eyebrow">DAILY / WORKOUT {workout.number}</span>
        <button
          className="icon-button"
          onClick={timer.toggleSound}
          aria-label={timer.sound ? "Mute sounds" : "Enable sounds"}
          aria-pressed={timer.sound}
        >
          <Icon name={timer.sound ? "volume" : "mute"} />
        </button>
      </header>
      {complete ? (
        <div className="session-complete">
          <header>
            <span className="eyebrow">ANOTHER GOOD DAY IN THE BOOKS</span>
            <h1>
              Well done<span className="period">.</span>
            </h1>
            <p>You completed {workout.name.toLowerCase()}.</p>
          </header>
          <div className="celebration-art">
            <svg viewBox="0 0 300 240" aria-hidden="true">
              {Array.from({ length: 16 }, (_, index) => {
                const angle = (index * Math.PI) / 8;
                const x = 150 + Math.cos(angle) * (index % 2 ? 115 : 95);
                const y = 120 + Math.sin(angle) * (index % 2 ? 100 : 85);
                return (
                  <path
                    key={index}
                    d={`M${x} ${y}l${Math.cos(angle + 1) * 9} ${Math.sin(angle + 1) * 9}`}
                    stroke={["#839b61", "#c49b75", "#b4bf8e"][index % 3]}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                );
              })}
              <circle cx="150" cy="120" r="62" fill="#e5edcf" />
              <path
                d="m126 119 16 16 33-35"
                stroke="#77934e"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <dl className="completion-stats">
            <div>
              <dt>Rounds per pair</dt>
              <dd>3</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatTime(state.totalElapsed)}</dd>
            </div>
            <div>
              <dt>Sets & sides</dt>
              <dd>{totalSets}</dd>
            </div>
          </dl>
          <p className="completion-message">
            Small sessions. Lasting progress.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              timer.reset();
              onBack();
            }}
          >
            Continue
            <Icon name="arrow" />
          </button>
        </div>
      ) : (
        <>
          <div className="focus-content">
            <header className="focus-heading" aria-live="polite">
              <span>
                {paused
                  ? "PAUSED · TAKE YOUR TIME"
                  : step.kind === "prepare"
                    ? "FIND YOUR SPACE"
                    : isWarmup
                      ? "A LITTLE WARM-UP"
                      : isRest
                        ? `PAIR ${step.block} · ROUND ${step.round} COMPLETE`
                        : `${completedSets + 1} OF ${totalSets} · ROUND ${step.round} OF 3`}
              </span>
              <h1>{step.name}</h1>
              <p>
                {step.side
                  ? `${step.side} ${step.exercise?.movement === "lunge" ? "leg" : step.exercise?.movement === "plank" ? "side" : "arm"} · `
                  : ""}
                {step.exercise?.reps ??
                  (isWarmup
                    ? "Cycle through all four movements"
                    : isRest
                      ? "Breathe. Relax your shoulders."
                      : "We’ll start with a 3-minute warm-up")}
              </p>
            </header>
            <div className="movement-stage">
              <div
                className={`movement-ring ${remaining !== undefined && remaining <= 3 ? "last-seconds" : ""}`}
              >
                <svg
                  className="focus-ring"
                  viewBox="0 0 300 300"
                  aria-hidden="true"
                >
                  <circle cx="150" cy="150" r="144" className="ring-track" />
                  <circle
                    cx="150"
                    cy="150"
                    r="144"
                    className="ring-fill"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference * (step.seconds ? progress : 1 - progress)
                    }
                  />
                </svg>
                <MovementDiagram
                  movement={illustration}
                  playing={!paused}
                  side={step.side}
                />
              </div>
            </div>
            <div
              className={`focus-countdown ${remaining !== undefined && remaining <= 3 ? "last-seconds" : ""}`}
            >
              <strong
                role="timer"
                aria-label={
                  remaining === undefined
                    ? "Set elapsed time"
                    : "Time remaining"
                }
              >
                {formatTime(remaining ?? state.elapsed)}
              </strong>
              <span>
                {remaining === undefined
                  ? "SET ELAPSED · GO AT YOUR PACE"
                  : paused
                    ? "PAUSED"
                    : "REMAINING"}
              </span>
            </div>
            <p className="focus-cue">
              {isWarmup
                ? `${warmupExercise.name}: ${warmupExercise.reps}. ${warmupExercise.cue}`
                : (step.exercise?.cue ??
                  (isRest
                    ? "Let your breathing settle. A fresh set is coming."
                    : "Set your kettlebell nearby and get comfortable."))}
            </p>
          </div>
          <footer className="focus-footer">
            <div className="focus-controls">
              <button
                className="pause-button"
                onClick={paused ? timer.start : timer.pause}
                aria-label={paused ? "Resume workout" : "Pause"}
              >
                <Icon name={paused ? "play" : "pause"} size={24} />
              </button>
              <button className="primary-button" onClick={timer.advance}>
                {step.seconds === undefined
                  ? "Set complete"
                  : isRest
                    ? "Skip rest"
                    : isWarmup
                      ? "Skip warm-up"
                      : step.kind === "exercise"
                        ? "Skip hold"
                        : "Skip countdown"}
                <Icon name={step.seconds === undefined ? "check" : "skip"} />
              </button>
            </div>
            <p className="focus-next">
              UP NEXT{" "}
              <strong>
                {next
                  ? `${next.name}${next.side ? ` · ${next.side.toLowerCase()}` : ""}`
                  : "Session complete. You did it."}
              </strong>
            </p>
            <div className="focus-meta">
              <span>{formatTime(state.totalElapsed)} total</span>
              <button
                className="text-button"
                onClick={() => showInfo(isWarmup ? "warmup" : "form")}
              >
                Guide
              </button>
              <button
                className="text-button"
                onClick={() => showInfo("restart")}
              >
                <Icon name="reset" size={15} />
                Restart
              </button>
            </div>
            {timer.audioUnavailable && (
              <p className="audio-note" role="status">
                Audio isn’t available. Follow the visual countdown.
              </p>
            )}
          </footer>
        </>
      )}
      {dialog}
    </section>
  );
}
