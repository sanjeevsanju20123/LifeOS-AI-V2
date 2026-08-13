import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./services/testARES";

import "./styles.css";
import "./index.css";
import "./styles/theme.css";

import { FinanceProvider } from "./context/FinanceContext";
import { FocusProvider } from "./context/FocusContext";
import { TaskProvider } from "./context/TaskContext";
import { PlannerProvider } from "./context/PlannerContext";
import { MusicProvider } from "./context/MusicContext";
import { SettingsProvider } from "./context/SettingsContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <MusicProvider>
    <FocusProvider>
      <FinanceProvider>
        <TaskProvider>
          <PlannerProvider>
            <SettingsProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </SettingsProvider>
          </PlannerProvider>
        </TaskProvider>
      </FinanceProvider>
    </FocusProvider>
  </MusicProvider>
);