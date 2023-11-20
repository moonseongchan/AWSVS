import React, { useEffect, useState } from "react";

import { GoGraph } from "react-icons/go";
import { FaArrowsUpDownLeftRight } from "react-icons/fa6";
import { FaChartLine } from "react-icons/fa6";
import { FaPalette } from "react-icons/fa6";
import { FiList } from "react-icons/fi";
import { FaCropSimple } from "react-icons/fa6";
import "./Setting.scss";

const Setting = (props) => {
  // Setting에서 설정할 Factors
  const [optionsInfo, setOptionsInfo] = useState({});

  useEffect(() => {
    // console.log("Loaded", props.currentSlotId, props.info);
    setOptionsInfo(props.info);

    const logScale = document.getElementById("logScale");
    const logBase = document.getElementById("logBase");
    const showGrid = document.getElementById("showGrid");
    const spectrogramColor = document.getElementById("spectrogramColor");
    const stftColor = document.getElementById("stftColor");
    const zooming = document.getElementById("zooming");
    const guideLine = document.getElementById("guideLine");

    if (props.currentSlotId !== -1) {
      // 가져온 값들로 설정 값들 갱신
      logScale.checked = props.info.logScale;
      logBase.value = props.info.logBase;

      showGrid.checked = props.info.showGrid;
      spectrogramColor.value = props.info.spectrogramColor;
      stftColor.value = props.info.stftColor;

      zooming.checked = props.info.zooming;
      guideLine.checked = props.info.guideLine;
    }
  }, [props.info]);

  // To avoid Re-Rendering
  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const updateData = (event) => {
    event.persist();
    const id = event.target.id;
    let value = event.target.value;
    if (
      id === "logScale" ||
      id === "showGrid" ||
      id === "zooming" ||
      id === "guideLine"
    ) {
      // Switch 버튼 고려
      value = document.getElementById(id).checked;
    } else if (!isNaN(value)) {
      // 숫자 입력 고려
      value = parseFloat(value);
    }

    // Handle User Error
    if (id === "logBase" && isNaN(value)) {
      value = 2;
    }

    const newOptionsInfo = {
      ...optionsInfo,
      [id]: value,
    };
    setOptionsInfo(newOptionsInfo);
    props.getUpdatedData("options", newOptionsInfo);
  };

  let dbUpdateData = debounce(updateData, 100);

  return (
    <div class="tab-pane fade" id="pills-setting" role="tabpanel" tabindex="0">
      <div class="accordion mt-2">
        {/* Axis */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="axis-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#axis-collapse"
              aria-expanded="false"
              aria-controls="axis-collapse"
            >
              <FaArrowsUpDownLeftRight class="setting-accordion-icon" />{" "}
              <span class="accordion-label">Axis</span>
            </button>
          </h2>
          <div id="axis-collapse" class="accordion-collapse collapse">
            <div class="accordion-body ">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Log Scale</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="logScale"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Log Base</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    id="logBase"
                    class="form-control form-control-sm text-input"
                    placeholder="2"
                    aria-label="log-base"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="legend-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#graph-collapse"
              aria-expanded="false"
              aria-controls="graph-collapse"
            >
              <FaChartLine class="setting-accordion-icon" />{" "}
              <span class="accordion-label">Graph</span>
            </button>
          </h2>
          <div id="graph-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Show Grid</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="showGrid"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Map */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="legend-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#colormap-collapse"
              aria-expanded="false"
              aria-controls="colormap-collapse"
            >
              <FaPalette class="setting-accordion-icon" />{" "}
              <span class="accordion-label">Color Map</span>
            </button>
          </h2>
          <div id="colormap-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Spectrogram Color
                </div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="spectrogramColor"
                    class="form-select form-select-sm legend-box"
                    onChange={(event) => dbUpdateData(event)}
                  >
                    <option value="Viridis">Viridis</option>
                    <option value="Cividis">Cividis</option>
                    <option value="Plasma">Plasma</option>
                    <option value="Turbo">Turbo</option>
                    <option value="Inferno">Inferno</option>
                    <option value="CubehelixDefault">CubehelixDefault</option>
                  </select>
                </div>
              </div>

              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">STFT Color</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="stftColor"
                    class="form-select form-select-sm legend-box"
                    onChange={(event) => dbUpdateData(event)}
                  >
                    <option value="Viridis">Viridis</option>
                    <option value="Cividis">Cividis</option>
                    <option value="Plasma">Plasma</option>
                    <option value="Turbo">Turbo</option>
                    <option value="Inferno">Inferno</option>
                    <option value="CubehelixDefault">CubehelixDefault</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactions */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="values-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#values-collapse"
              aria-expanded="false"
              aria-controls="values-collapse"
            >
              <FaCropSimple
                class="setting-accordion-icon"
                style={{ marginTop: "0.05rem !important" }}
              />{" "}
              <span class="accordion-label">Interaction</span>
            </button>
          </h2>
          <div id="values-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Zooming</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="zooming"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Guide Line</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="guideLine"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
