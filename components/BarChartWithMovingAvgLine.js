import { Group } from "@visx/group";
import { timeDay, timeHour } from "d3-time";
import { AxisBottom, AxisRight } from "@visx/axis";
import { LinePath, Bar } from "@visx/shape";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import {
  formatDecimal,
  formatDate,
  multiDateFormat,
} from "../hooks/useDailyChartData";
import React from "react";

export default function AutomonyMetricBarChart({
  xScale,
  hideRightAxis,
  yScale,
  yMax,
  xMax,
  data,
  top,
  left,
  children,
}) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });
  return (
    <svg ref={containerRef}>
      <Group top={top} left={left}>
        {data.map((d) => {
          const barX = xScale(timeHour.offset(d.date));
          const barY = yScale(d.kmpi);
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

          // (
          //   <motion.rect
          //     initial={false}
          //     width={barWidth}
          //     x={barX}
          //     y={barY}
          //     height={barHeight}
          //     fill="#00bcee"
          //     key={`bar-${i}`}
          //     onMouseMove={(e) => {
          //       const coords = localPoint(e);
          //       // TooltipInPortal expects coordinates to be relative to containerRef
          //       // localPoint returns coordinates relative to the nearest SVG, which
          //       // is what containerRef is set to in this example.
          //       showTooltip({
          //         tooltipData: d,
          //         tooltipTop: coords.y,
          //         tooltipLeft: barX + barWidth / 2,
          //       });
          //     }}
          //     onMouseOut={hideTooltip}
          //   />
          // );
        })}
        <LinePath
          data={data}
          x={(d) => xScale(timeHour.offset(d.date, 12))}
          y={(d) => yScale(d.avg)}
          stroke="#333"
          fill={"transparent"}
          strokeLinecap="round"
          strokeWidth={2}
        >
          {/* {({ path }) => {
            return (
              <motion.path
                initial={false}
                animate={{ d: path(data) }}
                transition={{ duration: 0.5 }}
                strokeWidth={2}
                stroke="#333"
                fill={"transparent"}
                strokeLinecap="round"
              />
            );
          }} */}
        </LinePath>
        <AxisBottom scale={xScale} top={yMax} tickFormat={multiDateFormat} />
        {tooltipOpen && tooltipData && (
          <TooltipInPortal top={tooltipTop} left={tooltipLeft}>
            <div>
              <h6>{formatDate(tooltipData.date)}</h6>
              <p>moving average: {formatDecimal(tooltipData.avg)}</p>
              <p>km/I: {formatDecimal(tooltipData.kmpi)}</p>
              <p>autonomous km: {formatDecimal(tooltipData.autonomousKm)}</p>
              <p>interventions: {tooltipData.interventions}</p>
            </div>
          </TooltipInPortal>
        )}
        {!hideRightAxis && (
          <AxisRight
            hideAxisLine
            left={xMax}
            numTicks={2}
            scale={yScale}
            tickFormat={(d) => d.toFixed(1)}
          />
        )}
        {children}
      </Group>
    </svg>
  );
}
