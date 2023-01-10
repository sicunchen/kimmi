import states from "../constants/site-states.json";
import cities from "../constants/site-cities.json";
import { scaleThreshold } from "d3-scale";
import { NORTH_AMERICA, SUN_CITY } from "../constants/sites";
import RouteMapData from "../constants/routes.json";
import { useFilter } from "./DashboardReducer";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl";
import { Fragment, useEffect, useRef, useState } from "react";
import { FaLyft, FaMapMarkerAlt } from "react-icons/fa";
import useRouteData from "../hooks/useRouteData";
import useResizeObserver from "@react-hook/resize-observer";
const MAPBOX_TOKEN =
  "pk.eyJ1Ijoic2RpLW1hcGJveCIsImEiOiJjbDh4YXZhdngwNHE0M290NXFocjJvM2djIn0.3fYmtJppNmkn47AoIP7hhg";

const colorScale = scaleThreshold()
  .domain([0.1, 0.5, 0.6, 0.7, 0.8])
  .range(["#ccc", "#ffd7a2", "#ffc474", "#ffb045", "#ff9c17", "#cc7d12"]);

export default function SiteMap() {
  const [viewState, setViewState] = useState();
  const [showPopUp, setShowPopup] = useState(false);
  const { state } = useFilter();
  const { selectedSite } = state;
  const { routeData } = useRouteData(selectedSite);
  const wrapperRef = useRef(null);
  const mapRef = useRef(null);
  useResizeObserver(wrapperRef, () => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  });

  useEffect(() => {
    const { map_center: center, map_zoom: zoom } = RouteMapData[selectedSite];
    setViewState({
      longitude: center[0],
      latitude: center[1],
      zoom: zoom,
    });
  }, [selectedSite]);

  const generateRouteColor = (routeData) => {
    if (!routeData) return;
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

  const renderNALayer = () => {
    const layerStyle = {
      id: "state-boundary",
      type: "fill",
      source: "states",
      paint: {
        "fill-color": [
          "match",
          ["get", "NAME"],
          "Arizona",
          "#34934C",
          "#00bcee",
        ],
        "fill-opacity": 0.5,
      },
      filter: ["==", "$type", "Polygon"],
    };
    return (
      <Fragment>
        <Source id="states" type="geojson" data={states}>
          <Layer {...layerStyle} />
        </Source>
        {cities.features.map((o) => {
          const [long, lat] = o.geometry.coordinates;
          const { city, intervention } = o.properties;
          return (
            <Fragment key={city}>
              <Marker
                longitude={long}
                latitude={lat}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setShowPopup({ long, lat, city, intervention });
                }}
              >
                <FaMapMarkerAlt size={20} color="#cc7d12" />
              </Marker>
            </Fragment>
          );
        })}
      </Fragment>
    );
  };
  const renderSiteLayers = (routeData) => {
    return Object.entries(RouteMapData).map(([k, v]) => {
      if (k === NORTH_AMERICA) return;
      const routeLayer = {
        id: `${k}-route`,
        type: "line",
        paint: {
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step
          "line-width": 5,
          "line-color": generateRouteColor(routeData),
        },
      };
      const { tileset_src, tileset_layer_name } = v;
      return (
        <Fragment key={k}>
          <Source type="vector" url={`mapbox://${tileset_src}`}>
            <Layer source-layer={tileset_layer_name} {...routeLayer} />
          </Source>
        </Fragment>
      );
    });
  };

  const mapStyle = "mapbox://styles/sdi-mapbox/ckljmydtx12aj17p7nwxws7ct";
  return (
    <div ref={wrapperRef} style={{ height: "100%" }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        ref={mapRef}
      >
        <NavigationControl position="top-left" />
        {showPopUp && (
          <Popup
            longitude={showPopUp.long}
            latitude={showPopUp.lat}
            anchor="top"
            onClose={() => setShowPopup(false)}
          >
            <p>{showPopUp.city}</p>
            <p>{showPopUp.intervention}</p>
          </Popup>
        )}
        {selectedSite === NORTH_AMERICA && renderNALayer()}
        {routeData && renderSiteLayers(routeData)}
      </Map>
    </div>
  );
}
