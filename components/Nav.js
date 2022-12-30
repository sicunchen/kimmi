import Link from "next/link";
import styles from "./Nav.module.css";
import Logo from "../public/MayMobilityLogoWhite.svg";
import Image from "next/image";
import { IoMenu, IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useScroll, motion } from "framer-motion";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  const update = () => {
    if (scrollY.current > scrollY.prev) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  };
  useEffect(() => {
    return scrollY.onChange(update);
  }, []);

  const variants = {
    visible: { opacity: 1, y: 0 },
    initial: { opacity: 0, y: -85 },
    hidden: { opacity: 0, y: -25 },
  };
  return (
    <motion.nav
      variants={variants}
      className={styles.nav}
      initial="initial"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.navContent}>
        <Link href="https://maymobility.com/">
          <Image src={Logo} alt="logo" />
        </Link>
        <div className={styles.menuBtn} onClick={toggle}>
          {isOpen ? <IoClose /> : <IoMenu />}
        </div>

        <div className={`${styles.navMenu} ${isOpen ? styles.isOpen : ""}`}>
          <div
            className={styles.navLink}
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <Link href="#autonomy-definition" scroll={false}>
              Autonomy Definition
            </Link>
          </div>
          <div
            className={styles.navLink}
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <Link href="#dashboard" scroll={false}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
