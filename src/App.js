import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Dashboard from "./components/Dashboard";

export default function App() {
  // Entire Information in slots
  const [slots, setSlots] = useState([]);
  const [idx, setIdx] = useState(0);

  const getUpdatedSlots = (value) => {
    console.log(value);
    setSlots(value);
  };

  const createSlot = () => {
    // 초기 Slot 정보
    const newSlot = {
      id: idx + 1,
      // 원본 Data
      data: [],
      processing: {
        applySignalDenoising: false,
        // Window has to be odd number
        window: 19,
        // Window > Degree of Polynomial
        degreeOfPolynomial: 8,
        applySTFT: false,
        applyCWT: false,
        wavelet: "cgau1",
        scale: 32,
      },
      options: {
        logScale: false,
        logBase: 2,
        showGrid: false,
        spectrogramColor: "Viridis",
        stftColor: "Viridis",
        zooming: false,
        guideLine: false,
      },
      // Dashboard에 시각화 할 Data
      plot: [],
    };
    setIdx(idx + 1);
    setSlots([...slots, newSlot]);
  };

  const removeSlot = (slotId) => {
    const updatedSlots = slots.filter((slot) => slot.id !== slotId);
    setSlots(updatedSlots);
  };

  return (
    <div class="container-fluid h-100">
      <Header />
      <div id="content" class="row">
        <Dashboard
          slots={slots}
          createSlot={createSlot}
          removeSlot={removeSlot}
        />
        <SideBar slots={slots} getUpdatedSlots={getUpdatedSlots} />
      </div>
    </div>
  );
}
