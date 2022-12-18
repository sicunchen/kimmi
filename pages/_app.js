import "../styles/custom.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect } from "react";
function MyApp({ Component, pageProps }) {
  // useEffect(() => {
  //   import("bootstrap/dist/js/bootstrap");
  // }, []);
  return <Component {...pageProps} />;
}

export default MyApp;
