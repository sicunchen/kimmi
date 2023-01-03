import { Fragment, useEffect, useState, useRef } from "react";
import RouteMap from "./RouteMap";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import AutonomyMetricsWithBrush from "./AutonomyMetricsWithBrush";
import { NORTH_AMERICA, SITE_BUTTONS, SUN_CITY } from "../constants/sites";
import { LIGHT_STYLE } from "../constants/mapStyle";
import useDailyChartData from "../hooks/useDailyChartData";
import {
  COMMERCIAL,
  DRIVER_OUT_READY,
  SHIFT_BUTTONS,
} from "../constants/shiftCategories";
import {
  EXCLUDE_INTERVENTIONS_BUTTONS,
  INTERVENTIONS_PARKING_LOT,
  INTERVENTIONS_TOTAL,
  INTERVENTION_BUTTONS,
  INTERVENTION_MANUALZONE,
  INTERVENTION_PASSENGERSTOPS,
} from "../constants/interventionCategories";
import { SITE_FILTER, SHIFT_FILTER } from "../constants/filters";
import AutomonyMetricsWithBrush from "./AutonomyMetricsWithBrush";
import { AUTONOMY_PCT, KMPI, METRICS_BUTTONS } from "../constants/metrics";
import useResizeObserver from "@react-hook/resize-observer";
import styles from "./Dashboard.module.css";
import { IoFilter } from "react-icons/io5";

const FilterButton = () => {
  return (
    <button className={styles.filterButton}>
      Show Filters
      <IoFilter size={"30px"} />
    </button>
  );
};
const Header = () => {
  return <header className={styles.header}>Autonomy Dashboard</header>;
};

