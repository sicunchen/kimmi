import { Group } from "@visx/group";
import { timeDay, timeHour } from "d3-time";
import { AxisBottom, AxisRight } from "@visx/axis";
import { LinePath, Bar, Line } from "@visx/shape";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import {
  formatDecimal1,
  formatDate,
  multiDateFormat,
  parseDatePicker,
} from "../hooks/useDailyChartData";
import React, { Fragment } from "react";
import { Point } from "@visx/point";
import { extent } from "d3-array";
import { AUTONOMY_PCT, KMPI, METRICS_LABELS } from "../constants/metrics";
import styles from "./BarChartWithMovingAvgLine.module.css";
export default function AutomonyMetricBarChart({
  selectedMetric,
  width,
  xScale,
  hideRightAxis,
  yScale,
  yMax,
  xMax,
  data,
  top,
  left,
  children,
  timelineData,
}) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();
  const { containerRef, TooltipInPortal } = useTooltipInPortal();
  const renderTooltipContent = (tooltipData) => {
    const {
      date,
      avg,
      metric,
      autonomousKm,
      interventions,
      distanceInServiceKm,
    } = tooltipData;
    return date ? (
      <div className={styles.tooltipContainer}>
        <h3>{formatDate(date)}</h3>
        <p>moving average: {formatDecimal1(avg)}</p>
        <p>
          {METRICS_LABELS[selectedMetric]}: {formatDecimal1(metric)}
        </p>
        <p>autonomous km: {formatDecimal1(autonomousKm)}</p>
        {selectedMetric === AUTONOMY_PCT ? (
          <p>distance in service km: {formatDecimal1(distanceInServiceKm)}</p>
        ) : (
          <p>interventions: {interventions}</p>
        )}
      </div>
    ) : (
      <div>
        <span>{tooltipData}</span>
      </div>
    );
  };
  return (
    <svg width={width} ref={containerRef}>
      <Group top={top} left={left}>
        {data.map((d) => {
          const barX = xScale(timeHour.offset(d.date));
          const barY = yScale(d.metric);
          const barWidth =
            ((xScale(timeDay.offset(new Date())) - xScale(new Date())) * 22) /
            24;
          const barHeight = yMax - barY;
          return (
            <Bar
              key={`bar-${d.date}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="#00bcee"
              onMouseMove={(e) => {
                const coords = localPoint(e);
                // TooltipInPortal expects coordinates to be relative to containerRef
                // localPoint returns coordinates relative to the nearest SVG, which
                // is what containerRef is set to in this example.
                showTooltip({
                  tooltipData: d,
                  tooltipTop: coords.y,
                  tooltipLeft: barX + barWidth / 2,
                });
              }}
              onMouseOut={hideTooltip}
            />
          );
        })}
        <LinePath
          data={data}
          x={(d) => xScale(timeHour.offset(d.date, 12))}
          y={(d) => yScale(d.avg)}
          stroke="#333"
          fill={"transparent"}
          strokeLinecap="round"
          strokeWidth={2}
        />
        {timelineData.map((d) => {
          const { date, label, tooltip } = d;
          const [start, end] = extent(data, (d) => d.date);
          const timelineDate = parseDatePicker(date);
          if (timelineDate < start || timelineData > end) {
            return null;
          }

          const timelineX = xScale(parseDatePicker(date));
          const from = new Point({ x: timelineX, y: -10 });
          const to = new Point({
            x: timelineX,
            y: yMax,
          });

          return (
            <Fragment key={`timeline-${label}`}>
              <Line from={from} to={to} stroke="darkgray" strokeWidth={3} />
              <text
                x={timelineX}
                y={-10}
                dy="0.5em"
                dx="5"
                onMouseMove={() => {
                  showTooltip({
                    tooltipData: tooltip,
                    tooltipTop: 0,
                    tooltipLeft: timelineX,
                  });
                }}
                onMouseOut={hideTooltip}
              >
                {label}
              </text>
            </Fragment>
          );
        })}
        <AxisBottom scale={xScale} top={yMax} tickFormat={multiDateFormat} />
        {tooltipOpen && tooltipData && (
          <TooltipInPortal top={tooltipTop} left={tooltipLeft}>
            {renderTooltipContent(tooltipData)}
          </TooltipInPortal>
        )}
        {!hideRightAxis && (
          <Fragment>
            <AxisRight
              label={METRICS_LABELS[selectedMetric]}
              labelProps={{
                transform: "rotate(0)",
                x: "0",
              }}
              labelOffset={15}
              hideAxisLine
              left={xMax}
              numTicks={5}
              scale={yScale}
              tickFormat={(d) =>
                selectedMetric === KMPI ? formatDecimal1(d) : d
              }
            />
          </Fragment>
        )}
        {children}
      </Group>
    </svg>
  );
}
