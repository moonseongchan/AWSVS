import React, { useEffect, useState } from "react";

import { GoGraph } from "react-icons/go";
import { FiList } from "react-icons/fi";
import { FiSave } from "react-icons/fi";
import "./Setting.scss";

const Setting = (props) => {
  // Setting에서 설정할 Factors
  const [optionsInfo, setOptionsInfo] = useState({});

  useEffect(() => {
    // console.log("Loaded", props.currentSlotId, props.info);
    setOptionsInfo(props.info);

    const axisX = document.getElementById("axisX");
    const axisY = document.getElementById("axisY");
    const showLegend = document.getElementById("showLegend");
    const legendPosition = document.getElementById("legendPosition");
    const legendAlign = document.getElementById("legendAlign");
    const showValues = document.getElementById("showValues");
    const showCaptions = document.getElementById("showCaptions");
    const showGrid = document.getElementById("showGrid");

    if (props.currentSlotId !== -1) {
      // 가져온 값들로 설정 값들 갱신
      axisX.value = props.info.axisX;
      axisY.value = props.info.axisY;

      showLegend.checked = props.info.showLegend;
      legendPosition.value = props.info.legendPosition;
      legendAlign.value = props.info.legendAlign;

      showValues.checked = props.info.showValues;
      showCaptions.checked = props.info.showCaptions;
      showGrid.checked = props.info.showGrid;
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
      id === "showLegend" ||
      id === "showValues" ||
      id === "showCaptions" ||
      id === "showGrid"
    ) {
      // Switch 버튼 고려
      value = document.getElementById(id).checked;
    } else if (!isNaN(value)) {
      // 숫자 입력 고려
      value = parseFloat(value);
    }
    const newOptionsInfo = {
      ...optionsInfo,
      [id]: value,
    };
    setOptionsInfo(newOptionsInfo);
    props.getUpdatedData("options", newOptionsInfo);
  };

  let dbUpdateData = debounce(updateData, 250);

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
              <GoGraph class="accordion-icon" />{" "}
              <span class="accordion-label">Axis</span>
            </button>
          </h2>
          <div id="axis-collapse" class="accordion-collapse collapse">
            <div class="accordion-body ">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Axis X</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    id="axisX"
                    class="form-control form-control-sm text-input"
                    placeholder="Default"
                    aria-label="axis-x"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Axis Y</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    id="axisY"
                    class="form-control form-control-sm text-input"
                    placeholder="Default"
                    aria-label="axis-y"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="legend-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#legend-collapse"
              aria-expanded="false"
              aria-controls="legend-collapse"
            >
              <FiList class="accordion-icon" />{" "}
              <span class="accordion-label">Legend</span>
            </button>
          </h2>
          <div id="legend-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Show Legend</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="showLegend"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Legend Position
                </div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="legendPosition"
                    class="form-select form-select-sm legend-box"
                    onChange={(event) => dbUpdateData(event)}
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Legend Align</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="legendAlign"
                    class="form-select form-select-sm legend-box"
                    onChange={(event) => dbUpdateData(event)}
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
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
              <FiSave class="accordion-icon" />{" "}
              <span class="accordion-label">Values</span>
            </button>
          </h2>
          <div id="values-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Show Values</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="showValues"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Show Captions (Hover)
                </div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="showCaptions"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default Setting;
