import fetcher from "../utils/fetcher";
import useSWR from "swr";
import { timeDay, timeMonth, timeWeek, timeYear } from "d3-time";
import { timeParse, timeFormat } from "d3-time-format";
import { flatGroup, flatRollup, sum, index, mean, ascending } from "d3-array";
import { NORTH_AMERICA } from "../constants/sites";
import { COMMERCIAL } from "../constants/shiftCategories";
import { format } from "d3-format";
import { SHIFT_FILTER, SITE_FILTER } from "../constants/filters";
export default function useDailyChartData() {
  const { data, error } = useSWR(
    "https://myvpkwzce6.us-east-1.awsapprunner.com/interventions?start_date=2022-06-01",
    fetcher
  );
  let rawDailyAutonomyMetricsData;
  if (data) {
    rawDailyAutonomyMetricsData = data
      .split(/\n/)
      .filter((line) => line)
      .slice(1)
      .map((line) => processCSV(line));
  }

  return {
    data,
    rawDailyAutonomyMetricsData,
    error,
  };
}

export function processCSV(line) {
  const [
    site,
    date,
    shift_category,
    distance_autonomous,
    distance,
    distance_in_service,
    distance_on_route,
    distance_healthy,
    distance_autonomy_capable,
    interventions_total,
    interventions_rare,
    interventions_non_rare,
    interventions_manual_only_zone,
    interventions_passenger_stops,
    interventions_wheather,
    interventions_construction,
    interventions_parking_lot,
    interventions_planned,
    interventions_unplanned,
    log_count,
  ] = line.split(/,/);
  return {
    site,
    date: timeParse("%Y-%m-%d")(date),
    shiftCategory: shift_category,
    distanceAutonomous: +distance_autonomous,
    distance: +distance,
    distanceInService: +distance_in_service,
    distanceOnRoute: +distance_on_route,
    distanceHealthy: +distance_healthy,
    distanceAutonomyCapable: +distance_autonomy_capable,
    interventionsTotal: +interventions_total,
    interventionsRare: +interventions_rare,
    interventionsNonRare: +interventions_non_rare,
    interventionsManualOnlyZone: +interventions_manual_only_zone,
    interventionsPassengerStops: +interventions_passenger_stops,
    interventionsConstruction: +interventions_construction,
    interventionsParkingLot: +interventions_parking_lot,
    interventionsPlanned: +interventions_planned,
    interventionsUnplanned: +interventions_unplanned,
  };
}

export function createServiceDatesTemplate(rawDailyAutonomyMetricsData) {
  const serviceDates = flatGroup(rawDailyAutonomyMetricsData, (d) => d.date)
    .map(([k, v]) => ({ date: k }))
    .sort((a, b) => ascending(a.date, b.date));
  return serviceDates;
}
export function transformDailyAutonomyMetricsData(
  rawDailyAutonomyMetricsData,
  activeFilter,
  filterValues,
  serviceDates
) {
  let filteredData;
  const {
    interventionType,
    mainFilter,
    movingAverageWindow,
    checkedExclusions,
  } = filterValues;
  if (activeFilter === SITE_FILTER) {
    filteredData = rawDailyAutonomyMetricsData.filter((d) => {
      if (mainFilter !== NORTH_AMERICA) {
        return (d.site === mainFilter) & (d.shiftCategory === COMMERCIAL);
      } else {
        return d.shiftCategory === COMMERCIAL;
      }
    });
  } else if (activeFilter === SHIFT_FILTER) {
    filteredData = rawDailyAutonomyMetricsData.filter(
      (d) => d.shiftCategory === mainFilter
    );
  }
  let metricsData = flatRollup(
    filteredData,
    (v) => {
      const numInterventions = sum(v, (d) => d[interventionType]);
      let interventions = numInterventions;
      for (const [key, val] of Object.entries(checkedExclusions)) {
        if (val) {
          interventions -= sum(v, (d) => d[key]);
        }
      }
      const autonomousKm = sum(v, (d) => d.distanceAutonomous) / 1000;
      return {
        date: v[0].date,
        shiftCategory: v[0].shiftCategory,
        autonomousKm,
        interventions,
        // handle case where there are no interventions; default to autonomousKm
        kmpi: interventions === 0 ? autonomousKm : autonomousKm / interventions,
        opacity: 1,
      };
    },
    (d) => d.date
  ).map(([_, v]) => v);
  // adds weekly moving average as another key
  metricsData = movingAverage(metricsData, Number(movingAverageWindow));
  //TODO: ask Alex the purpose of this function
  metricsData = fillInMissingDates(metricsData, serviceDates);
  return metricsData;
}
export function fillInMissingDates(siteData, serviceDates) {
  const siteDate = index(siteData, (d) => d.date);
  let dataArray = [];
  let lastMovingAvgValue = 0;
  for (let serviceDate of serviceDates) {
    if (siteDate.has(serviceDate.date)) {
      dataArray.push(siteDate.get(serviceDate.date));
      lastMovingAvgValue = siteDate.get(serviceDate.date).avg;
    } else {
      dataArray.push({
        // empty row equivalent for graphing purposes
        date: serviceDate.date,
        kmpi: 0,
        avg: lastMovingAvgValue,
        opacity: 0,
      });
    }
  }
  return dataArray;
}

export function movingAverage(data, movingAverageWindow, column = "kmpi") {
  const sortedData = data.sort((a, b) => ascending(a.date, b.date));

  // avg over past N days
  return sortedData.map((row, idx, arr) => {
    const startIdx = Math.max(0, idx - movingAverageWindow + 1); // grab last N rows
    const movingWindow = arr.slice(startIdx, idx + 1);
    const pastNDaysWindow = movingWindow.filter(
      (d) => d.date > timeDay.offset(row.date, -movingAverageWindow)
    );
    row.avg = mean(pastNDaysWindow, (d) => d[column]);
    return row;
  });
}

export function updateAutonomyMetric(dateRange, dailyAutonomyMetricsData) {
  const data = dailyAutonomyMetricsData
    .filter((d) => dateRange[0] <= d.date && d.date <= dateRange[1])
    .filter((d) => d.opacity === 1);

  const sumAutonomousKm = formatDecimal(sum(data, (d) => d.autonomousKm));
  const sumInterventions = sum(data, (d) => d.interventions);
  const sumKmpiValue = formatAutonomyMetric(sumAutonomousKm / sumInterventions);
  return {
    sumAutonomousKm,
    sumInterventions,
    sumKmpiValue,
  };
}

function formatAutonomyMetric(d) {
  return isNaN(d) ? "no data" : d == 0 ? "no data" : formatDecimal(d);
}

export function formatDate(date) {
  return timeFormat("%b %e, %Y")(date);
}

export function formatDecimal(num) {
  return format(".2f")(num);
}

export function formatDatePicker(date) {
  return timeFormat("%Y-%m-%d")(date);
}

export function parseDatePicker(val) {
  return timeParse("%Y-%m-%d")(val);
}

export function multiDateFormat(date) {
  // define tick formats
  const fmtHour = timeFormat("%I%p");
  const fmtDay = timeFormat("%a %e");
  const fmtWeek = timeFormat("%b %e");
  const fmtMonth = timeFormat("%b");
  const fmtYear = timeFormat("%Y");
  return (
    timeDay(date) < date
      ? fmtHour
      : timeMonth(date) < date
      ? timeWeek(date) < date
        ? fmtDay
        : fmtWeek
      : timeYear(date) < date
      ? fmtMonth
      : fmtYear
  )(date).replace("PM", "pm");
}
