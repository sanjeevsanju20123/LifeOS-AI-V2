import HeroCard from "../components/dashboard/HeroCard";
import FocusWidget from "../components/focus/FocusWidget";
import StatsGrid from "../components/dashboard/StatsGrid";
import AISuggestions from "../components/dashboard/AISuggestions";
import QuickActions from "../components/dashboard/QuickActions";
import FocusTimer from "../components/dashboard/FocusTimer";
import TaskPanel from "../components/tasks/TaskPanel";
import BottomDock from "../components/layout/BottomDock";
import ProductivityCard from "../components/dashboard/ProductivityCard";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";
import ARESPanel from "../components/ares/ARESPanel";

function Dashboard() {
  return (
    <main className="container fade-up">
      <ProductivityCard />

      <AnalyticsDashboard />

      <HeroCard />

      <ARESPanel />

      <FocusWidget />

      <StatsGrid />

      <TaskPanel />

      <AISuggestions />

      <QuickActions />

      <FocusTimer />
      

    </main>
  );
}

export default Dashboard;