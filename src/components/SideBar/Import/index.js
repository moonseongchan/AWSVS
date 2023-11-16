import React, { useState } from "react";
import axios from "axios";

import { AiOutlineWifi } from "react-icons/ai";
import { HiSignal } from "react-icons/hi2";
import "./Import.scss";

axios.defaults.withCredentials = true;

axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const Import = (props) => {
  // 임시 - 아직 Wi-Fi CSI까지 할지는 의문임
  const handleWiFiFile = async (event) => {
    if (props.currentSlotId !== -1) {
      const formData = new FormData();
      formData.append("file", event.target.files[0]);

      try {
        const response = await axios.post(
          "http://localhost:5000/upload",
          formData,
          { withCredentials: true }
        );
        // console.log(response.data.result);
        props.getUpdatedData("data", response.data.result);
      } catch (error) {
        console.error("Error Uploading File:", error);
      }
    } else {
      alert("Please Select Specific Slot");
    }
  };

  const handleUWBFile = async (event) => {
    if (props.currentSlotId !== -1) {
      const formData = new FormData();
      formData.append("file", event.target.files[0]);

      try {
        const response = await axios.post(
          "http://localhost:5000/upload",
          formData,
          { withCredentials: true }
        );
        // console.log(response.data.result);
        props.getUpdatedData("data", response.data.result);
      } catch (error) {
        console.error("Error Uploading File:", error);
      }
    } else {
      alert("Please Select Specific Slot");
    }
  };

  return (
    <div
      class="tab-pane fade show active"
      id="pills-import-data"
      role="tabpanel"
      tabindex="0"
    >
      <div class="comments mb-3">Import input data for visualization</div>
      <label for="wifi-file" id="wifi-btn">
        <div class="btn-icon-box">
          <AiOutlineWifi class="btn-icon" />
        </div>
        Wi-Fi CSI
      </label>
      <input
        type="file"
        name="file"
        id="wifi-file"
        accept="text/csv"
        onChange={handleWiFiFile.bind(this)}
      />

      <label for="uwb-file" id="uwb-btn">
        <div class="btn-icon-box">
          <HiSignal class="btn-icon" />
        </div>
        UWB
      </label>
      <input
        type="file"
        name="file"
        id="uwb-file"
        accept="text/csv"
        onChange={handleUWBFile.bind(this)}
      />
    </div>
  );
};

export default Import;
