import "./Dashboard.css";

import HeroCard from "../components/dashboard/HeroCard";
import StatsGrid from "../components/dashboard/StatsGrid";

import ARESPanel from "../components/ares/ARESPanel";

import TaskPanel from "../components/tasks/TaskPanel";

import FocusWidget from "../components/focus/FocusWidget";

import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";

import AISuggestions from "../components/dashboard/AISuggestions";

import QuickActions from "../components/dashboard/QuickActions";

import FocusTimer from "../components/dashboard/FocusTimer";

import MusicPlayer from "../components/music/MusicPlayer";

function Dashboard() {
  return (
    <main className="dashboard">

      {/* HERO */}

      <section className="dashboard-hero">
        <HeroCard />
      </section>


      {/* STATS */}

      <section className="dashboard-stats">
        <StatsGrid />
      </section>


      {/* ARES + SMART TASKS + MUSIC */}

      <section className="dashboard-main-grid">

        {/* LEFT — ARES */}

        <div className="dashboard-ares">
          <ARESPanel />
        </div>


        {/* RIGHT — TASKS + MUSIC */}

        <div className="dashboard-right-column">

          <div className="dashboard-tasks">
            <TaskPanel />
          </div>


          {/* MUSIC DIRECTLY BELOW SMART TASKS */}

          <div className="dashboard-music">
            <MusicPlayer />
          </div>

        </div>

      </section>


      {/* FOCUS */}

      <section className="dashboard-focus">
        <FocusWidget />
      </section>


      {/* ANALYTICS */}

      <section className="dashboard-analytics">
        <AnalyticsDashboard />
      </section>


      {/* AI + QUICK ACTIONS */}

      <section className="dashboard-bottom-grid">

        <div className="dashboard-ai">
          <AISuggestions />
        </div>


        <div className="dashboard-actions">
          <QuickActions />
        </div>

      </section>


      {/* FOCUS TIMER */}

      <section className="dashboard-focus-timer">
        <FocusTimer />
      </section>

    </main>
  );
}

export default Dashboard;