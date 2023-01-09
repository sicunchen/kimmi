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

export const handleChangeMapStyle = (mapStyle) => ({
  type: CHANGE_MAP_STYLE,
  mapStyle,
});

export const handleChangeSite = (selectedSite) => ({
  type: CHANGE_SITE,
  selectedSite,
});
export const handleChangeShift = (selectedShift) => ({
  type: CHANGE_SHIFT,
  selectedShift,
});
export const handleChangeFilter = (activeFilter) => ({
  type: CHANGE_FILTER,
  activeFilter,
});
export const handleChangeInterventionType = (interventionType) => ({
  type: CHANGE_INTERVENTION_TYPE,
  interventionType,
});
export const handleChangeMetric = (selectedMetric) => ({
  type: CHANGE_METRIC,
  selectedMetric,
});

export const handleChangeExclusion = (key, checked) => ({
  type: CHANGE_EXCLUSION,
  data: { [key]: checked },
});
export const handleChangeWindow = (movingAvgWindow) => ({
  type: CHANGE_MOVING_WINDOW,
  movingAvgWindow,
});
export const handleChangeDateRange = (start, end) => ({
  type: CHANGE_DATERANGE,
  selectedDateRange: { start, end },
});
export const touchDateInput = (id, value) => ({
  type: TOUCH_DATEINPUT,
  touchedDateInput: { touchedId: id, value },
});
