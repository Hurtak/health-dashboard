import { useState } from "react";
import Icon from "./Icon";
import Home from "./Home";
import Food from "./Food";
import WorkoutPlayer from "./WorkoutPlayer";
import { workouts } from "./workouts";

type View = "home" | "a" | "b" | "food";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [focusMode, setFocusMode] = useState(false);
  const [openedWorkouts, setOpenedWorkouts] = useState<Set<string>>(new Set());
  function navigate(next: View) {
    setFocusMode(false);
    if (next === "a" || next === "b") setOpenedWorkouts((previous) => new Set(previous).add(next));
    setView(next);
  }

  return (
    <div className={`app-shell ${focusMode ? "training-mode" : ""}`}>
      <header className="site-header">
        <button className="brand" onClick={() => navigate("home")} aria-label="Daily home">
          <Icon name="weight" size={26} />
          daily
        </button>
        <p className="brand-description">Your strength routine.</p>
      </header>
      <nav className="site-nav" aria-label="Main navigation">
        {(
          [
            { id: "home", label: "Overview", icon: "home" },
            { id: "a", label: "Workout A", icon: "weight" },
            { id: "b", label: "Workout B", icon: "weight" },
            { id: "food", label: "Food", icon: "leaf" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            className={view === item.id ? "active" : ""}
            onClick={() => navigate(item.id)}
            aria-current={view === item.id ? "page" : undefined}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <main>
        {view === "home" && <Home onNavigate={navigate} />}
        {workouts
          .filter((workout) => openedWorkouts.has(workout.id))
          .map((workout) => (
            <WorkoutPlayer
              key={workout.id}
              workout={workout}
              visible={view === workout.id}
              onBack={() => navigate("home")}
              onFocusChange={setFocusMode}
            />
          ))}
        {view === "food" && <Food />}
      </main>
      <footer className="site-footer">
        <Icon name="weight" size={18} />
        <p>
          One kettlebell.
          <br />A little consistency.
        </p>
        <span>10 kg · mat · a little space</span>
      </footer>
    </div>
  );
}
