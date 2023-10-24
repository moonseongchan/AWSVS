import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div class="container-fluid h-100">
      <Header />
      <div id="content" class="row">
        <Dashboard />
        <SideBar />
      </div>
    </div>
  );
}
