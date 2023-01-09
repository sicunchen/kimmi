import { Fragment } from "react";
import { SITE_FILTER } from "../constants/filters";
import { SITE_BUTTONS } from "../constants/sites";
import {
  INTERVENTIONS_TOTAL,
  EXCLUDE_INTERVENTIONS_BUTTONS,
  INTERVENTION_BUTTONS,
} from "../constants/interventionCategories";
import { KMPI, IPKM, AUTONOMY_PCT } from "../constants/metrics";
import { SHIFT_BUTTONS } from "../constants/shiftCategories";
import {
  createServiceDatesTemplate,
  filterbyDate,
  formatDate,
  transformDailyAutonomyMetricsData,
  updateSummaryMetric,
} from "../hooks/useDailyChartData";
import { useFilter } from "./DashboardReducer";
import styles from "./SummaryMetrics.module.css";

const renderTitle = (activeFilter, selectedShift, selectedSite) => {
  return activeFilter === SITE_FILTER
    ? SITE_BUTTONS[selectedSite]
    : SHIFT_BUTTONS[selectedShift];
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
export default function SummaryMetrics({ rawData }) {
  const { state } = useFilter();

  const {
    activeFilter,
    selectedMetric,
    interventionType,
    checkedExclusions,
    selectedDateRange,
    selectedShift,
    selectedSite,
    movingAvgWindow,
  } = state;
  const { start, end } = selectedDateRange;
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
  const filteredData = filterbyDate(dailyData, [start, end]);
  const { sumAutonomousKm, sumInterventions, sumMetric, sumDistanceKm } =
    updateSummaryMetric(filteredData, selectedMetric);

  const renderMetrics = (selectedMetric) => {
    if (selectedMetric === KMPI) {
      return (
        <Fragment>
          <h3>{sumMetric} km/I</h3>
          <h3>{sumAutonomousKm} autonomous km</h3>
          <h3>
            {sumInterventions}{" "}
            {renderInterventionTitle(interventionType, checkedExclusions)}
          </h3>
        </Fragment>
      );
    } else if (selectedMetric === IPKM) {
      return (
        <Fragment>
          <h3>{sumMetric} I/50km</h3>
          <h3>{sumAutonomousKm} autonomous km</h3>
          <h3>
            {sumInterventions}{" "}
            {renderInterventionTitle(interventionType, checkedExclusions)}
          </h3>
        </Fragment>
      );
    } else if (selectedMetric === AUTONOMY_PCT) {
      return (
        <Fragment>
          <h3>{sumMetric} autonomy</h3>
          <h3>{sumAutonomousKm} autonomous km</h3>
          <h3>{sumDistanceKm} km in service</h3>
        </Fragment>
      );
    }
  };

  return (
    <Fragment>
      <div className={styles.title}>
        <h3>{`${formatDate(new Date(start))} to ${formatDate(
          new Date(end)
        )} for ${renderTitle(activeFilter, selectedShift, selectedSite)}`}</h3>
      </div>
      <div className={styles.metricsContainer}>
        {renderMetrics(selectedMetric)}
      </div>
    </Fragment>
  );
}
