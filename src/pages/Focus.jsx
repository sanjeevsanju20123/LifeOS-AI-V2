import { useRef } from "react";

function Focus() {
  const bellRef = useRef(new Audio("/sounds/bell.mp3"));

  const playBell = () => {
    bellRef.current.currentTime = 0;
    bellRef.current.play();
  };

  return (
    <main className="container fade-up">
      <h1>🔔 Focus Bell</h1>

      <p>Click the button to test your mindfulness bell.</p>

      <button onClick={playBell}>
        Play Bell
      </button>
    </main>
  );
}

export default Focus;