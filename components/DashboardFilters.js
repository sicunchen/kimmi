import { useEffect } from "react";
import { formatDatePicker } from "../hooks/useDailyChartData";
import { SHIFT_BUTTONS, DRIVER_OUT_READY } from "../constants/shiftCategories";
import {
  EXCLUDE_INTERVENTIONS_BUTTONS,
  INTERVENTIONS_PARKING_LOT,
  INTERVENTIONS_TOTAL,
  INTERVENTION_BUTTONS,
  INTERVENTION_MANUALZONE,
  INTERVENTION_PASSENGERSTOPS,
} from "../constants/interventionCategories";
import { SITE_FILTER, SHIFT_FILTER } from "../constants/filters";
import { NORTH_AMERICA, SITE_BUTTONS, SUN_CITY } from "../constants/sites";
import { LIGHT_STYLE } from "../constants/mapStyle";
import { AUTONOMY_PCT, METRICS_BUTTONS } from "../constants/metrics";
import styles from "./DashboardFilters.module.css";
import { useFilter } from "./DashboardReducer";
import {
  handleChangeExclusion,
  handleChangeFilter,
  handleChangeInterventionType,
  handleChangeMetric,
  handleChangeShift,
  handleChangeSite,
  handleChangeWindow,
  touchDateInput,
} from "./DashboardActions";
export const DateRangeFilter = () => {
  const { state, dispatch } = useFilter();
  const onChange = (e) => {
    dispatch(touchDateInput(e.target.id, e.target.value));
  };

  return (
    <div>
      <div className={styles.input}>
        <input
          id="start"
          min="2022-06-01"
          max={formatDatePicker(new Date())}
          type="date"
          onChange={onChange}
          value={formatDatePicker(state.selectedDateRange.start)}
        />
      </div>
      <div className={styles.input}>
        <input
          id="end"
          min="2022-06-01"
          max={formatDatePicker(new Date())}
          type="date"
          onChange={onChange}
          value={formatDatePicker(state.selectedDateRange.end)}
        />
      </div>
    </div>
  );
};

