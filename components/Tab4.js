import { Fragment, useEffect, useState } from "react";
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

export default function Tab4() {
  const [selectedSite, setSite] = useState(NORTH_AMERICA);
  const [selectedStyle, setStyle] = useState(LIGHT_STYLE);
  const [selectedShift, setShift] = useState(COMMERCIAL);
  const [activeFilter, setActiveFilter] = useState(SHIFT_FILTER);
  const [interventionType, setInterventionType] = useState(INTERVENTIONS_TOTAL);
  const [checkedExclusions, setCheckedExclusions] = useState({
    [INTERVENTION_MANUALZONE]: false,
    [INTERVENTION_PASSENGERSTOPS]: false,
    [INTERVENTIONS_PARKING_LOT]: false,
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
    <div className="d-flex justify-content-center align-items-center mt-3 mb-3">
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
    <div className="d-flex justify-content-center align-items-center mb-3">
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
          Exclude these types of interventions from total Interventions:
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
                  disabled={key === INTERVENTIONS_PARKING_LOT && true}
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
  const renderFilters = (activeFilter) => {
    return (
      <Fragment>
        {activeFilter === SHIFT_FILTER ? <ShiftFilters /> : <SiteFilters />}
        <InterventionFilters />
        {interventionType === INTERVENTIONS_TOTAL && (
          <ExcludeInterventionsFilters />
        )}
      </Fragment>
    );
  };

  const mapStyle =
    selectedStyle === LIGHT_STYLE
      ? "mapbox://styles/sdi-mapbox/ckljmydtx12aj17p7nwxws7ct"
      : "mapbox://styles/mapbox/satellite-v9";
  return (
    <div className="d-flex flex-column vh-100">
      <div id="manual">
        <div className="text-center">
          <h1 className="text-primary">UNDERSTANDING MANUAL INTERVENTIONS</h1>
          <h5>
            Manual interventions occur for a variety of reasons. Our routes have
            a variety of different autonomy levels due to a span of reasons,
            including areas with a lot of foot traffic, weather (e.g. light
            rain), and tailgating.
          </h5>
        </div>
        <div className="d-flex justify-content-center align-items-center mt-3 mb-3">
          <div className="me-2">Filter the chart by:</div>
          <div
            className="btn-group"
            role="group"
            aria-label="filter type buttons"
          >
            <input
              checked={activeFilter === SHIFT_FILTER}
              className="btn-check"
              type="radio"
              value={SHIFT_FILTER}
              id={SHIFT_FILTER}
              name="filters"
              onChange={handleChangeFilter}
            />
            <label className="btn btn-outline-primary" htmlFor={SHIFT_FILTER}>
              Shift Category
            </label>
            <input
              checked={activeFilter === SITE_FILTER}
              className="btn-check"
              type="radio"
              value={SITE_FILTER}
              id={SITE_FILTER}
              name="filters"
              onChange={handleChangeFilter}
            />
            <label className="btn btn-outline-primary" htmlFor={SITE_FILTER}>
              Site
            </label>
          </div>
        </div>
        {renderFilters(activeFilter)}
        <div className="d-flex justify-content-center align-items-center mb-3">
          <label htmlFor="movingAvgDays" className="form-label me-2">
            Moving Average Window (range between 2-100):
          </label>
          <div>
            <input
              type="range"
              className="form-range"
              min="2"
              max="100"
              value={movingAverageWindow}
              onChange={handleChangeWindow}
            />
          </div>
        </div>
      </div>
      <div style={{ height: "400px", marginBottom: "100px" }}>
        {rawDailyAutonomyMetricsData && (
          <ParentSize>
            {({ width, height }) => {
              //https://github.com/airbnb/visx/issues/577
              if (width < 10) return null;
              return (
                <AutomonyMetricsWithBrush
                  rawDailyAutonomyMetricsData={rawDailyAutonomyMetricsData}
                  height={height}
                  activeFilter={activeFilter}
                  filterValues={{
                    mainFilter:
                      activeFilter === SITE_FILTER
                        ? selectedSite
                        : selectedShift,
                    interventionType,
                    checkedExclusions,
                    movingAverageWindow,
                  }}
                  width={width}
                />
              );
            }}
          </ParentSize>
        )}
      </div>
      <div>
        <div
          className="btn-group position-absolute bg-white"
          onChange={handleChangeStyle}
          role="group"
          style={{ zIndex: 1 }}
        >
          <input
            className="btn-check"
            defaultChecked
            id="btnradio1"
            name="mapStyles"
            type="radio"
            value="light"
          />
          <label className="btn btn-outline-primary" htmlFor="btnradio1">
            Light
          </label>
          <input
            className="btn-check"
            id="btnradio2"
            name="mapStyles"
            type="radio"
            value="satellite"
          />
          <label className="btn btn-outline-primary" htmlFor="btnradio2">
            Satellite
          </label>
        </div>
        <RouteMap mapStyle={mapStyle} selectedSite={selectedSite} />
      </div>
    </div>
  );
}
