import { Fragment, useEffect, useState } from "react";
import RouteMap from "./RouteMap";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import AutonomyMetricsWithBrush from "./AutonomyMetricsWithBrush";
import { NORTH_AMERICA, SITE_BUTTONS, SUN_CITY } from "../constants/sites";
import { LIGHT_STYLE } from "../constants/mapStyle";
import useDailyChartData from "../hooks/useDailyChartData";
import {
  COMMERCIAL,
  DRIVER_OUT_READY,
  SHIFT_BUTTONS,
} from "../constants/shiftCategories";
import {
  EXCLUDE_INTERVENTIONS_BUTTONS,
  INTERVENTIONS_PARKING_LOT,
  INTERVENTIONS_TOTAL,
  INTERVENTION_BUTTONS,
  INTERVENTION_MANUALZONE,
  INTERVENTION_PASSENGERSTOPS,
} from "../constants/interventionCategories";
import { SITE_FILTER, SHIFT_FILTER } from "../constants/filters";
import AutomonyMetricsWithBrush from "./AutonomyMetricsWithBrush";
import { AUTONOMY_PCT, KMPI, METRICS_BUTTONS } from "../constants/metrics";
import styles from "./Dashboard.module.css";
import { IoFilter } from "react-icons/io5";
import SectionContainer from "./SectionContainer";
import DashboardMenu from "./DashboardMenu";
import { AnimatePresence, motion } from "framer-motion";

const FilterButton = ({ handleShowFilter }) => {
  return (
    <button className={styles.filterButton} onClick={handleShowFilter}>
      Show Filters
      <IoFilter size={"30px"} />
    </button>
  );
};
const Header = () => {
  return <header className={styles.header}>Autonomy Dashboard</header>;
};

export default function Dashboard() {
  const [selectedSite, setSite] = useState(NORTH_AMERICA);
  const [selectedStyle, setStyle] = useState(LIGHT_STYLE);
  const [selectedShift, setShift] = useState(COMMERCIAL);
  const [activeFilter, setActiveFilter] = useState(SHIFT_FILTER);
  const [interventionType, setInterventionType] = useState(INTERVENTIONS_TOTAL);
  const [selectedMetric, setSelectedMetric] = useState(KMPI);
  const [checkedExclusions, setCheckedExclusions] = useState({
    [INTERVENTION_MANUALZONE]: false,
    [INTERVENTION_PASSENGERSTOPS]: false,
    [INTERVENTIONS_PARKING_LOT]: false,
  });

  useEffect(() => {
    //when rare or non-rare interventions is selected, unselect all the checkboxes
    if (interventionType !== INTERVENTIONS_TOTAL) {
      setCheckedExclusions({
        [INTERVENTION_MANUALZONE]: false,
        [INTERVENTION_PASSENGERSTOPS]: false,
        [INTERVENTIONS_PARKING_LOT]: false,
      });
    }
  }, [interventionType]);
  useEffect(() => {
    if (activeFilter === SHIFT_FILTER) {
      if (selectedShift === DRIVER_OUT_READY) {
        setSite(SUN_CITY);
      } else {
        setSite(NORTH_AMERICA);
      }
    } else {
      setSite(NORTH_AMERICA);
    }
  }, [activeFilter, selectedShift]);
  const [movingAverageWindow, setWindow] = useState(30);

  const { rawDailyAutonomyMetricsData } = useDailyChartData();
  const handleChangeStyle = (e) => {
    setStyle(e.target.value);
  };

  const handleChangeSite = (e) => {
    setSite(e.target.value);
  };
  const handleChangeShift = (e) => {
    setShift(e.target.value);
  };
  const handleChangeFilter = (e) => {
    setActiveFilter(e.target.value);
  };
  const handleChangeInterventionType = (e) => {
    setInterventionType(e.target.value);
  };
  const handleChangeMetric = (e) => {
    setSelectedMetric(e.target.value);
  };

  const handleChangeExclusion = (e) => {
    setCheckedExclusions({
      ...checkedExclusions,
      [e.target.value]: e.target.checked,
    });
  };
  const handleChangeWindow = (e) => {
    setWindow(e.target.value);
  };

  const mapStyle =
    selectedStyle === LIGHT_STYLE
      ? "mapbox://styles/sdi-mapbox/ckljmydtx12aj17p7nwxws7ct"
      : "mapbox://styles/mapbox/satellite-v9";

  const Content = ({ isMobile }) => {
    const [isOpen, setIsMenuOpen] = useState(false);
    const handleShowFilter = () => {
      console.log(isOpen);
      setIsMenuOpen(!isOpen);
    };
    const spring = {
      type: "spring",
      stiffness: 700,
      damping: 30,
    };
    const mobileVariants = {
      hidden: { x: "-100%", opacity: 0 },
      visible: { x: "0", opacity: 1 },
    };
    return (
      <div className={styles.mainContainer}>
        <div
          className={`${styles.dashboardContent} ${
            isOpen ? styles.isOpen : ""
          }`}
        >
          <Header />
          {isMobile ? (
            <motion.div
              className={styles.sideBar}
              variants={mobileVariants}
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
              transition={spring}
            >
              <DashboardMenu isOpen={isOpen} setIsMenuOpen={setIsMenuOpen} />
            </motion.div>
          ) : (
            <motion.div layout className={styles.sideBar} transition={spring}>
              <DashboardMenu isOpen={isOpen} setIsMenuOpen={setIsMenuOpen} />
            </motion.div>
          )}

          <motion.div
            layout
            className={styles.summaryAndFilterButton}
            transition={spring}
          >
            <div className={styles.summary}>Summary metrics</div>
            <FilterButton handleShowFilter={handleShowFilter} />
          </motion.div>
          <motion.div
            layout
            className={styles.barChartContainer}
            transition={spring}
          >
            bar chart
          </motion.div>
          <motion.div
            layout
            className={styles.mapContainer}
            transition={spring}
          >
            map
          </motion.div>
        </div>
      </div>
    );
  };
  return (
    <SectionContainer id="dashboard" className={styles.dashboardSection}>
      <Content />
    </SectionContainer>
  );
}
