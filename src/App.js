import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div class="container-fluid">
      <Header />
      <div class="row">
        <Dashboard />
        <SideBar />
      </div>
    </div>
  );
}
