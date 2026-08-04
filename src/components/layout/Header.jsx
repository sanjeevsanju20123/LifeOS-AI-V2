import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <h2>LifeOS AI</h2>
      </div>

      <div className="header-right">
        <button className="icon-btn">🔍</button>
        <button className="icon-btn">🔔</button>

        <div className="profile">
          SK
        </div>
      </div>
    </header>
  );
}

export default Header;