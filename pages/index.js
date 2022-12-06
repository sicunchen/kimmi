import Nav from "../components/Nav";
import Tab1 from "../components/Tab1";
import Tab2 from "../components/Tab2";
import Tab3 from "../components/Tab3";
import Tab4 from "../components/Tab4";
export default function Home() {
  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-2 d-flex align-items-center vh-100">
          <Nav />
        </div>
        <div className="col-sm-10">
          <Tab1 />
          <Tab2 />
          <Tab3 />
          <Tab4 />
        </div>
      </div>
    </div>
  );
}
