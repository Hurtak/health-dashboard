import { useState } from "react";
import Icon from "./Icon";
import InfoDialog from "./InfoDialog";
import MovementDiagram from "./MovementDiagram";
import { workouts } from "./workouts";

export default function Home({ onNavigate }: { onNavigate: (view: "a" | "b" | "food") => void }) {
  const [showNotes, setShowNotes] = useState(false);
  return (
    <div className="home-page">
      <section className="hero">
        <div>
          <span className="eyebrow">YOUR EVERYDAY STRENGTH ROUTINE</span>
          <h1>
            A little stronger.
            <br />
            <span>Every day.</span>
          </h1>
          <p>Two simple workouts. A little consistency.</p>
        </div>
        <button className="text-button" onClick={() => setShowNotes(true)}>
          Plan notes
        </button>
      </section>
      <section className="week-strip" aria-label="Weekly schedule">
        <div className="week-label">
          <span className="eyebrow">THE RHYTHM</span>
          <strong>A week in balance.</strong>
        </div>
        <div className="week-days">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div className={`week-day ${index === 6 ? "rest-day" : index % 2 ? "day-b" : "day-a"}`} key={day}>
              <span>{day}</span>
              <span className="day-badge" aria-label={index === 6 ? "Rest or walking" : `Workout ${(index % 2) + 1}`}>
                {index === 6 ? <Icon name="sun" size={16} /> : index % 2 ? "02" : "01"}
              </span>
            </div>
          ))}
        </div>
      </section>
      <div className="section-title">
        <h2>Make time for you.</h2>
        <span>20–23 MINUTES IS A GOOD START</span>
      </div>
      <section className="workout-cards" aria-label="Choose your workout">
        {workouts.map((workout) => (
          <button
            className={`workout-card card-${workout.id}`}
            onClick={() => onNavigate(workout.id)}
            key={workout.id}
            aria-label={`Workout ${workout.number === "01" ? "1" : "2"}: ${workout.name}`}
          >
            <div className="card-art">
              <span className="workout-pill">WORKOUT {workout.number}</span>
              <span className="art-circle" />
              <MovementDiagram movement={workout.id === "a" ? "lunge" : "row"} />
            </div>
            <div className="card-body">
              <span className="card-days">{workout.days}</span>
              <h3>{workout.name}</h3>
              <p>{workout.subtitle}</p>
              <div className="card-meta">
                <span>
                  <Icon name="clock" size={16} />
                  20–23 min
                </span>
                <span>4 exercises</span>
                <span>3 rounds</span>
              </div>
              <span className="card-arrow">
                <Icon name="arrow" />
              </span>
            </div>
          </button>
        ))}
      </section>
      <button className="food-banner" onClick={() => onNavigate("food")} aria-label="Food: daily protein plan">
        <span className="food-icon">
          <Icon name="leaf" size={26} />
        </span>
        <span className="food-banner-copy">
          <span className="eyebrow">FUEL THE ROUTINE</span>
          <strong>Good food. Nothing complicated.</strong>
          <span>Your simple daily protein plan.</span>
        </span>
        <span className="food-banner-target">
          <strong>
            140<span>g</span>
          </strong>
          <span>PROTEIN / DAY</span>
        </span>
        <Icon name="arrow" />
      </button>
      {showNotes && (
        <InfoDialog title="Your weekly plan" onClose={() => setShowNotes(false)}>
          <p>
            Alternate Workout 1 on Monday, Wednesday, and Friday with Workout 2 on Tuesday, Thursday, and Saturday. Rest
            or walk on Sunday.
          </p>
          <p>One 10 kg kettlebell, a mat, and a little space are all you need.</p>
          <p>
            A climbing session takes the place of Workout 2. If your elbows or forearms are still sore, skip curls in
            the next Workout 2.
          </p>
          <p>
            Your original plan calls for two rounds in week one. The timers use the regular three-round routine. Finish
            each set with 1–2 clean reps left.
          </p>
        </InfoDialog>
      )}
    </div>
  );
}