export const MainFilter = () => {
  const { state, dispatch } = useFilter();
  const onChange = (e) => {
    dispatch(handleChangeFilter(e.target.value));
  };
  useEffect(() => {
    if (state.activeFilter === SHIFT_FILTER) {
      if (state.selectedShift === DRIVER_OUT_READY) {
        dispatch(handleChangeSite(SUN_CITY));
      } else {
        dispatch(handleChangeSite(NORTH_AMERICA));
      }
    } else {
      dispatch(handleChangeSite(NORTH_AMERICA));
    }
  }, [state.activeFilter, state.selectedShift]);
  return (
    <div>
      <div className={styles.input}>
        <input
          checked={state.activeFilter === SHIFT_FILTER}
          type="radio"
          value={SHIFT_FILTER}
          id={SHIFT_FILTER}
          name="filters"
          onChange={onChange}
        />
        <label htmlFor={SHIFT_FILTER}>Shift Category</label>
      </div>
      <div className={styles.input}>
        <input
          checked={state.activeFilter === SITE_FILTER}
          type="radio"
          value={SITE_FILTER}
          id={SITE_FILTER}
          name="filters"
          onChange={onChange}
        />
        <label htmlFor={SITE_FILTER}>Site</label>
      </div>
    </div>
  );
};
export const SiteFilters = () => {
  const { state, dispatch } = useFilter();
  const onChange = (e) => {
    dispatch(handleChangeSite(e.target.value));
  };

  return (
    <div>
      {Object.entries(SITE_BUTTONS).map(([key, val]) => {
        return (
          <div key={key} className={styles.input}>
            <input
              checked={state.selectedSite === key}
              type="radio"
              value={key}
              id={`site-button-${key}`}
              name="sites"
              onChange={onChange}
            />
            <label htmlFor={`site-button-${key}`}>{val}</label>
          </div>
        );
      })}
    </div>
  );
};
export const ShiftFilters = () => {
  const { state, dispatch } = useFilter();
  const onChange = (e) => {
    dispatch(handleChangeShift(e.target.value));
  };
  return (
    <div>
      {Object.entries(SHIFT_BUTTONS).map(([key, val]) => {
        return (
          <div key={key} className={styles.input}>
            <input
              checked={state.selectedShift === key}
              type="radio"
              value={key}
              id={`shift-button-${key}`}
              name="shifts"
              onChange={onChange}
            />
            <label htmlFor={`shift-button-${key}`}>{val}</label>
          </div>
        );
      })}
    </div>
  );
};
export const InterventionFilters = () => {
  const { state, dispatch } = useFilter();
  const onChange = (e) => {
    dispatch(handleChangeInterventionType(e.target.value));
  };
  useEffect(() => {
    if (state.selectedMetric === AUTONOMY_PCT) {
      dispatch(handleChangeInterventionType(""));
    }
  }, [state.selectedMetric]);
  return (
    <div>
      {Object.entries(INTERVENTION_BUTTONS).map(([key, val]) => {
        return (
          <div key={key} className={styles.input}>
            <input
              disabled={state.selectedMetric === AUTONOMY_PCT}
              type="radio"
              value={key}
              id={`intervention-button-${key}`}
              name="interventions"
              checked={state.interventionType === key}
              onChange={onChange}
            />
            <label htmlFor={`intervention-button-${key}`}>{val}</label>
          </div>
        );
      })}
    </div>
  );
};
export const ExcludeInterventionsFilters = () => {
  const { state, dispatch } = useFilter();
  const onChange = (e) => {
    dispatch(handleChangeExclusion(e.target.value, e.target.checked));
  };
  useEffect(() => {
    //when rare or non-rare interventions is selected, unselect all the checkboxes
    if (state.interventionType !== INTERVENTIONS_TOTAL) {
      dispatch(handleChangeExclusion(INTERVENTION_MANUALZONE, false));
      dispatch(handleChangeExclusion(INTERVENTION_PASSENGERSTOPS, false));
      dispatch(handleChangeExclusion(INTERVENTIONS_PARKING_LOT, false));
    }
  }, [state.interventionType]);
  return (
    <div>
      {Object.entries(EXCLUDE_INTERVENTIONS_BUTTONS).map(([key, val]) => {
        return (
          <div key={key} className={styles.input}>
            <input
              disabled={
                key === INTERVENTIONS_PARKING_LOT ||
                state.interventionType !== INTERVENTIONS_TOTAL ||
                state.selectedMetric === AUTONOMY_PCT
              }
              type="checkbox"
              value={key}
              id={`exclude-intervention-button-${key}`}
              name="exclude-interventions"
              onChange={onChange}
              checked={state.checkedExclusions[key] === true}
            />
            <label htmlFor={`exclude-intervention-button-${key}`}>{val}</label>
          </div>
        );
      })}
    </div>
  );
};
export const MetricFilters = () => {
  const { state, dispatch } = useFilter();
  const onChange = (e) => {
    dispatch(handleChangeMetric(e.target.value));
  };
  return (
    <div>
      {Object.entries(METRICS_BUTTONS).map(([key, val]) => {
        return (
          <div key={key} className={styles.input}>
            <input
              type="radio"
              value={key}
              id={`metrics-button-${key}`}
              name="metrics"
              checked={state.selectedMetric === key}
              onChange={onChange}
            />
            <label htmlFor={`metrics-button-${key}`}>{val}</label>
          </div>
        );
      })}
    </div>
  );
};
export const MovingWindowSlider = () => {
  const { state, dispatch } = useFilter();
  const onChange = (e) => {
    dispatch(handleChangeWindow(e.target.value));
  };
  return (
    <div className={styles.input}>
      <input
        id="movingAvgWindow"
        type="range"
        min="2"
        max="100"
        value={state.movingAvgWindow}
        onChange={onChange}
      />
      <label htmlFor="movingAvgWindow">{state.movingAvgWindow} days</label>
    </div>
  );
};
export const MapStyleFilter = () => {
  return (
    <div>
      {["light", "satellite"].map(([key]) => {
        return (
          <div key={key} className={styles.input}>
            <input type="radio" value={key} id={`map-${key}`} name="map" />
            <label htmlFor={`map-${key}`}>{key}</label>
          </div>
        );
      })}
    </div>
  );
};
