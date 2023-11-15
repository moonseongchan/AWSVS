import React, { useEffect, useState } from "react";

import { AiOutlineDatabase } from "react-icons/ai";
import { FaSignal } from "react-icons/fa";
import { FaRegImage } from "react-icons/fa6";
import { MdNumbers } from "react-icons/md";
import { LuFilter } from "react-icons/lu";
import { FaRegChartBar  } from "react-icons/fa6";
import "./Processing.scss";

const Processing = (props) => {
  // Process에서 설정할 Factors
  const [processInfo, setProcessInfo] = useState({});

  useEffect(() => {
    // console.log("Loaded", props.currentSlotId, props.info);
    setProcessInfo(props.info);

    const applySignalDenoising = document.getElementById(
      "applySignalDenoising"
    );
    const window = document.getElementById("window");
    const degreeOfPolynomial = document.getElementById("degreeOfPolynomial");
    const applySTFT = document.getElementById("applySTFT");
    const applyCWT = document.getElementById("applyCWT");
    const wavelet = document.getElementById("wavelet");
    const scale = document.getElementById("scale");

    if (props.currentSlotId !== -1) {
      // 가져온 값들로 설정 값들 갱신
      applySignalDenoising.checked = props.info.applySignalDenoising;
      window.value = props.info.window;
      degreeOfPolynomial.value = props.info.degreeOfPolynomial;
      applySTFT.checked = props.info.applySTFT;
      applyCWT.checked = props.info.applyCWT;
      wavelet.value = props.info.wavelet;
      scale.value = props.info.scale;
    }

    // Show Range Slider Values
    const showWindow = document.getElementById("show-window");
    const showDegreeOfPolynomial = document.getElementById(
      "show-degree-of-polynomial"
    );
    const showScale = document.getElementById("show-scale");
    showWindow.innerHTML = window.value;
    window.addEventListener("change", (event) => {
      showWindow.innerHTML = event.target.value;
    });
    showDegreeOfPolynomial.innerHTML = degreeOfPolynomial.value;
    degreeOfPolynomial.addEventListener("change", (event) => {
      showDegreeOfPolynomial.innerHTML = event.target.value;
    });
    showScale.innerHTML = scale.value;
    scale.addEventListener("change", (event) => {
      showScale.innerHTML = event.target.value;
    });
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
      id === "applySignalDenoising" ||
      id === "applySTFT" ||
      id === "applyCWT"
    ) {
      // Switch 버튼 고려
      value = document.getElementById(id).checked;
    } else if (!isNaN(value)) {
      // 숫자 입력 고려
      value = parseFloat(value);
    }

    // For Window < Degree of Polynomial Constraint
    if (id === "window" && value >= processInfo.degreeOfPolynomial) {
      value = processInfo.degreeOfPolynomial - 1;
      // For Window is always Odd number
      if (value % 2 === 0) {
        value -= 1;
      }
    }

    const newProcessInfo = {
      ...processInfo,
      [id]: value,
    };
    setProcessInfo(newProcessInfo);
    console.log(newProcessInfo);
    props.getUpdatedData("processing", newProcessInfo);
  };

  let dbUpdateData = debounce(updateData, 250);

  return (
    <div
      class="tab-pane fade"
      id="pills-processing"
      role="tabpanel"
      tabindex="0"
    >
      <div class="accordion mt-2">
        {/* Signal Denoising */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="data-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#data-collapse"
              aria-expanded="false"
              aria-controls="data-collapse"
            >
              <FaSignal class="accordion-icon" />{" "}
              <span class="accordion-label">Signal Denoising</span>
            </button>
          </h2>
          <div id="data-collapse" class="accordion-collapse collapse">
            <div class="accordion-body ">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Apply Denoising
                </div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="process-events form-check-input"
                    type="checkbox"
                    role="switch"
                    id="applySignalDenoising"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Window</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  {/* Range */}
                  <input
                    type="range"
                    id="window"
                    min="1"
                    max="31"
                    step="2"
                    defaultValue="15"
                    class="process-events form-range"
                    onChange={(event) => dbUpdateData(event)}
                  />
                  <div class="show-range-value" id="show-window"></div>
                </div>
              </div>

              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Degree of Polynomial
                </div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  {/* Range */}
                  <input
                    type="range"
                    id="degreeOfPolynomial"
                    min={processInfo.window + 1}
                    max="31"
                    step="1"
                    defaultValue="16"
                    class="process-events form-range"
                    onChange={(event) => dbUpdateData(event)}
                  />
                  <div
                    class="show-range-value"
                    id="show-degree-of-polynomial"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CWT */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="hampel-filter-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#hampel-filter-collapse"
              aria-expanded="false"
              aria-controls="hampel-filter-collapse"
            >
              <FaRegImage class="accordion-icon"/>{" "}
              <span class="accordion-label">CWT</span>
            </button>
          </h2>
          {/* id와 위에 아코디언 버튼 aria-controls와 동일해야 함 */}
          <div id="hampel-filter-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Apply CWT</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="process-events form-check-input"
                    type="checkbox"
                    role="switch"
                    id="applyCWT"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Wavelet</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="wavelet"
                    class="form-select form-select-sm legend-box"
                    onChange={(event) => dbUpdateData(event)}
                  >
                    <option value="cgau1">cgau1</option>
                    <option value="cmor">cmor</option>
                    <option value="gaus1">gaus1</option>
                    <option value="mexh">mexh</option>
                    <option value="morl">morl</option>
                    <option value="shan">shan</option>
                  </select>
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Scale</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  {/* Range */}
                  <input
                    type="range"
                    id="scale"
                    min="2"
                    max="256"
                    step="2"
                    defaultValue="128"
                    class="process-events form-range"
                    onChange={(event) => dbUpdateData(event)}
                  />
                  <div class="show-range-value" id="show-scale"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STFT */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="parameter-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#parameter-collapse"
              aria-expanded="false"
              aria-controls="parameter-collapse"
            >
              <FaRegChartBar  class="accordion-icon" />{" "}
              <span class="accordion-label">STFT</span>
            </button>
          </h2>
          <div id="parameter-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Apply STFT</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="process-events form-check-input"
                    type="checkbox"
                    role="switch"
                    id="applySTFT"
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

export default Processing;
