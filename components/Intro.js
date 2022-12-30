import Image from "next/image";
import TransparencyPic from "../public/transparency-bg.png";
import styles from "./Intro.module.css";
import useResizeObserver from "@react-hook/resize-observer";
import { useRef } from "react";
import { motion } from "framer-motion";

export default function Intro() {
  const ref = useRef(null);
  useResizeObserver(ref, (entry) => {
    entry.target.style.height = `${window.innerHeight}px`;
  });
  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className={styles.introTextContainer}
        >
          <h1 className={styles.header1}>WE VALUE</h1>
          <h1 className={styles.header1}>TRANSPARENCY</h1>
          <h5 className={styles.header2}>
            At May Mobility, we are proactive in sharing our data to ensure
            riders understand and trust the progress we are making. We want to
            use this space to breakdown how we define our key metric and arrive
            at our numbers.
          </h5>
        </motion.div>
        <motion.div
          initial={{ translateY: 300 }}
          animate={{ translateY: 0 }}
          transition={{ type: "spring", duration: 2 }}
          className={styles.imageContainer}
        >
          <Image alt="transparency-bg" src={TransparencyPic} priority />
        </motion.div>
      </div>
    </section>
  );
}
