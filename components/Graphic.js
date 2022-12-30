import useResizeObserver from "@react-hook/resize-observer";
import styles from "./Story.module.css";
import ParentSize from "@visx/responsive/lib/components/ParentSizeModern";
import { AxisBottom } from "@visx/axis";
import { scaleLinear } from "d3-scale";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { Fragment, useRef } from "react";
import Image from "next/image";
import Car from "../public/car.svg";
import { motion } from "framer-motion";

export default function Graphic({ step }) {
  const graphicRef = useRef(null);
  useResizeObserver(graphicRef, (entry) => {
    if (graphicRef.current) {
      const svgWidth = graphicRef.current.clientWidth;
      if (svgWidth < 500) {
        entry.target.style.height = `${svgWidth / 4}px`;
      } else {
        entry.target.style.height = `${svgWidth / 6}px`;
      }
    }
  });
  const rects = [
    { status: "autonomy", xmin: 0, xmax: 2 },
    { status: "manual", xmin: 2, xmax: 3 },
    { status: "autonomy", xmin: 3, xmax: 4 },
    { status: "manual", xmin: 4, xmax: 8 },
    { status: "autonomy", xmin: 8, xmax: 9 },
    { status: "manual", xmin: 9, xmax: 10 },
  ];
  const manualStops = rects
    .filter((o) => o.status === "autonomy")
    .map((o) => o.xmax);

  const getCarX = (step, xScale, offset) => {
    if (step === 0) return 0;
    return offset + xScale(step - 1);
  };
  const getZoneLabelVisibility = (step, i) => {
    if (step == 0) {
      return i > 1 ? "hidden" : "";
    }
    let visibleSections = [];
    for (const [index, o] of rects.entries()) {
      const { xmin, xmax } = o;
      if (step > xmin && step <= xmax) {
        visibleSections.push(index);
        visibleSections.push(index + 1);
      }
    }
    return !visibleSections.includes(i) ? "hidden" : "";
  };
  const renderInterventionLabel = (
    step,
    xScale,
    barHeight,
    fontSize,
    manualStops
  ) => {
    if (manualStops.includes(step)) {
      return (
        <motion.text
          x={xScale(step)}
          y={barHeight / 3}
          fontSize={fontSize}
          textAnchor="middle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {step === 9 ? "RARE intervention" : "intervention"}
        </motion.text>
      );
    }
  };
  const renderInterventionTypes = (step, xScale, fontSize) => {
    const types = [
      { label: "weather", x: 4.5 },
      { label: "construction", x: 6 },
      { label: "AVO", x: 7.5 },
    ];
    if (step === 8) {
      return types.map((o) => {
        const { label, x } = o;
        return (
          <motion.text
            key={label}
            x={xScale(x)}
            y={fontSize * 2}
            fontSize={fontSize}
            textAnchor="middle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {label}
          </motion.text>
        );
      });
    }
  };
  return (
    <motion.div ref={graphicRef} className={styles.graphic}>
      <ParentSize>
        {(parent) => {
          const { width, height } = parent;
          if (height === 0) return null;
          const margin = {
            top: 0,
            left: width / 11,
            right: 10,
            bottom: 25,
          };
          const xScale = scaleLinear()
            .domain([0, 10])
            .range([0, width - margin.left - margin.right]);
          const barHeight = height - margin.bottom;
          const carSize = width / 12;
          const fontSize = width / 60;
          const carX = getCarX(step, xScale, margin.left);
          return (
            <Fragment>
              <div
                className={styles.svgCar}
                style={{
                  position: "absolute",
                  width: carSize,
                  height: carSize,
                  transform: `translate(${carX}px,${barHeight - carSize}px)`,
                  transition: "transform 1s linear",
                }}
              >
                <Image src={Car} alt="car" style={{ height: "100%" }} />
              </div>
              <svg width={width} height={height}>
                <Group top={margin.top} left={margin.left}>
                  {rects.map((r, i) => {
                    const { xmin, xmax, status } = r;
                    const barWidth = xScale(xmax) - xScale(xmin);
                    return (
                      <Group key={`${status}-${i}`}>
                        <Bar
                          x={xScale(xmin)}
                          y={margin.top}
                          width={barWidth}
                          height={barHeight}
                          fill={status === "autonomy" ? "#00bcee" : "#FF9C17"}
                          opacity="0.4"
                        />
                        <text
                          x={xScale(xmin + (xmax - xmin) / 2)}
                          y={fontSize}
                          fontSize={fontSize}
                          textAnchor="middle"
                          visibility={getZoneLabelVisibility(step, i)}
                          // initial={{ opacity: 0, scale: 0.5 }}
                          // whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 1 }}
                        >
                          {status}
                        </text>
                        {renderInterventionLabel(
                          step,
                          xScale,
                          barHeight,
                          fontSize,
                          manualStops
                        )}
                        {renderInterventionTypes(step, xScale, fontSize)}
                      </Group>
                    );
                  })}
                  <AxisBottom scale={xScale} top={height - margin.bottom} />
                </Group>
              </svg>
            </Fragment>
          );
        }}
      </ParentSize>
    </motion.div>
  );
}
