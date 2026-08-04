import { NavLink } from "react-router-dom";
import "./BottomDock.css";

function BottomDock() {
  const links = [
    {
      path: "/",
      icon: "🏠",
      name: "Home",
    },
    {
      path: "/tasks",
      icon: "✅",
      name: "Tasks",
    },
    {
      path: "/planner",
      icon: "📅",
      name: "Planner",
    },
    {
      path: "/goals",
      icon: "🎯",
      name: "Goals",
    },
    {
      path: "/settings",
      icon: "⚙️",
      name: "Settings",
    },
  ];

  return (
    <nav>
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className="dock-btn"
        >
          <span>{link.icon}</span>
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomDock;