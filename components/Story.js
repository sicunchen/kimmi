import useResizeObserver from "@react-hook/resize-observer";
import { Fragment, useEffect, useRef } from "react";
import Equation from "./Equation";
import styles from "./Story.module.css";
import Graphic from "./Graphic";
import { useState } from "react";
import { useInView } from "framer-motion";
import configStory from "./config";

const Step = ({ chapter, title, text, setActiveChapter }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.8 });
  useEffect(() => {
    if (isInView) {
      setActiveChapter(chapter);
    }
  }, [isInView]);
  return (
    <div ref={ref} className={styles.section}>
      <h3 className={styles.sectionHeader}>{`${chapter}. ${title}`}</h3>
      <p>{text}</p>
    </div>
  );
};

export default function Story() {
  const [activeChapter, setActiveChapter] = useState(null);
  const ref = useRef(null);
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  useResizeObserver(ref, (entry) => {
    entry.target.style.height = `${window.innerHeight}px`;
    if (window.innerWidth < 500) {
      setIsMobile(true);
    }
  });

  const renderGraphic = (activeChapter) => {
    if (!activeChapter) return null;
    const { autokm, interventions, distance } = configStory.filter(
      (s) => s.chapter === activeChapter
    )[0];
    if (activeChapter === 1) {
      return <Equation akNum={autokm} intNum={interventions} />;
    } else {
      return (
        <Fragment>
          <Equation akNum={autokm} intNum={interventions} />
          <Graphic step={distance} />
        </Fragment>
      );
    }
  };
  return (
    <section className={styles.storySection} ref={ref} id="autonomy-definition">
      {isMobile ? (
        <Fragment>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>
              1. Kilometers per intervention (km/I)
            </h3>
            <p>
              This is a key metric we track to show how far our vehicles are
              able to travel before an intervention happens. Let’s dive into how
              we calculate this.
            </p>
            <Equation akNum={0} intNum={0} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>2. Two Modes of Operation</h3>
            <p>
              Our vehicles currently have two basic modes: autonomy and manual.
              Autonomy is when the vehicle drives itself. Manual is when a
              driver takes control of the vehicle.
            </p>
            <Graphic step={0} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>3. Calculating km/I</h3>
            <p>
              The km/I formula is affected by how far the vehicle travels in
              autonomy mode and the number of interventions.
            </p>
            <Graphic step={1} />
            <Equation akNum={1} intNum={0} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>
              4. What is an Intervention?
            </h3>
            <p>
              An intervention occurs any time we drop out of autonomy mode into
              manual mode.
            </p>
            <Graphic step={2} />
            <Equation akNum={2} intNum={1} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>5. Manual Mode</h3>
            <p>
              When we drive in manual mode, we don’t count the manual driven
              distance in our km/I formula.
            </p>
            <Graphic step={3} />
            <Equation akNum={2} intNum={1} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>6. Longest Automous Km</h3>
            <p>
              So far, we are able to travel 1.5 km (on average) before an
              intervention occurs.
            </p>
            <Graphic step={4} />
            <Equation akNum={3} intNum={2} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>
              7. Why Interventions Occur?
            </h3>
            <p>
              One reason for an intervention is when the vehicle enters a manual
              only zone that is dictated by our Operational Design Domain (ODD).
              It’s a fancy way of saying situations the current autonomy system
              is not designed to handle. For example, we do not currently allow
              our autonomy system to make unprotected left turns. It requires a
              manual only zone when we enter the intersection.
            </p>
            <Graphic step={5} />
            <Equation akNum={3} intNum={2} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>
              8. Other Intervention Reasons
            </h3>
            <p>
              Weather and construction are other reasons we see an intervention.
              But the most common reason for an intervention is that the
              Autonomous Vehicle Operator (AVO) took over of their own accord.
            </p>
            <Graphic step={8} />
            <Equation akNum={3} intNum={2} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>
              9. Two types of Interventions
            </h3>
            <p>
              We have two main types of interventions: RARE (Re-Sim At-Fault
              Reportable Events) and non-RARE. We replay events leading up to
              the intervention in our simulator to see what would have happened
              if we did not enter manual mode. A RARE intervention means that
              the simulator showed that the intervention was needed because our
              system was not designed to handle it. A non-RARE intervention
              means that the intervention was not necessary.
            </p>
            <Graphic step={9} />
            <Equation akNum={4} intNum={2} />
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>
              10. Our Performance Numbers
            </h3>
            <p>
              View our current metrics below for both RARE and non-RARE
              interventions at our sites.
            </p>
            <Graphic step={10} />
            <Equation akNum={4} intNum={3} />
          </div>
        </Fragment>
      ) : (
        <div className={styles.scrollyBg} ref={scrollRef}>
          <div className={styles.scrolly}>
            <figure className={styles.graphicsContainer}>
              {renderGraphic(activeChapter)}
            </figure>
            <article className={styles.textContainer}>
              {configStory.map((story) => {
                const { text, title, chapter } = story;
                return (
                  <Step
                    key={chapter}
                    text={text}
                    title={title}
                    chapter={chapter}
                    forwardedRef={scrollRef}
                    setActiveChapter={setActiveChapter}
                  />
                );
              })}
            </article>
          </div>
        </div>
      )}
    </section>
  );
}
