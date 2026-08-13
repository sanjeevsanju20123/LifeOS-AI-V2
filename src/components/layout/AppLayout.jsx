import Header from "./Header";
import BottomDock from "./BottomDock";
import AuroraBackground from "../ui/AuroraBackground";

import { useSettings } from "../../context/SettingsContext";

function AppLayout({ children }) {
  const { aurora } = useSettings();

  return (
    <>
      {aurora && <AuroraBackground />}

      <Header />

      {children}

      <BottomDock />
    </>
  );
}

export default AppLayout;