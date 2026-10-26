import { useState } from "react";
import Icon from "./Icon";
import InfoDialog from "./InfoDialog";
import { dailyProteinTarget, dailyProteinTotal, meals } from "./nutrition";

export default function Food() {
  const [showNotes, setShowNotes] = useState(false);
  return (
    <div className="food-page">
      <header className="food-heading">
        <h1>Eat well.</h1>
        <p className="page-description">Two meat meals. Two portions of skyr. Keep it simple.</p>
      </header>
      <div className="food-layout">
        <section className="protein-card" aria-label="Daily protein target">
          <h2>Daily protein target</h2>
          <div className="protein-target">
            {dailyProteinTarget}
            <span>g</span>
          </div>
          <p>
            For your 88 kg body weight.
            <br />A practical range: 130–145 g a day.
          </p>
        </section>
        <section className="food-notes" aria-label="Daily meals">
          <h2>Your everyday four</h2>
          <p>A simple plan, from morning to evening.</p>
          {meals.map((meal, index) => (
            <div className="meal-row" key={index}>
              <div>
                <h3>{meal.name}</h3>
                <p>{meal.note}</p>
              </div>
              <strong>
                {meal.estimated ? "~" : ""}
                {meal.protein} <span>g</span>
              </strong>
            </div>
          ))}
          <div className="meal-total">
            <span>Daily total</span>
            <strong>~{dailyProteinTotal} g protein</strong>
          </div>
        </section>
      </div>
      <button className="text-button food-help" onClick={() => setShowNotes(true)}>
        Food notes & skyr portions
        <Icon name="arrow" size={17} />
      </button>
      {showNotes && (
        <InfoDialog title="Food notes & skyr portions" onClose={() => setShowNotes(false)}>
          <h3>500 g a day. Two easy portions.</h3>
          <p>
            Your plan uses plain skyr with 12 g protein per 100 g. Check the label: brands vary. A 130 g cup at that
            concentration gives you 15.6 g of protein.
          </p>
          <h3>Consistency over exact numbers.</h3>
          <p>
            Meat portions vary, so the meal numbers are estimates. Your original notes suggest ~675 g of skyr if meals
            give 30 g each, or ~350 g if they give 50 g each.
          </p>
          <p>
            From your original plan: keep walking, use a modest calorie deficit, and check your waist every two weeks.
            Follow your average morning weight rather than individual daily readings.
          </p>
        </InfoDialog>
      )}
    </div>
  );
}
