import Intro from "../components/Intro";
import Story from "../components/Story";
import Dashboard from "../components/Dashboard";
import { Fragment } from "react";
import Nav from "../components/Nav";
export default function Home() {
  return (
    <Fragment>
      <Nav />
      <Intro />
      <Story />
      <Dashboard />
    </Fragment>
  );
}
