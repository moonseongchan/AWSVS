import React from "react";

import { AiOutlineWifi } from "react-icons/ai";
import { HiSignal } from "react-icons/hi2";
import "./Import.scss";

const Import = (props) => {
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
      <input type="file" name="file" id="wifi-file" />

      <label for="uwb-file" id="uwb-btn">
        <div class="btn-icon-box">
          <HiSignal class="btn-icon" />
        </div>
        UWB
      </label>
      <input type="file" name="file" id="uwb-file" />
    </div>
  );
};

export default Import;
