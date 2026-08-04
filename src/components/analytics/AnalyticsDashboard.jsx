import "./AnalyticsDashboard.css";

import ProductivityChart from "./ProductivityChart";
import FocusChart from "./FocusChart";
import TaskChart from "./TaskChart";

function AnalyticsDashboard() {
  return (
    <section className="analytics-dashboard">

      <div className="analytics-header">
        <h2>📊 Analytics</h2>
        <p>Last 7 Days</p>
      </div>

      <div className="analytics-grid">

        <ProductivityChart />

        <FocusChart />

        <TaskChart />

      </div>

    </section>
  );
}

export default AnalyticsDashboard;