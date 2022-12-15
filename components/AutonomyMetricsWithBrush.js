import { min, max } from "d3-array";
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
  formatDate,
  parseDatePicker,
  formatDatePicker,
  createServiceDatesTemplate,
  filterTimelineData,
} from "../hooks/useDailyChartData";
import { SITE_FILTER } from "../constants/filters";
import { SITE_BUTTONS } from "../constants/sites";
import { SHIFT_BUTTONS } from "../constants/shiftCategories";
import {
  EXCLUDE_INTERVENTIONS_BUTTONS,
  INTERVENTIONS_TOTAL,
  INTERVENTION_BUTTONS,
} from "../constants/interventionCategories";
import timelineData from "./software.json";
import { AUTONOMY_PCT, IPKM, KMPI } from "../constants/metrics";

const PATTERN_ID = "brush_pattern";
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: "white",
};
const accentColor = "#FF9C17";
const filterByDate = (data, start, end) => {
  return data.filter((d) => {
    return d.date >= start && d.date <= end;
  });
};

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
//ask Alex about the max setting here
function getYDomain(metricsData) {
  return [
    0,
    Math.max(
      0.6,
      max(metricsData, (d) => d.metric),
      max(metricsData, (d) => d.avg)
    ),
  ];
}

function getXDomain(metricsData) {
  return [
    min(metricsData, (d) => d.date),
    timeDay.offset(
      max(metricsData, (d) => d.date),
      1
    ),
  ];
}

export default function AutonomyMetricsWithBrush({
  rawDailyAutonomyMetricsData,
  activeFilter,
  filterValues,
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

  const {
    mainFilter,
    interventionType,
    checkedExclusions,
    movingAverageWindow,
    selectedMetric,
  } = filterValues;

  const serviceDates = createServiceDatesTemplate(rawDailyAutonomyMetricsData);
  const dailyAutonomyMetricsData = transformDailyAutonomyMetricsData(
    rawDailyAutonomyMetricsData,
    activeFilter,
    filterValues,
    serviceDates
  );

  const end = max(serviceDates, (d) => d.date);

  const start = timeDay.offset(end, -29);
  const brushRef = useRef(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const handleChangeDate = (e) => {
    if (e.target.id === "start") {
      const updater = (prevBrush) => {
        const { extent } = prevBrush;
        const newX = brushXScale(parseDatePicker(e.target.value));
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
        const newX = brushXScale(parseDatePicker(e.target.value));
        return {
          ...prevBrush,
          end: { x: newX, y: extent.y1 },
          extent: { x0: extent.x0, y0: extent.y0, x1: newX, y1: extent.y1 },
        };
      };
      brushRef.current.updateBrush(updater);
    }
  };

  const [brushDomain, setBrushDomain] = useState([start, end]);
  useEffect(() => {
    setDateRange({
      start: formatDatePicker(brushDomain[0]),
      end: formatDatePicker(brushDomain[1]),
    });
  }, [brushDomain]);

  const filteredData = filterByDate(
    dailyAutonomyMetricsData,
    brushDomain[0],
    brushDomain[1]
  );

  //scale
  const brushXScale = useMemo(
    () =>
      scaleTime()
        .domain(getXDomain(dailyAutonomyMetricsData))
        .range([0, xBrushMax]),
    [dailyAutonomyMetricsData, xBrushMax]
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
        .domain(getYDomain(dailyAutonomyMetricsData))
        .range([yBrushMax, 0]),
    [dailyAutonomyMetricsData, yBrushMax]
  );

  const xScale = useMemo(
    () => scaleTime().domain(getXDomain(filteredData)).range([0, xMax]),
    [filteredData, xMax]
  );

  const yScale = useMemo(
    () => scaleLinear().domain(getYDomain(filteredData)).range([yMax, 0]),
    [filteredData, yMax]
  );

  const { sumAutonomousKm, sumInterventions, sumMetric, sumDistanceKm } =
    updateAutonomyMetric(
      [brushDomain[0], brushDomain[1]],
      dailyAutonomyMetricsData,
      selectedMetric
    );

  const renderTitle = (activeFilter) => {
    return activeFilter === SITE_FILTER
      ? SITE_BUTTONS[mainFilter]
      : SHIFT_BUTTONS[mainFilter];
  };
  const renderInterventionTitle = (interventionType, checkedExclusions) => {
    if (interventionType === INTERVENTIONS_TOTAL) {
      const exclusions = Object.entries(checkedExclusions)
        .filter(([k, v]) => v === true)
        .map(([k, v]) => EXCLUDE_INTERVENTIONS_BUTTONS[k]);

      return `${INTERVENTION_BUTTONS[interventionType]} ${
        exclusions.length > 0 ? `(Excluding ${exclusions})` : ""
      }`;
    }
    return INTERVENTION_BUTTONS[interventionType];
  };
  const filteredTimelineData = filterTimelineData(
    timelineData,
    activeFilter,
    filterValues
  );
  const renderSummaryMetrics = (selectedMetric) => {
    if (selectedMetric === KMPI) {
      return (
        <div className="d-flex justify-content-center">
          <p className="h4 me-3">{sumMetric} km/I</p>
          <p className="h4 me-3">{sumAutonomousKm} autonomous km</p>
          <p className="h4">
            {sumInterventions}{" "}
            {renderInterventionTitle(interventionType, checkedExclusions)}
          </p>
        </div>
      );
    } else if (selectedMetric === IPKM) {
      return (
        <div className="d-flex justify-content-center">
          <p className="h4 me-3">{sumMetric} I/50km</p>
          <p className="h4 me-3">{sumAutonomousKm} autonomous km</p>
          <p className="h4">
            {sumInterventions}{" "}
            {renderInterventionTitle(interventionType, checkedExclusions)}
          </p>
        </div>
      );
    } else if (selectedMetric === AUTONOMY_PCT) {
      return (
        <div className="d-flex justify-content-center">
          <p className="h4 me-3">{sumMetric} autonomy</p>
          <p className="h4 me-3">{sumAutonomousKm} autonomous km</p>
          <p className="h4">{sumDistanceKm} km in service</p>
        </div>
      );
    }
  };
  return (
    <div>
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="me-2">Pick date range:</div>
        <div className="me-3">
          <input
            id="start"
            className="form-control"
            min="2022-06-01"
            max={formatDatePicker(new Date())}
            type="date"
            onChange={handleChangeDate}
            value={dateRange.start}
          />
        </div>
        to
        <div className="ms-3">
          <input
            id="end"
            className="form-control"
            min="2022-06-01"
            max={formatDatePicker(new Date())}
            type="date"
            onChange={handleChangeDate}
            value={dateRange.end}
          />
        </div>
      </div>
      <div className="text-center">
        <span className="h3">{`${formatDate(brushDomain[0])} to`}</span>
        <span className="h3">{` ${formatDate(brushDomain[1])}`}</span>
        <span className="h3"> {`for ${renderTitle(activeFilter)}`}</span>
      </div>
      {renderSummaryMetrics(selectedMetric)}
      <svg height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
        <g transform={`translate(${width / 3},${margin.top})`}>
          <rect fill="#00bcee" width={legendHeight} height={legendHeight} />
          <text x={legendHeight + 5} y={legendHeight / 2} dy="0.35em">
            daily km/I
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
            Moving Average ({movingAverageWindow} days)
          </text>
        </g>

        <Grid
          xScale={xScale}
          yScale={yScale}
          width={xMax}
          height={yMax}
          numTicksColumns={0}
          numTicksRows={3}
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
          data={dailyAutonomyMetricsData}
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
    </div>
  );
}
