import fetcher from "../utils/fetcher";
import useSWR from "swr";

export default function useRouteData(selectedSite) {
  const apiUrl = `https://dashboard-api.sdi.maymobility.com/${selectedSite}/autonomy/heatmap`;

  const { data, error } = useSWR(
    selectedSite != "all" ? apiUrl : null,
    fetcher
  );
  let routeData = null;

  if (data) {
    routeData = data.split(/\n/).reduce((obj, line, index) => {
      if (index !== 0) {
        const [segmentId, autoCT, healthyCT, pct] = line.split(/,/);
        if (pct !== undefined) {
          obj[`segment-${segmentId}`] = pct;
        }
      }
      return obj;
    }, {});
  }

  return {
    routeData,
    error,
  };
}
