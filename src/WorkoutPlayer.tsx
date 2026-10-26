import { useEffect, useMemo, useState } from "react";
import MovementDiagram from "./MovementDiagram";
import Icon from "./Icon";
import InfoDialog from "./InfoDialog";
import { buildSteps, pairRounds, warmupAt, warmupFor, workoutMinutes } from "./workouts";
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

export default function WorkoutPlayer({ workout, visible, onBack, onFocusChange }: Props) {
  const steps = useMemo(() => buildSteps(workout), [workout]);
  const warmup = useMemo(() => warmupFor(workout), [workout]);
  const timer = useWorkoutTimer(steps);
  const { state, step, remaining, pause } = timer;
  const [info, setInfo] = useState<Info | null>(null);
  const ready = state.status === "ready";
  const complete = state.status === "complete";
  const paused = state.status === "paused";
  const active = !ready && !complete;
  const isWarmup = step?.kind === "warmup";
  const isRest = step?.kind === "rest";
  const warmupExercise = warmupAt(warmup, state.elapsed);
  const illustration = isWarmup
    ? warmupExercise.movement
    : (step?.exercise?.movement ?? (isRest ? "rest" : workout.exercises[0].movement));
  const next = steps[state.index + 1];
  const completedSets = steps.slice(0, state.index).filter((item) => item.kind === "exercise").length;
  const totalSets = steps.filter((item) => item.kind === "exercise").length;
  const circumference = 2 * Math.PI * 144;
  const progress = step?.seconds ? Math.min(1, state.elapsed / step.seconds) : completedSets / totalSets;

  useEffect(() => {
    if (!visible) pause();
  }, [visible, pause]);
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
          <p>
            Follow these movements for three minutes. Finish with a few easy repetitions of today's exercises, covering
            both sides as needed.
          </p>
          <ul className="warmup-checklist">
            {warmup.map((exercise) => (
              <li key={exercise.name}>
                <span>{exercise.name}</span>
                <strong>{exercise.seconds} sec</strong>
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
            Complete both exercises in Pair 1 for three rounds, then both exercises in Pair 2 for two rounds. Do both
            sides of a one-sided exercise before moving on. Rest for 60 seconds after each round except the final one.
          </p>
          <p>
            Finish most repetition sets with 1–3 clean reps left. End planks before your hips sag or rotate. If starting
            fresh, use two rounds of both pairs in week one; this fixed timer follows the regular three / two routine.
          </p>
          <p>
            Strength sets use a stopwatch: finish the reps, then tap Set complete. Warm-up, rests, and plank holds count
            down automatically.
          </p>
          <p>Keep this tab open and your device awake for countdown sounds.</p>
          <p>
            Stop at 25 minutes rather than rushing. Take an extra recovery day if soreness affects technique or
            performance. On climbing days, skip curls and rows; do bridges and planks only if comfortable.
          </p>
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
          <div>
            <span className="session-context">Workout {workout.label}</span>
            <h1>
              {workout.name}
              <span className="period">.</span>
            </h1>
            <p>4 exercises · {workoutMinutes} minutes</p>
          </div>
          <button className="text-button preview-help" onClick={() => showInfo("plan")} aria-label="Workout notes">
            <span>Workout notes</span>
            <Icon name="info" size={18} />
          </button>
        </header>
        <p className="page-description">{workout.description}</p>
        <div className="preview-art">
          <MovementDiagram movement={workout.exercises[0].movement} phase={0} />
        </div>
        <button className="primary-button preview-start" onClick={timer.start}>
          <Icon name="play" size={21} />
          Start workout
        </button>
        <div className="preview-facts">
          <span>
            <Icon name="weight" />
            10 kg kettlebell + mat
          </span>
          <span>{pairRounds.join(" + ")} rounds</span>
          <span>60 sec rests</span>
        </div>
        <section className="preview-exercises" aria-label="Workout exercises">
          <h2>Your session</h2>
          <button className="preview-exercise" onClick={() => showInfo("warmup")}>
            <span className="exercise-thumbnail">
              <Icon name="sun" size={26} />
            </span>
            <span>
              <strong>A little warm-up</strong>
              <small>3 minutes · prepare for today</small>
            </span>
            <Icon name="arrow" size={17} />
          </button>
          {pairRounds.map((rounds, block) => (
            <div className="preview-pair" key={block}>
              <p className="pair-label">
                Pair {block + 1}
                <span>Back-to-back · {rounds} rounds</span>
              </p>
              {workout.exercises.slice(block * 2, block * 2 + 2).map((exercise) => (
                <button className="preview-exercise" key={exercise.name} onClick={() => showInfo(exercise)}>
                  <span className="exercise-thumbnail">
                    <MovementDiagram movement={exercise.movement} phase={0} />
                  </span>
                  <span>
                    <strong>{exercise.name}</strong>
                    <small>
                      {exercise.reps}
                      {exercise.sides ? ` per ${exercise.sides}` : ""}
                    </small>
                  </span>
                  <Icon name="arrow" size={17} />
                </button>
              ))}
            </div>
          ))}
        </section>
        {dialog}
      </div>
    );

  return (
    <section className={`focus-workout ${isRest ? "is-rest" : ""}`} aria-label="Workout timer">
      <header className="focus-top">
        <button className="icon-button" onClick={onBack} aria-label="Back to overview">
          <Icon name="back" size={22} />
        </button>
        <span className="session-context">Daily / Workout {workout.label}</span>
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
            <span className="session-context">Session complete</span>
            <h1>
              Well done<span className="period">.</span>
            </h1>
            <p>You completed {workout.name.toLowerCase()}.</p>
          </header>
          <div className="celebration-art">
            <svg viewBox="0 0 300 240" aria-hidden="true">
              <circle cx="150" cy="120" r="62" fill="var(--surface)" />
              <path
                d="m126 119 16 16 33-35"
                stroke="var(--accent)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <dl className="completion-stats">
            <div>
              <dt>Pair 1 + Pair 2</dt>
              <dd>{pairRounds.join(" + ")}</dd>
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
          <p className="completion-message">Small sessions. Lasting progress.</p>
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
                  ? "Paused · take your time"
                  : step.kind === "prepare"
                    ? "Find your space"
                    : isWarmup
                      ? "A little warm-up"
                      : isRest
                        ? `Pair ${step.block} · round ${step.round} complete`
                        : `Pair ${step.block} · Round ${step.round} of ${step.rounds}`}
              </span>
              <h1>{step.name}</h1>
              <p>
                {step.side ? `${step.side} ${step.exercise?.sides} · ` : ""}
                {(step.exercise?.seconds ? `${step.exercise.seconds} sec` : step.exercise?.reps) ??
                  (isWarmup
                    ? "March, squat, circle, then easy reps"
                    : isRest
                      ? "Breathe. Relax your shoulders."
                      : "We’ll start with a 3-minute warm-up")}
              </p>
            </header>
            <div className="movement-stage">
              <div className={`movement-ring ${remaining !== undefined && remaining <= 3 ? "last-seconds" : ""}`}>
                <svg className="focus-ring" viewBox="0 0 300 300" aria-hidden="true">
                  <circle cx="150" cy="150" r="144" className="ring-track" />
                  <circle
                    cx="150"
                    cy="150"
                    r="144"
                    className="ring-fill"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (step.seconds ? progress : 1 - progress)}
                  />
                </svg>
                <MovementDiagram movement={illustration} playing={!paused} side={step.side} />
              </div>
            </div>
            <div className={`focus-countdown ${remaining !== undefined && remaining <= 3 ? "last-seconds" : ""}`}>
              <strong role="timer" aria-label={remaining === undefined ? "Set elapsed time" : "Time remaining"}>
                {formatTime(remaining ?? state.elapsed)}
              </strong>
              <span>{remaining === undefined ? "Set elapsed · go at your pace" : paused ? "Paused" : "Remaining"}</span>
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
              Up next{" "}
              <strong>
                {next
                  ? `${next.name}${next.side ? ` · ${next.side.toLowerCase()}` : ""}`
                  : "Session complete. You did it."}
              </strong>
            </p>
            <div className="focus-meta">
              <span>{formatTime(state.totalElapsed)} total</span>
              <button className="text-button" onClick={() => showInfo(isWarmup ? "warmup" : "form")}>
                Guide
              </button>
              <button className="text-button" onClick={() => showInfo("restart")}>
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
