import "./FocusModal.css";
function FocusModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="focus-modal-overlay">
      <div className="focus-modal">

        <div style={{ fontSize: "60px" }}>
          🔔
        </div>

        <h2>Mindfulness Bell</h2>

        <p>
          Great work!
        </p>

        <p>
          Take one deep breath.
        </p>

        <p>
          Relax your shoulders.
        </p>

        <p>
          Gently return your attention
          to your work.
        </p>

        <button onClick={onClose}>
          Continue
        </button>

      </div>
    </div>
  );
}

export default FocusModal;