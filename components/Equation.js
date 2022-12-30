import { Fragment } from "react";
import { formatDecimal1 } from "../hooks/useDailyChartData";
import styles from "./Equation.module.css";

export default function Equation({ akNum, intNum }) {
  return (
    <div
      className={`${styles.equationContainer} ${
        intNum > 0 ? styles.showResult : ""
      }`}
    >
      <div className={styles.equationHeader}>km / I</div>
      <div className={styles.equateSign}>=</div>
      <div className={styles.ak}>autonomous kilometers</div>
      <div className={styles.int}># of interventions</div>
      <div className={styles.akNum}>{akNum}</div>
      <div className={styles.intNum}>{intNum}</div>
      {intNum > 0 && (
        <Fragment>
          <div className={styles.resultEquateSign}>=</div>
          <div className={styles.result}>{formatDecimal1(akNum / intNum)}</div>
        </Fragment>
      )}
    </div>
  );
}
