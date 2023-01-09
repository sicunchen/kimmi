import { max } from "d3-array";
import { timeDay, timeHour } from "d3-time";
import { scaleLinear, scaleTime } from "d3-scale";
import { PatternLines } from "@visx/pattern";
import { Brush } from "@visx/brush";
import { useEffect, useMemo, useRef, useState } from "react";
import BarChartWithMovingAvgLine from "./BarChartWithMovingAvgLine";
import { Group } from "@visx/group";
import { Grid } from "@visx/grid";
import {
  transformDailyAutonomyMetricsData,
  updateAutonomyMetric,
  parseDatePicker,
  formatDatePicker,
  createServiceDatesTemplate,
  filterTimelineData,
  getXDomain,
  getYDomain,
  filterbyDate,
} from "../hooks/useDailyChartData";
import timelineData from "../constants/software.json";
import { useFilter } from "./DashboardReducer";
import {
  handleChangeDateRange,
  updateFilteredData,
  updateSummaryMetric,
} from "./DashboardActions";

const PATTERN_ID = "brush_pattern";
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: "white",
};
const accentColor = "#FF9C17";

// We need to manually offset the handles for them to be rendered at the right position
const BrushHandle = ({ x, height, isBrushActive }) => {
  const pathWidth = 8;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
        fill="#f2f2f2"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: "ew-resize" }}
      />
    </Group>
  );
};