export default function Dashboard() {
  const [selectedSite, setSite] = useState(NORTH_AMERICA);
  const [selectedStyle, setStyle] = useState(LIGHT_STYLE);
  const [selectedShift, setShift] = useState(COMMERCIAL);
  const [activeFilter, setActiveFilter] = useState(SHIFT_FILTER);
  const [interventionType, setInterventionType] = useState(INTERVENTIONS_TOTAL);
  const [selectedMetric, setSelectedMetric] = useState(KMPI);
  const [checkedExclusions, setCheckedExclusions] = useState({
    [INTERVENTION_MANUALZONE]: false,
    [INTERVENTION_PASSENGERSTOPS]: false,
    [INTERVENTIONS_PARKING_LOT]: false,
  });
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
  useEffect(() => {
    //when rare or non-rare interventions is selected, unselect all the checkboxes
    if (interventionType !== INTERVENTIONS_TOTAL) {
      setCheckedExclusions({
        [INTERVENTION_MANUALZONE]: false,
        [INTERVENTION_PASSENGERSTOPS]: false,
        [INTERVENTIONS_PARKING_LOT]: false,
      });
    }
  }, [interventionType]);
  useEffect(() => {
    if (activeFilter === SHIFT_FILTER) {
      if (selectedShift === DRIVER_OUT_READY) {
        setSite(SUN_CITY);
      } else {
        setSite(NORTH_AMERICA);
      }
    } else {
      setSite(NORTH_AMERICA);
    }
  }, [activeFilter, selectedShift]);
  const [movingAverageWindow, setWindow] = useState(30);

  const { rawDailyAutonomyMetricsData } = useDailyChartData();
  const handleChangeStyle = (e) => {
    setStyle(e.target.value);
  };

  const handleChangeSite = (e) => {
    setSite(e.target.value);
  };
  const handleChangeShift = (e) => {
    setShift(e.target.value);
  };
  const handleChangeFilter = (e) => {
    setActiveFilter(e.target.value);
  };
  const handleChangeInterventionType = (e) => {
    setInterventionType(e.target.value);
  };
  const handleChangeMetric = (e) => {
    setSelectedMetric(e.target.value);
  };

  const handleChangeExclusion = (e) => {
    setCheckedExclusions({
      ...checkedExclusions,
      [e.target.value]: e.target.checked,
    });
  };
  const handleChangeWindow = (e) => {
    setWindow(e.target.value);
  };

  const ShiftFilters = () => (
    <div className="d-flex align-items-center ms-3">
      <div className="me-2">Select a shift category:</div>
      <div
        className="btn-group"
        role="group"
        aria-label="shift category buttons"
      >
        {Object.entries(SHIFT_BUTTONS).map(([key, val]) => {
          return (
            <Fragment key={key}>
              <input
                checked={selectedShift === key}
                className="btn-check"
                type="radio"
                value={key}
                id={`shift-button-${key}`}
                name="shifts"
                onChange={handleChangeShift}
              />
              <label
                className="btn btn-outline-primary"
                htmlFor={`shift-button-${key}`}
              >
                {val}
              </label>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
  const SiteFilters = () => (
    <div className="d-flex align-items-center ms-3">
      <div className="me-2">Select a site:</div>
      <div className="btn-group" role="group" aria-label="site buttons">
        {Object.entries(SITE_BUTTONS).map(([key, val]) => {
          return (
            <Fragment key={key}>
              <input
                checked={selectedSite === key}
                className="btn-check"
                type="radio"
                value={key}
                id={`site-button-${key}`}
                name="sites"
                onChange={handleChangeSite}
              />
              <label
                className="btn btn-outline-primary"
                htmlFor={`site-button-${key}`}
              >
                {val}
              </label>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
  const InterventionFilters = () => {
    return (
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="me-2">Select an intervention category:</div>
        <div
          className="btn-group"
          role="group"
          aria-label="intervention buttons"
        >
          {Object.entries(INTERVENTION_BUTTONS).map(([key, val]) => {
            return (
              <Fragment key={key}>
                <input
                  disabled={selectedMetric === AUTONOMY_PCT}
                  className="btn-check"
                  type="radio"
                  value={key}
                  id={`intervention-button-${key}`}
                  name="interventions"
                  checked={interventionType === key}
                  onChange={handleChangeInterventionType}
                />
                <label
                  className="btn btn-outline-primary"
                  htmlFor={`intervention-button-${key}`}
                >
                  {val}
                </label>
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  };
  const ExcludeInterventionsFilters = () => {
    return (
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="me-2">
          Exclude these interventions from total interventions:
        </div>
        <div
          className="btn-group"
          role="group"
          aria-label="intervention exclusion buttons"
        >
          {Object.entries(EXCLUDE_INTERVENTIONS_BUTTONS).map(([key, val]) => {
            return (
              <Fragment key={key}>
                <input
                  disabled={
                    key === INTERVENTIONS_PARKING_LOT ||
                    interventionType !== INTERVENTIONS_TOTAL ||
                    selectedMetric === AUTONOMY_PCT
                  }
                  className="btn-check"
                  type="checkbox"
                  value={key}
                  id={`exclude-intervention-button-${key}`}
                  name="exclude-interventions"
                  onChange={handleChangeExclusion}
                  checked={checkedExclusions[key] === true}
                />
                <label
                  className="btn btn-outline-primary"
                  htmlFor={`exclude-intervention-button-${key}`}
                >
                  {val}
                </label>
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  };
  const MetricFilters = () => {
    return (
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="me-2">Select a metric:</div>
        <div className="btn-group" role="group" aria-label="metric buttons">
          {Object.entries(METRICS_BUTTONS).map(([key, val]) => {
            return (
              <Fragment key={key}>
                <input
                  className="btn-check"
                  type="radio"
                  value={key}
                  id={`metrics-button-${key}`}
                  name="metrics"
                  checked={selectedMetric === key}
                  onChange={handleChangeMetric}
                />
                <label
                  className="btn btn-outline-primary"
                  htmlFor={`metrics-button-${key}`}
                >
                  {val}
                </label>
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const mapStyle =
    selectedStyle === LIGHT_STYLE
      ? "mapbox://styles/sdi-mapbox/ckljmydtx12aj17p7nwxws7ct"
      : "mapbox://styles/mapbox/satellite-v9";
  const renderMarkup = (isMobile) => {
    return isMobile ? (
      <Fragment>
        <Header />
        <FilterButton />
        <div className={styles.summary}>Summary metrics</div>
        <div className={styles.barChartContainer}>bar chart</div>
        <div className={styles.mapContainer}>map</div>
      </Fragment>
    ) : (
      <Fragment>
        <Header />
        <div className={styles.sideBar}>sideBar</div>
        <div className={styles.summaryAndFilterButton}>
          <div className={styles.summary}>Summary metrics</div>
          <FilterButton />
        </div>
        <div className={styles.barChartContainer}>bar chart</div>
        <div className={styles.mapContainer}>map</div>
      </Fragment>
    );
  };
  return (
    <section id="dashboard" ref={ref} className={styles.dashboardSection}>
      {renderMarkup(isMobile)}
    </section>
  );
}
