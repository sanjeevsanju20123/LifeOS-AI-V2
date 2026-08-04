import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./index.css";
import "./styles/theme.css";

import { FocusProvider } from "./context/FocusContext";
import { TaskProvider } from "./context/TaskContext";
import { PlannerProvider } from "./context/PlannerContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <FocusProvider>
<TaskProvider>
    <PlannerProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </PlannerProvider>
  </TaskProvider>
</FocusProvider>
);