export default function BarchartContainer({
  rawData,
  width,
  height,
  margin = {
    top: 20,
    left: 20,
    bottom: 20,
    right: 60,
  },
}) {
  //dimenstion
  const brushMargin = {
    top: 20,
    bottom: 20,
    left: margin.left,
    right: margin.right,
  };
  const legendHeight = 20;
  const legendBottomMarin = 30;
  const innerHeight =
    height - margin.top - legendHeight - legendBottomMarin - margin.bottom;
  const topChartBottomMargin = 80;
  const chartSeparation = 30;
  const topChartHeight = 0.9 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = topChartHeight;
  const xBrushMax = width - brushMargin.left - brushMargin.right;
  const yBrushMax = bottomChartHeight - brushMargin.top - brushMargin.bottom;

  const { state, dispatch } = useFilter();

  const {
    activeFilter,
    interventionType,
    checkedExclusions,
    movingAvgWindow,
    selectedMetric,
    selectedSite,
    selectedShift,
    touchedDateInput,
  } = state;
  useEffect(() => {
    if (!touchedDateInput.value) return;
    const { touchedId, value } = touchedDateInput;
    if (touchedId === "start") {
      const updater = (prevBrush) => {
        const { extent } = prevBrush;
        const newX = brushXScale(parseDatePicker(value));
        return {
          ...prevBrush,
          start: { x: newX, y: extent.y0 },
          extent: { x0: newX, y0: extent.y0, x1: extent.x1, y1: extent.y1 },
        };
      };
      brushRef.current.updateBrush(updater);
    } else {
      const updater = (prevBrush) => {
        const { extent } = prevBrush;
        const newX = brushXScale(parseDatePicker(value));
        return {
          ...prevBrush,
          end: { x: newX, y: extent.y1 },
          extent: { x0: extent.x0, y0: extent.y0, x1: newX, y1: extent.y1 },
        };
      };
      brushRef.current.updateBrush(updater);
    }
  }, [touchedDateInput]);

  const serviceDates = createServiceDatesTemplate(rawData);
  const dailyData = transformDailyAutonomyMetricsData(
    rawData,
    {
      activeFilter,
      selectedMetric,
      selectedSite,
      selectedShift,
      interventionType,
      checkedExclusions,
      movingAvgWindow,
    },
    serviceDates
  );
  const end = max(serviceDates, (d) => d.date);

  const start = timeDay.offset(end, -29);
  const brushRef = useRef(null);
  const [brushDomain, setBrushDomain] = useState([start, end]);
  useEffect(() => {
    dispatch(handleChangeDateRange(brushDomain[0], brushDomain[1]));
  }, [brushDomain]);

  const filteredData = filterbyDate(dailyData, brushDomain);

  //scale
  const brushXScale = useMemo(
    () => scaleTime().domain(getXDomain(dailyData)).range([0, xBrushMax]),
    [dailyData, xBrushMax]
  );
  //track brush state
  const onBrushChange = (domain) => {
    if (!domain) return;
    const { x0, x1 } = domain;
    const newStart = timeDay(timeHour.offset(new Date(x0), 12));
    const newEnd = timeDay(timeHour.offset(new Date(x1), -12));
    setBrushDomain([newStart, newEnd]);
  };

  const brushYScale = useMemo(
    () =>
      scaleLinear()
        .domain(getYDomain(dailyData, selectedMetric))
        .range([yBrushMax, 0]),
    [dailyData, yBrushMax]
  );

  const xScale = useMemo(
    () => scaleTime().domain(getXDomain(filteredData)).range([0, xMax]),
    [filteredData, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain(getYDomain(filteredData, selectedMetric))
        .range([yMax, 0]),
    [filteredData, yMax]
  );

  const filteredTimelineData = filterTimelineData(timelineData, {
    activeFilter,
    selectedShift,
    selectedSite,
  });

  return (
    <svg height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
      <g transform={`translate(${width / 3},${margin.top})`}>
        <rect fill="#00bcee" width={legendHeight} height={legendHeight} />
        <text x={legendHeight + 5} y={legendHeight / 2} dy="0.35em">
          daily
        </text>
      </g>
      <g transform={`translate(${width / 2},${margin.top})`}>
        <line
          stroke="#333"
          x1={0}
          x2={40}
          y1={legendHeight / 2}
          y2={legendHeight / 2}
          strokeWidth="2"
        />
        <text x={50} y={legendHeight / 2} dy="0.35em">
          Moving Average ({movingAvgWindow} days)
        </text>
      </g>

      <Grid
        xScale={xScale}
        yScale={yScale}
        width={xMax}
        height={yMax}
        numTicksColumns={0}
        numTicksRows={5}
        top={margin.top + legendHeight + legendBottomMarin}
        strokeWidth={2}
        left={margin.left}
      />

      <BarChartWithMovingAvgLine
        selectedMetric={selectedMetric}
        width={width}
        data={filteredData}
        top={margin.top + legendHeight + legendBottomMarin}
        left={margin.left}
        xMax={xMax}
        xScale={xScale}
        yMax={yMax}
        yScale={yScale}
        timelineData={filteredTimelineData}
      />
      <BarChartWithMovingAvgLine
        selectedMetric={selectedMetric}
        width={width}
        data={dailyData}
        hideRightAxis
        top={
          legendHeight +
          legendBottomMarin +
          topChartHeight +
          topChartBottomMargin
        }
        left={margin.left}
        xMax={xBrushMax}
        xScale={brushXScale}
        yMax={yBrushMax}
        yScale={brushYScale}
        timelineData={filteredTimelineData}
      >
        <PatternLines
          height={5}
          id={PATTERN_ID}
          orientation={["diagonal"]}
          stroke={accentColor}
          strokeWidth={1}
          width={5}
        />
        <Brush
          //need to force a remount when plot size changes using key: https://github.com/airbnb/visx/issues/1282
          key={`${width}-${height}`}
          brushDirection={"horizontal"}
          handleSize={5}
          height={yBrushMax}
          initialBrushPosition={{
            start: { x: brushXScale(brushDomain[0]) },
            end: { x: brushXScale(timeDay.offset(end, 1)) },
          }}
          margin={brushMargin}
          onChange={onBrushChange}
          renderBrushHandle={(props) => <BrushHandle {...props} />}
          resizeTriggerAreas={["left", "right"]}
          selectedBoxStyle={selectedBrushStyle}
          useWindowMoveEvents
          width={xBrushMax}
          xScale={brushXScale}
          yScale={brushYScale}
          innerRef={brushRef}
        />
      </BarChartWithMovingAvgLine>
    </svg>
  );
}
