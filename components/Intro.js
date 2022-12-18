import Image from "next/image";
import TransparencyPic from "../public/bg-car.svg";

export default function Intro() {
  return (
    <section className="position-relative vh-100">
      <div
        className="position-absolute start-10 top-25"
        style={{ zIndex: 100 }}
      >
        <h1>WE VALUE</h1>
        <h1>TRANSPARENCY</h1>
        <h5 className="text-secondary w-50">
          At May Mobility, we are proactive in sharing our data to ensure riders
          understand and trust the progress we are making.
        </h5>
      </div>
      <Image
        alt="transparency-bg"
        sizes="100%"
        layout="fill"
        objectFit="cover"
        src={TransparencyPic}
      />
    </section>
  );
}
