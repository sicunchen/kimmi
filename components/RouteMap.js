import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import states from "./site-states.json";
import cities from "./site-cities.json";
import { scaleThreshold } from "d3-scale";
import { NORTH_AMERICA, SUN_CITY } from "../constants/sites";
import RouteMapData from "./routes.json";

const colorScale = scaleThreshold()
  .domain([0.1, 0.5, 0.6, 0.7, 0.8])
  .range(["#ccc", "#ffd7a2", "#ffc474", "#ffb045", "#ff9c17", "#cc7d12"]);

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2RpLW1hcGJveCIsImEiOiJjbDh4YXZhdngwNHE0M290NXFocjJvM2djIn0.3fYmtJppNmkn47AoIP7hhg";

export default function RouteMap({ selectedSite, mapStyle }) {
  const {
    map_center: center,
    map_zoom: zoom,
    tileset_src: tilesetSrc,
    tileset_layer_name: tilesetLayer,
  } = RouteMapData[selectedSite];
  const mapContainer = useRef(null);
  const map = useRef(null);
  const generateRouteColor = (routeData) => {
    const defaultColor = "royalblue";
    if (selectedSite === SUN_CITY) return defaultColor;

    let matchExpression = ["match", ["get", "segment_id"]];

    for (const [segmentId, pct] of Object.entries(routeData)) {
      matchExpression.push(
        Number(segmentId.replace("segment-", "")),
        colorScale(pct)
      );
    }
    matchExpression.push(defaultColor); // color for segments w/ no data
    return matchExpression;
  };
  const addRouteToMapRef = (
    mapRef,
    layerId,
    tilesetSrc,
    tilesetLayer,
    routeData
  ) => {
    mapRef.addLayer({
      id: layerId,
      type: "line",
      source: {
        type: "vector",
        url: `mapbox://${tilesetSrc}`,
      },
      "source-layer": tilesetLayer,
      layout: {
        visibility: "visible",
        "line-cap": "round",
      },
      paint: {
        // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step
        "line-width": 5,
        "line-color": generateRouteColor(routeData),
      },
    });
  };

  const addStatesToMapRef = (mapRef, sourceData) => {
    if (!mapRef.getSource("states")) {
      mapRef.addSource("states", {
        type: "geojson",
        data: sourceData,
      });
    }
    mapRef.addLayer({
      id: "state-boundary",
      type: "fill",
      source: "states",
      paint: {
        "fill-color": "#00bcee",
        "fill-opacity": 0.5,
      },
      filter: ["==", "$type", "Polygon"],
    });
  };

  const addCitiesToMapRef = (mapRef, sourceData) => {
    for (const marker of sourceData.features) {
      const el = document.createElement("div");
      el.className = "marker bg-white";
      for (const property of Object.values(marker.properties)) {
        const tag = document.createElement("p");
        tag.className = "mb-0";
        const text = document.createTextNode(property);
        tag.appendChild(text);
        el.appendChild(tag);
      }
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(mapRef);
    }
  };

  const paint = async (selectedSite) => {
    if (selectedSite === NORTH_AMERICA) {
      map.current.scrollZoom.disable();
      addCitiesToMapRef(map.current, cities);
      addStatesToMapRef(map.current, states);
    } else {
      const routeData =
        selectedSite === SUN_CITY ? [] : await getRouteData(selectedSite);
      map.current.scrollZoom.enable();
      document.querySelectorAll(".marker").forEach((el) => el.remove());
      if (map.current.getLayer("state-boundary")) {
        map.current.removeLayer("state-boundary");
      }
      const layerId = `${selectedSite}-route`;
      if (!map.current.getLayer(layerId)) {
        addRouteToMapRef(
          map.current,
          layerId,
          tilesetSrc,
          tilesetLayer,
          routeData
        );
      }
    }
  };

  const getRouteData = async (selectedSite) => {
    const apiUrl = `https://dashboard-api.sdi.maymobility.com/${selectedSite}/autonomy/heatmap`;
    const response = await fetch(apiUrl, {
      headers: { "content-type": "text/csv;charset=UTF-8" },
    });
    if (response.ok) {
      const csv = await response.text();
      const data = csv.split(/\n/).reduce((obj, line, index) => {
        if (index !== 0) {
          const [segmentId, autoCT, healthyCT, pct] = line.split(/,/);
          if (pct !== undefined) {
            obj[`segment-${segmentId}`] = pct;
          }
        }
        return obj;
      }, {});
      return data;
    } else {
      console.error(`error code ${response.status}`);
    }
  };

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      center,
      zoom,
      style: mapStyle,
    });
    map.current.on("load", () => {
      paint(selectedSite);
    });
  }, [mapStyle]);

  useEffect(() => {
    map.current.setCenter(center);
    map.current.setZoom(zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!map.current.isStyleLoaded()) return;
    paint(selectedSite);
  }, [selectedSite]);

  return <div ref={mapContainer} style={{ height: "500px" }} />;
}
