import { useState } from "react";
import Icon from "./Icon";
import InfoDialog from "./InfoDialog";
import MovementDiagram from "./MovementDiagram";
import { pairRounds, workoutMinutes, workouts } from "./workouts";
import { dailyProteinTarget } from "./nutrition";

export default function Home({ onNavigate }: { onNavigate: (view: "a" | "b" | "food") => void }) {
  const [showNotes, setShowNotes] = useState(false);
  return (
    <div className="home-page">
      <section className="hero">
        <div>
          <h1>A little stronger.</h1>
          <p>Your everyday strength practice. One 10 kg kettlebell is all you need.</p>
        </div>
        <button className="text-button" onClick={() => setShowNotes(true)}>
          Plan notes
        </button>
      </section>
      <section className="week-strip" aria-label="Weekly schedule">
        <div className="week-label">
          <h2>This week</h2>
          <span>Alternate. Recover. Repeat.</span>
        </div>
        <div className="week-days">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div className={`week-day ${index === 6 ? "rest-day" : index % 2 ? "day-b" : "day-a"}`} key={day}>
              <span>{day}</span>
              <span
                className="day-badge"
                aria-label={index === 6 ? "Rest or walking" : `Workout ${workouts[index % 2].label}`}
              >
                {index === 6 ? <Icon name="sun" size={16} /> : workouts[index % 2].label}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="workout-cards" aria-label="Choose your workout">
        {workouts.map((workout) => (
          <button
            className={`workout-card card-${workout.id}`}
            onClick={() => onNavigate(workout.id)}
            key={workout.id}
            aria-label={`Workout ${workout.label}: ${workout.name}`}
          >
            <div className="card-body">
              <span className="workout-label">Workout {workout.label}</span>
              <h3>{workout.name}</h3>
              <p>{workout.subtitle}</p>
              <span className="card-days">{workout.days.toLowerCase().replaceAll(" · ", " / ")}</span>
            </div>
            <ul className="card-movements">
              {workout.exercises.map((exercise) => (
                <li key={exercise.name}>{exercise.name}</li>
              ))}
            </ul>
            <div className="card-art">
              <MovementDiagram movement={workout.id === "a" ? "crunch" : "curl"} phase={0} />
            </div>
            <div className="card-meta">
              <span>
                <Icon name="clock" size={16} />
                {workoutMinutes} min
              </span>
              <span>{workout.exercises.length} exercises</span>
              <span>{pairRounds.join(" + ")} rounds</span>
            </div>
            <span className="card-arrow">
              <span>View session</span>
              <Icon name="arrow" />
            </span>
          </button>
        ))}
      </section>
      <button className="food-banner" onClick={() => onNavigate("food")} aria-label="Food: daily protein plan">
        <span className="food-banner-copy">
          <strong>Food for the routine.</strong>
          <span>Your daily protein plan</span>
        </span>
        <span className="food-banner-target">
          <strong>
            {dailyProteinTarget}
            <span>g</span>
          </strong>
          <span>protein / day</span>
        </span>
        <Icon name="arrow" />
      </button>
      {showNotes && (
        <InfoDialog title="Your weekly plan" onClose={() => setShowNotes(false)}>
          <p>
            Alternate Workout A on Monday, Wednesday, and Friday with Workout B on Tuesday, Thursday, and Saturday. Rest
            or walk on Sunday.
          </p>
          <p>One 10 kg kettlebell, a mat, and a little space are all you need.</p>
          <p>
            Pair 1 uses three rounds and Pair 2 uses two. Complete both sides of each one-sided exercise before moving
            on. Rest for 60 seconds after each round, except at the end of the session.
          </p>
          <p>
            If starting fresh, use two rounds of both pairs in week one; the fixed player follows the regular three /
            two routine. Finish most sets with 1–3 clean repetitions left. End planks before your hips sag or rotate.
          </p>
          <p>
            Keep a small record of your repetitions. When you reach the upper target in every set for two consecutive
            sessions, use a harder variation or increase resistance. Controlled lowering helps, but ever-slower reps do
            not replace heavier resistance indefinitely.
          </p>
          <p>
            Stop at 25 minutes rather than rushing. Take an extra recovery day if soreness affects technique or
            performance. On climbing days, skip curls and rows; bridges and planks are optional if comfortable.
          </p>
          <p>
            The regular weekly plan gives nine direct biceps sets per arm, plus six rowing sets per arm. Keep walking
            and aim for roughly 140 g of protein daily. Revealing your abs still depends substantially on overall fat
            loss.
          </p>
        </InfoDialog>
      )}
    </div>
  );
}
