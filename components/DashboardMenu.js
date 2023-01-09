import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { SHIFT_FILTER, SITE_FILTER } from "../constants/filters";
import {
  DateRangeFilter,
  ExcludeInterventionsFilters,
  InterventionFilters,
  MainFilter,
  MetricFilters,
  MovingWindowSlider,
  ShiftFilters,
  SiteFilters,
} from "./DashboardFilters";
import styles from "./DashboardMenu.module.css";
import { useFilter } from "./DashboardReducer";

const FilterSection = ({ title, input }) => {
  return (
    <div className={styles.filterSection}>
      <h4 className={styles.filterTitle}>{title}</h4>
      {input}
    </div>
  );
};

export default function DashboardMenu({ isOpen, setIsMenuOpen }) {
  const variants = {
    hidden: { visibility: "hidden" },
    visible: { visibility: "visible" },
  };
  const toggle = () => {
    setIsMenuOpen(false);
  };
  const { state } = useFilter();
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      className={styles.filters}
    >
      <header className={styles.filterHeader}>
        <h1>Filter by</h1>
        <div className={styles.closeBtn} onClick={toggle}>
          <IoClose />
        </div>
      </header>
      <FilterSection title={"Date Range"} input={<DateRangeFilter />} />
      <FilterSection title={"Category"} input={<MainFilter />} />
      {state.activeFilter === SITE_FILTER ? (
        <FilterSection title={"Site"} input={<SiteFilters />} />
      ) : (
        <FilterSection title={"Shift"} input={<ShiftFilters />} />
      )}
      <FilterSection title={"Metric"} input={<MetricFilters />} />
      <FilterSection
        title={"Intervention Category"}
        input={<InterventionFilters />}
      />
      <FilterSection
        title={"Exclude from Total Interventions"}
        input={<ExcludeInterventionsFilters />}
      />
      <FilterSection
        title={"Moving Average Window (2 to 100)"}
        input={<MovingWindowSlider />}
      />
    </motion.div>
  );
}
