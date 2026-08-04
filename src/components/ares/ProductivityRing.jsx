import "./ProductivityRing.css";

function ProductivityRing({ score }) {
  const radius = 75;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference - (score / 100) * circumference;

  return (
    <div className="productivity-ring">

      <svg width="180" height="180">

        <defs>

          <linearGradient
            id="ringGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

        </defs>

        <circle
          className="ring-background"
          cx="90"
          cy="90"
          r={radius}
        />

        <circle
          className="ring-progress"
          cx="90"
          cy="90"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />

      </svg>

      <div className="ring-content">

        <h1>{score}%</h1>

        <p>Productivity</p>

      </div>

    </div>
  );
}

export default ProductivityRing;