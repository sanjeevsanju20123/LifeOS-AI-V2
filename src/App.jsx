import { Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Planner from "./pages/Planner";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Settings from "./pages/Settings";
import Focus from "./pages/Focus";
import CommandPalette from "./components/command/CommandPalette";

function App() {
  return (
    <AppLayout>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/focus" element={<Focus />} />
        
      </Routes>
    </AppLayout>
  );
}

export default App;