import { useState } from "react";
import Icon from "./Icon";
import InfoDialog from "./InfoDialog";

const meals = [
  {
    name: "250 g plain skyr",
    note: "Your first serving, whenever it fits.",
    protein: "30 g",
  },
  {
    name: "Lunch with meat",
    note: "A quesadilla, bún bò nam bộ, or your usual.",
    protein: "~40 g",
  },
  {
    name: "250 g plain skyr",
    note: "A second serving during the day.",
    protein: "30 g",
  },
  {
    name: "Dinner with meat",
    note: "A regular meal with a good meat portion.",
    protein: "~40 g",
  },
];

export default function Food() {
  const [showNotes, setShowNotes] = useState(false);
  return (
    <div className="food-page">
      <header className="food-heading">
        <span className="eyebrow">THE OTHER HALF OF THE ROUTINE</span>
        <h1>
          Eat well.
          <br />
          Keep it simple<span className="period">.</span>
        </h1>
        <p className="page-description">
          Your food notes, all in one place. No tracking, no overthinking.
        </p>
      </header>
      <div className="food-layout">
        <section className="protein-card" aria-label="Daily protein target">
          <span className="eyebrow">DAILY PROTEIN TARGET</span>
          <div className="protein-target">
            140<span>g</span>
          </div>
          <p>
            For your 88 kg body weight.
            <br />A practical range: 130–145 g a day.
          </p>
          <Icon name="leaf" size={60} />
        </section>
        <section className="food-notes" aria-label="Daily meals">
          <h2>Your everyday four.</h2>
          <p>Two meat meals. Two portions of skyr.</p>
          {meals.map((meal, index) => (
            <div className="meal-row" key={index}>
              <span className="meal-number">0{index + 1}</span>
              <div>
                <h3>{meal.name}</h3>
                <p>{meal.note}</p>
              </div>
              <strong>{meal.protein}</strong>
            </div>
          ))}
          <div className="meal-total">
            <span>Daily total</span>
            <strong>~140 g protein</strong>
          </div>
        </section>
      </div>
      <button
        className="text-button food-help"
        onClick={() => setShowNotes(true)}
      >
        Food notes & skyr portions
        <Icon name="arrow" size={17} />
      </button>
      {showNotes && (
        <InfoDialog
          title="Food notes & skyr portions"
          onClose={() => setShowNotes(false)}
        >
          <h3>500 g a day. Two easy portions.</h3>
          <p>
            Your plan uses plain skyr with 12 g protein per 100 g. Check the
            label: brands vary. A 130 g cup at that concentration gives you 15.6
            g of protein.
          </p>
          <h3>Consistency over exact numbers.</h3>
          <p>
            Meat portions vary, so the meal numbers are estimates. Your original
            notes suggest ~675 g of skyr if meals give 30 g each, or ~350 g if
            they give 50 g each.
          </p>
          <p>
            From your original plan: keep walking, use a modest calorie deficit,
            and check your waist every two weeks. Follow your average morning
            weight rather than individual daily readings.
          </p>
        </InfoDialog>
      )}
    </div>
  );
}
