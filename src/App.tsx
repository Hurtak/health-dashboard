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
    if (next === "a" || next === "b")
      setOpenedWorkouts((previous) => new Set(previous).add(next));
    setView(next);
  }

  return (
    <div className={`app-shell ${focusMode ? "training-mode" : ""}`}>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigate("home")}
          aria-label="Daily home"
        >
          <span className="brand-mark">
            <Icon name="weight" size={24} />
          </span>
          daily<span className="brand-dot">.</span>
        </button>
        <nav aria-label="Main navigation">
          {(
            [
              { id: "home", label: "Overview" },
              { id: "a", label: "Workout 1" },
              { id: "b", label: "Workout 2" },
              { id: "food", label: "Food" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => navigate(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <span className="header-note">ONE DAY AT A TIME</span>
      </header>
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
        <span>SHOW UP. KEEP IT SIMPLE.</span>
        <p>A little better is still better.</p>
        <span>MADE FOR YOUR EVERYDAY</span>
      </footer>
    </div>
  );
}
