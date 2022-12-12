import Link from "next/link";
export default function Nav() {
  return (
    <ul className="nav flex-column position-fixed">
      <li className="nav-item">
        <Link href="#transparency" scroll={false}>
          <a className="nav-link">Transparency</a>
        </Link>
      </li>
      <li className="nav-item">
        <Link href="#autonomy" scroll={false}>
          <a className="nav-link">Autonomy</a>
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
  );
}
