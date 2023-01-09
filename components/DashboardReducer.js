import { SHIFT_FILTER, SITE_FILTER } from "../constants/filters";
import { LIGHT_STYLE } from "../constants/mapStyle";
import { KMPI } from "../constants/metrics";
import { COMMERCIAL, DRIVER_OUT_READY } from "../constants/shiftCategories";
import { NORTH_AMERICA, SUN_CITY } from "../constants/sites";
import {
  INTERVENTIONS_PARKING_LOT,
  INTERVENTIONS_TOTAL,
  INTERVENTION_MANUALZONE,
  INTERVENTION_PASSENGERSTOPS,
} from "../constants/interventionCategories";
import {
  CHANGE_DATERANGE,
  CHANGE_EXCLUSION,
  CHANGE_FILTER,
  CHANGE_INTERVENTION_TYPE,
  CHANGE_MAP_STYLE,
  CHANGE_METRIC,
  CHANGE_MOVING_WINDOW,
  CHANGE_SHIFT,
  CHANGE_SITE,
  TOUCH_DATEINPUT,
  UPDATE_DAILYDATA,
  UPDATE_SUMMARY,
} from "../constants/DashboardActionType";
import { createContext, useContext, useReducer } from "react";

export const initialState = {
  selectedSite: NORTH_AMERICA,
  selectedMapStyle: LIGHT_STYLE,
  selectedShift: COMMERCIAL,
  activeFilter: SHIFT_FILTER,
  interventionType: INTERVENTIONS_TOTAL,
  selectedMetric: KMPI,
  checkedExclusions: {
    [INTERVENTION_MANUALZONE]: false,
    [INTERVENTION_PASSENGERSTOPS]: false,
    [INTERVENTIONS_PARKING_LOT]: false,
  },
  movingAvgWindow: 30,
  selectedDateRange: { start: undefined, end: undefined },
  touchedDateInput: "",
};
//     const mapStyle =
// action.mapStyle === LIGHT_STYLE
//   ? "mapbox://styles/sdi-mapbox/ckljmydtx12aj17p7nwxws7ct"
//   : "mapbox://styles/mapbox/satellite-v9";

export const reducer = (state, action) => {
  switch (action.type) {
    case CHANGE_FILTER:
      return {
        ...state,
        activeFilter: action.activeFilter,
      };

    case CHANGE_SITE:
      return {
        ...state,
        selectedSite: action.selectedSite,
      };
    case CHANGE_SHIFT:
      return {
        ...state,
        selectedShift: action.selectedShift,
      };
    case CHANGE_METRIC:
      return {
        ...state,
        selectedMetric: action.selectedMetric,
      };
    case CHANGE_INTERVENTION_TYPE:
      return {
        ...state,
        interventionType: action.interventionType,
      };
    case CHANGE_EXCLUSION:
      return {
        ...state,
        checkedExclusions: { ...state.checkedExclusions, ...action.data },
      };
    case CHANGE_MOVING_WINDOW:
      return {
        ...state,
        movingAvgWindow: action.movingAvgWindow,
      };
    case CHANGE_MAP_STYLE:
      return {
        ...state,
        selectedMapStyle: action.mapStyle,
      };
    case CHANGE_DATERANGE:
      return {
        ...state,
        selectedDateRange: action.selectedDateRange,
      };
    case TOUCH_DATEINPUT:
      return {
        ...state,
        touchedDateInput: action.touchedDateInput,
      };
  }
};
const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <FilterContext.Provider value={{ state, dispatch }}>
      {children}
    </FilterContext.Provider>
  );
}
export function useFilter() {
  return useContext(FilterContext);
}
