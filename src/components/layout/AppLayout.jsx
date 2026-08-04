import Header from "./Header";
import BottomDock from "./BottomDock";
import AuroraBackground from "../ui/AuroraBackground";

function AppLayout({ children }) {
  return (
    <>
      <AuroraBackground />

      <Header />

      {children}

      <BottomDock />
    </>
  );
}

export default AppLayout;