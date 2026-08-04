import "./AISuggestions.css";

function AISuggestions() {
  const suggestions = [
    "Your focus is highest between 9 AM - 11 AM.",
    "Complete your high priority task first.",
    "Your consistency is improving. Keep your streak alive!",
  ];

  return (
    <section className="ai-suggestions">
      <div className="section-header">
        <h2>🤖 ARES AI Suggestions</h2>
      </div>

      <div className="suggestion-list">
        {suggestions.map((item, index) => (
          <div className="suggestion-item" key={index}>
            <span>✨</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AISuggestions;