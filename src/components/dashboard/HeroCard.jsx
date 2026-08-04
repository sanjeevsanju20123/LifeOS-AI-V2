import "./HeroCard.css";

function HeroCard() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="hero-card">
      <div>
        <p className="hero-date">{today}</p>

        <h1>
          Good Morning, Sanjeev 👋
        </h1>

        <p className="hero-text">
          Welcome back to your LifeOS AI. Your personal operating system for productivity.
        </p>
      </div>

      <div className="ai-status">
        <span>🤖</span>
        <div>
          <h3>ARES AI</h3>
          <p>Online & ready</p>
        </div>
      </div>
    </section>
  );
}

export default HeroCard;