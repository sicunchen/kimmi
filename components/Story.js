import { Fragment, useEffect, useRef } from "react";
import Equation from "./Equation";
import styles from "./Story.module.css";
import Graphic from "./Graphic";
import { useState } from "react";
import { useInView, motion } from "framer-motion";
import configStory from "../constants/config";
import SectionContainer from "./SectionContainer";
const Step = ({ chapter, title, text, setActiveChapter }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.8 });
  useEffect(() => {
    if (isInView) {
      setActiveChapter(chapter);
    }
  }, [isInView]);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.1 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      ref={ref}
      className={styles.section}
    >
      <h3 className={styles.sectionHeader}>{`${chapter}. ${title}`}</h3>
      <p>{text}</p>
    </motion.div>
  );
};
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
const renderMobileContent = () => {
  return (
    <Fragment>
      {configStory.map((story) => {
        const { text, title, chapter } = story;
        return (
          <div key={chapter} className={styles.section}>
            <h3 className={styles.sectionHeader}>{`${chapter}. ${title}`}</h3>
            <p>{text}</p>
            {renderGraphic(chapter)}
          </div>
        );
      })}
    </Fragment>
  );
};
const Content = ({ isMobile }) => {
  const [activeChapter, setActiveChapter] = useState(null);
  if (isMobile) return renderMobileContent();
  return (
    <div className={styles.scrollyBg}>
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
                setActiveChapter={setActiveChapter}
              />
            );
          })}
        </article>
      </div>
    </div>
  );
};
export default function Story() {
  return (
    <SectionContainer className={styles.storySection} id="autonomy-definition">
      <Content />
    </SectionContainer>
  );
}
