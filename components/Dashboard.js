import { useState } from "react";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import styles from "./Dashboard.module.css";
import { IoFilter } from "react-icons/io5";
import SectionContainer from "./SectionContainer";
import DashboardMenu from "./DashboardMenu";
import { motion } from "framer-motion";
import { FilterProvider, useFilter } from "./DashboardReducer";
import useDailyChartData from "../hooks/useDailyChartData";
import BarchartContainer from "./BarChartContainer";
import SummaryMetrics from "./SummaryMetrics";
import Map from "./SiteMap";
import SiteMap from "./SiteMap";
import useRouteData from "../hooks/useRouteData";
const FilterButton = ({ handleShowFilter, isOpen }) => {
  return (
    <button className={styles.filterButton} onClick={handleShowFilter}>
      {!isOpen ? "Show Filters" : "Hide Filters"}
      <IoFilter size={"30px"} />
    </button>
  );
};
const Header = () => {
  return <header className={styles.header}>Autonomy Dashboard</header>;
};
const Content = ({ isMobile }) => {
  const [isOpen, setIsMenuOpen] = useState(false);
  const { rawDailyAutonomyMetricsData } = useDailyChartData();
  const { state } = useFilter();

  const handleShowFilter = () => {
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
        className={`${styles.dashboardContent} ${isOpen ? styles.isOpen : ""}`}
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
            <DashboardMenu
              isOpen={isOpen}
              setIsMenuOpen={setIsMenuOpen}
              isMobile={isMobile}
            />
          </motion.div>
        ) : (
          <motion.div layout className={styles.sideBar} transition={spring}>
            <DashboardMenu
              isOpen={isOpen}
              setIsMenuOpen={setIsMenuOpen}
              isMobile={isMobile}
            />
          </motion.div>
        )}

        <motion.div
          layout
          className={styles.summaryAndFilterButton}
          transition={spring}
        >
          <div className={styles.summary}>
            {rawDailyAutonomyMetricsData && (
              <SummaryMetrics rawData={rawDailyAutonomyMetricsData} />
            )}
          </div>
          <FilterButton handleShowFilter={handleShowFilter} isOpen={isOpen} />
        </motion.div>
        <motion.div
          layout
          className={styles.barChartContainer}
          transition={spring}
        >
          {rawDailyAutonomyMetricsData && (
            <ParentSize>
              {({ width, height }) => {
                //https://github.com/airbnb/visx/issues/577
                if (width < 10) return null;
                return (
                  <BarchartContainer
                    rawData={rawDailyAutonomyMetricsData}
                    width={width}
                    height={height}
                  />
                );
              }}
            </ParentSize>
          )}
        </motion.div>
        <motion.div layout className={styles.mapContainer} transition={spring}>
          <SiteMap />
        </motion.div>
      </div>
    </div>
  );
};
export default function Dashboard() {
  return (
    <FilterProvider>
      <SectionContainer id="dashboard" className={styles.dashboardSection}>
        <Content />
      </SectionContainer>
    </FilterProvider>
  );
}
