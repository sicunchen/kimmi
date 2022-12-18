import Link from "next/link";
export default function Nav() {
  return (
    <nav className="navbar navbar-expand-md navbar-light bg-primary fixed-top">
      <div className="container-fluid d-flex justify-content-center">
        <div>
          <a className="navbar-brand" herf="#">
            kiMMi
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        <div className="collapse navbar-collapse flex-grow-0" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="#transparency" scroll={false}>
                <a className="nav-link">Transparency</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="#kpi" scroll={false}>
                <a className="nav-link">KPI</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="#manual" scroll={false}>
                <a className="nav-link">Dashboard</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
