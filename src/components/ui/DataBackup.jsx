import React, { useRef } from "react";
import { useFocus } from "../../context/FocusContext";
import * as taskService from "../../services/tasks";

export default function DataBackup() {
  const fileRef = useRef();
  const { stats } = useFocus();

  function handleExport() {
    const data = {
      focus: JSON.parse(localStorage.getItem("lifeos-focus") || "null"),
      tasks: taskService.exportTasks(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.focus) localStorage.setItem('lifeos-focus', JSON.stringify(parsed.focus));
        if (Array.isArray(parsed.tasks)) taskService.importTasks(parsed.tasks);
        alert('Import completed. You may need to refresh the page to see updated data.');
      } catch (err) {
        console.error(err);
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button className="btn" onClick={handleExport}>Export Data</button>

      <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
      <button className="btn" onClick={() => fileRef.current?.click()}>Import Data</button>

      <small style={{ color: 'var(--text-muted)', marginLeft: 8 }}>Total Focused Minutes: {stats?.totalMinutes ?? 0}</small>
    </div>
  );
}
