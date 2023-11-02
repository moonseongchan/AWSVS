import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [slots, setSlots] = useState([]);

  const getSlots = (input) => {
    setSlots(input);
  };

  return (
    <div class="container-fluid h-100">
      <Header />
      <div id="content" class="row">
        <Dashboard getSlots={getSlots} />
        <SideBar slots={slots} />
      </div>
    </div>
  );
}
