import fetcher from "../utils/fetcher";
import useSWR from "swr";
import { timeDay, timeMonth, timeWeek, timeYear } from "d3-time";
import { timeParse, timeFormat } from "d3-time-format";
import {
  flatGroup,
  flatRollup,
  sum,
  index,
  mean,
  ascending,
  max,
  min,
} from "d3-array";
import { NORTH_AMERICA } from "../constants/sites";
import { COMMERCIAL, DRIVER_OUT_READY } from "../constants/shiftCategories";
import { format } from "d3-format";
import { SHIFT_FILTER, SITE_FILTER } from "../constants/filters";
import { AUTONOMY_PCT, IPKM, KMPI } from "../constants/metrics";
import { useFilter } from "../components/DashboardReducer";

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
    date: parseDatePicker(date),
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

export function filterTimelineData(
  timelineData,
  { activeFilter, selectedShift }
) {
  if (activeFilter === SHIFT_FILTER && selectedShift === DRIVER_OUT_READY) {
    return timelineData.filter((d) => d.category === DRIVER_OUT_READY);
  } else {
    return timelineData.filter((d) => d.category === COMMERCIAL);
  }
}
export function transformDailyAutonomyMetricsData(
  rawDailyAutonomyMetricsData,
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
) {
  let filteredData;

  if (activeFilter === SITE_FILTER) {
    filteredData = rawDailyAutonomyMetricsData.filter((d) => {
      if (selectedSite !== NORTH_AMERICA) {
        return (d.site === selectedSite) & (d.shiftCategory === COMMERCIAL);
      } else {
        return d.shiftCategory === COMMERCIAL;
      }
    });
  } else if (activeFilter === SHIFT_FILTER) {
    filteredData = rawDailyAutonomyMetricsData.filter(
      (d) => d.shiftCategory === selectedShift
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
      const distanceInServiceKm = sum(v, (d) => d.distanceInService) / 1000;
      const kmpi =
        interventions === 0 ? autonomousKm : autonomousKm / interventions;

      const ipkm = autonomousKm === 0 ? 0 : (interventions / autonomousKm) * 50;
      const autonomyPct = (autonomousKm / distanceInServiceKm) * 100;
      const metric =
        selectedMetric === KMPI
          ? kmpi
          : selectedMetric === AUTONOMY_PCT
          ? autonomyPct
          : ipkm;

      return {
        date: v[0].date,
        shiftCategory: v[0].shiftCategory,
        distanceInServiceKm,
        autonomousKm,
        interventions,
        opacity: 1,
        metric,
        kmpi,
        ipkm,
        autonomyPct,
      };
    },
    (d) => d.date
  ).map(([_, v]) => v);
  // adds weekly moving average as another key
  metricsData = movingAverage(metricsData, Number(movingAvgWindow));
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
        date: serviceDate["date"],
        kmpi: 0,
        ipkm: 0,
        autonomyPct: 0,
        metric: 0,
        avg: lastMovingAvgValue,
        opacity: 0,
      });
    }
  }
  return dataArray;
}

export function movingAverage(data, movingAverageWindow, column = "metric") {
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

export function filterbyDate(dailyData, dateRange) {
  return dailyData
    .filter((d) => dateRange[0] <= d.date && d.date <= dateRange[1])
    .filter((d) => d.opacity === 1);
}

export function updateSummaryMetric(data, selectedMetric) {
  const sumAutonomousKm = formatDecimal1(sum(data, (d) => d.autonomousKm));
  const sumInterventions = sum(data, (d) => d.interventions);
  const sumDistanceKm = formatDecimal1(sum(data, (d) => d.distanceInServiceKm));
  const sumMetric =
    selectedMetric === KMPI
      ? formatAutonomyMetric(sumAutonomousKm / sumInterventions)
      : selectedMetric === IPKM
      ? formatDecimal1((sumInterventions / sumAutonomousKm) * 50)
      : `${formatDecimal1((100 * sumAutonomousKm) / sumDistanceKm)} %`;

  return {
    sumAutonomousKm,
    sumInterventions,
    sumMetric,
    sumDistanceKm,
  };
}

function formatAutonomyMetric(d) {
  return isNaN(d) ? "no data" : d == 0 ? "no data" : formatDecimal2(d);
}

export function formatDate(date) {
  return timeFormat("%b %e, %Y")(date);
}

export function formatDecimal2(num) {
  return format(".2f")(num);
}
export function formatDecimal1(num) {
  return format(".1f")(num);
}
export function formatInteger(num) {
  return format("d")(num);
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
export function getYDomain(metricsData, selectedMetric) {
  return [
    0,
    selectedMetric === AUTONOMY_PCT
      ? Math.max(
          100,
          max(metricsData, (d) => d.metric),
          max(metricsData, (d) => d.avg)
        )
      : Math.max(
          max(metricsData, (d) => d.metric),
          max(metricsData, (d) => d.avg)
        ),
  ];
}

export function getXDomain(metricsData) {
  return [
    min(metricsData, (d) => d.date),
    timeDay.offset(
      max(metricsData, (d) => d.date),
      1
    ),
  ];
}
