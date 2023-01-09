import useResizeObserver from "@react-hook/resize-observer";
import { cloneElement, useRef, useState } from "react";

export default function SectionContainer({ className, children, ...props }) {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useResizeObserver(ref, (entry) => {
    entry.target.style.height = `${window.innerHeight}px`;
    if (window.innerWidth < 500) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  });
  return (
    <section className={className} ref={ref} {...props}>
      {isMobile ? cloneElement(children, { isMobile: isMobile }) : children}
    </section>
  );
}
