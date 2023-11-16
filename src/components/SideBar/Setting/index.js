import React, { useEffect, useState } from "react";

import { GoGraph } from "react-icons/go";
import { FaArrowsUpDownLeftRight } from "react-icons/fa6";
import { FaChartLine } from "react-icons/fa6";
import { FiList } from "react-icons/fi";
import { FaCropSimple } from "react-icons/fa6";
import "./Setting.scss";

const Setting = (props) => {
  // Setting에서 설정할 Factors
  const [optionsInfo, setOptionsInfo] = useState({});

  useEffect(() => {
    // console.log("Loaded", props.currentSlotId, props.info);
    setOptionsInfo(props.info);

    const axisX = document.getElementById("axisX");
    const axisY = document.getElementById("axisY");
    const showSpectrogram = document.getElementById("showSpectrogram");
    const zooming = document.getElementById("zooming");
    const guideLine = document.getElementById("guideLine");
    const brushForStatistics = document.getElementById("brushForStatistics");
    const brushColor = document.getElementById("brushColor");

    if (props.currentSlotId !== -1) {
      // 가져온 값들로 설정 값들 갱신
      axisX.value = props.info.axisX;
      axisY.value = props.info.axisY;

      showSpectrogram.checked = props.info.showSpectrogram;
      zooming.checked = props.info.zooming;
      guideLine.checked = props.info.guideLine;
      brushForStatistics.checked = props.info.brushForStatistics;

      // TODO
      // brushColor.value = props.info.brushColor;
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
      id === "showSpectrogram" ||
      id === "zooming" ||
      id === "guideLine" ||
      id === "brushForStatistics"
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
              <FaArrowsUpDownLeftRight class="setting-accordion-icon" />{" "}
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

        {/* Graph */}
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
              <FaChartLine class="setting-accordion-icon" />{" "}
              <span class="accordion-label">Graph</span>
            </button>
          </h2>
          <div id="legend-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Show Spectrogram
                </div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="showSpectrogram"
                    onChange={(event) => dbUpdateData(event)}
                  />
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
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Brush (for Statistics)
                </div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="brushForStatistics"
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
