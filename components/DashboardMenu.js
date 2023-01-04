import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import styles from "./DashboardMenu.module.css";
export default function DashboardMenu({ isOpen, setIsMenuOpen }) {
  const variants = {
    hidden: { visibility: "hidden" },
    visible: { visibility: "visible" },
  };
  const toggle = () => {
    setIsMenuOpen(false);
  };
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
    </motion.div>
  );
}
