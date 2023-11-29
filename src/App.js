import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Dashboard from "./components/Dashboard";

export default function App() {
  // Entire Information in slots
  const [slots, setSlots] = useState([]);
  const [idx, setIdx] = useState(0);

  const getUpdatedSlots = (value) => {
    // console.log("[ App.js ]", value);
    setSlots(value);
  };

  const createSlot = () => {
    // 초기 Slot 정보
    const newSlot = {
      id: idx + 1,
      // Raw Data
      data: [],
      // Slot Dashboard에 시각화 할 Data
      plot: [],
      // STFT 처리한 Data
      stft: [],
      // Signal Denoising 처리한 Data (for Comparison)
      sd: [],
      // CWT 처리한 Data (for Comparison)
      cwt: [],
      // Processing
      processing: {
        applySD: false,
        // Window has to be odd number
        window: 19,
        // Window > Degree of Polynomial
        degreeOfPolynomial: 8,
        applySTFT: false,
        applyCWT: false,
        wavelet: "cgau1",
        scale: 32,
        // For Comparison
        compare: false,
        target: null,
        // TO-DO (기본값 변경)
        xFeature: "NoP",
        yFeature: "EoS",
      },
      // Setting
      options: {
        logScale: false,
        logBase: 2,
        showGrid: false,
        showSpectrogram: false,
        spectrogramColor: "Viridis",
        zooming: false,
        lineAnalysis: false,
        thresholdLine: false,
      },
      zoomDomain: [],
    };
    setIdx(idx + 1);
    setSlots([...slots, newSlot]);
  };

  const removeSlot = (slotId) => {
    const isTarget = slots.find((slot) => slot.processing.target === slotId);
    // console.log(isTarget);
    if (isTarget === undefined) {
      const updatedSlots = slots.filter((slot) => slot.id !== slotId);
      setSlots(updatedSlots);
    } else {
      alert(
        "This slot is currently assigned to target in another slot, So cannot be deleted."
      );
    }
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
