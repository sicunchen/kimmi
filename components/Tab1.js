import Image from "next/image";
import TransparencyPic from "../public/transparency-bg.png";

export default function Tab1() {
  return (
    <div className="container-fluid vh-100" id="transparency">
      <div className="position-relative">
        <Image alt="transparency-bg" src={TransparencyPic} />
        <div className="top-10 start-5 text-primary position-absolute">
          <h1>WE VALUE</h1>
          <h1>TRANSPARENCY</h1>
          <h5 className="text-secondary w-50">
            At May Mobility, we are proactive in sharing our data to ensure
            riders understand and trust the progress we are making.
          </h5>
        </div>
      </div>
    </div>
  );
}
