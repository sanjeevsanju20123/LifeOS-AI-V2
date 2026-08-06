import React, { useState } from "react";
import { useFocus } from "../../context/FocusContext";
import { useTasks } from "../../context/TaskContext";
import mockAI from "../../services/ai/mockService";

export default function AssistantPanel() {
  const { weeklyHistory } = useFocus();
  const { tasks } = useTasks();
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState(null);

  function openAssistant() {
    setOpen(true);
    // Generate a deterministic mock recommendation
    const rec = mockAI.summarize({ tasks, weeklyHistory });
    setResponse(rec);
  }

  if (!open)
    return (
      <div style={{ margin: '12px 0' }}>
        <button className="btn" onClick={openAssistant}>Open ARES Assistant</button>
      </div>
    );

  return (
    <div className="glass-card" style={{ padding: 12, marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>ARES Assistant</h3>
        <button className="btn ghost" onClick={() => setOpen(false)}>Close</button>
      </div>

      <div style={{ marginTop: 8 }}>
        {response ? (
          <>
            <p style={{ color: 'var(--text-muted)' }}>{response.summary}</p>

            <h4>Suggested Next Actions</h4>
            <ul>
              {response.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>

            <h4>Priority Tasks</h4>
            <ol>
              {response.priorities.map((t, i) => (
                <li key={i}>{t.title} {t.due ? `— ${t.due}` : ''}</li>
              ))}
            </ol>
          </>
        ) : (
          <p>Thinking...</p>
        )}
      </div>
    </div>
  );
}
