import "mapbox-gl/dist/mapbox-gl.css";
import { Poppins } from "@next/font/google";
import "../styles/reset.css";
import "../styles/variables.css";
const poppins = Poppins({
  subsets: "latin",
  weight: ["400", "500", "600", "700"],
});

function MyApp({ Component, pageProps }) {
  return (
    <main className={poppins.className}>
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;
