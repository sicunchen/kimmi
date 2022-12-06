import Image from "next/image";
import GradientRoute from "../public/gradient-route.png";

export default function Tab2() {
  return (
    <div className="container-fluid vh-100" id="autonomy">
      <div className="position-relative">
        <Image alt="transparency-bg" src={GradientRoute} />
        <div className="top-25 start-30 text-secondary position-absolute">
          <h1>
            Travel in full autonomy for over 5 minutes before an intervention.
          </h1>
        </div>
      </div>
    </div>
  );
}
