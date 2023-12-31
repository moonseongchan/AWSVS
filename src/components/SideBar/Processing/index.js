import React, { useEffect, useState } from "react";

import { FaSignal } from "react-icons/fa";
import { FaRegImage } from "react-icons/fa6";
import { FaRegChartBar } from "react-icons/fa6";
import { FaObjectUngroup } from "react-icons/fa6";
import "./Processing.scss";

const Processing = (props) => {
  // Process에서 설정할 Factors
  const [processInfo, setProcessInfo] = useState({});
  const filteredSlots = props.slots.filter(
    (slot) => slot.id !== props.currentSlotId
  );

  useEffect(() => {
    // console.log("Loaded", props.currentSlotId, props.info);
    setProcessInfo(props.info);

    const applySD = document.getElementById("applySD");
    const window = document.getElementById("window");
    const degreeOfPolynomial = document.getElementById("degreeOfPolynomial");
    const applySTFT = document.getElementById("applySTFT");
    const applyCWT = document.getElementById("applyCWT");
    const wavelet = document.getElementById("wavelet");
    const scale = document.getElementById("scale");
    const compare = document.getElementById("compare");
    const target = document.getElementById("target");
    const xFeature = document.getElementById("xFeature");
    const yFeature = document.getElementById("yFeature");

    if (props.currentSlotId !== -1) {
      // 가져온 값들로 설정 값들 갱신
      applySD.checked = props.info.applySD;
      window.value = props.info.window;
      degreeOfPolynomial.value = props.info.degreeOfPolynomial;
      applyCWT.checked = props.info.applyCWT;
      wavelet.value = props.info.wavelet;
      scale.value = props.info.scale;
      applySTFT.checked = props.info.applySTFT;
      compare.checked = props.info.compare;
      target.value = props.info.target;
      xFeature.value = props.info.xFeature;
      yFeature.value = props.info.yFeature;
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
      id === "applySD" ||
      id === "applyCWT" ||
      id === "applySTFT" ||
      id === "compare"
    ) {
      // Switch 버튼 고려
      value = document.getElementById(id).checked;
    } else if (!isNaN(value)) {
      // 숫자 입력 고려
      value = parseFloat(value);
    }

    // For Window > Degree of Polynomial Constraint
    if (id === "degreeOfPolynomial" && value >= processInfo.window) {
      value = processInfo.window - 1;
    }
    if (id === "window" && value % 2 === 0) {
      value -= 1;
    }

    let newProcessInfo = {
      ...processInfo,
      [id]: value,
    };

    // CWT나 STFT 중 하나만 On되게끔 구현
    if (id === "applySTFT") {
      const applyCWT = document.getElementById("applyCWT");
      applyCWT.checked = false;
      newProcessInfo = {
        ...newProcessInfo,
        applyCWT: false,
      };
    } else if (id === "applyCWT") {
      const applySTFT = document.getElementById("applySTFT");
      applySTFT.checked = false;
      newProcessInfo = {
        ...newProcessInfo,
        applySTFT: false,
      };
    }

    setProcessInfo(newProcessInfo);
    // console.log(newProcessInfo);
    props.getUpdatedData("processing", newProcessInfo);
  };

  let dbUpdateData = debounce(updateData, 200);

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
          <h2 class="accordion-header" id="sd-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#sd-collapse"
              aria-expanded="false"
              aria-controls="sd-collapse"
            >
              <FaSignal class="processing-accordion-icon" />{" "}
              <span class="accordion-label">Signal Denoising</span>
            </button>
          </h2>
          <div id="sd-collapse" class="accordion-collapse collapse">
            <div class="accordion-body ">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Apply Denoising
                </div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="applySD"
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
                    min={
                      (processInfo.degreeOfPolynomial + 1) % 2 === 0
                        ? processInfo.degreeOfPolynomial + 2
                        : processInfo.degreeOfPolynomial + 1
                    }
                    max="31"
                    step="2"
                    defaultValue="15"
                    class="form-range"
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
                    min="1"
                    max="16"
                    step="1"
                    defaultValue="8"
                    class="form-range"
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
          <h2 class="accordion-header" id="cwt-filter-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#cwt-filter-collapse"
              aria-expanded="false"
              aria-controls="cwt-filter-collapse"
            >
              <FaRegImage class="processing-accordion-icon" />{" "}
              <span class="accordion-label">CWT</span>
            </button>
          </h2>
          {/* id와 위에 아코디언 버튼 aria-controls와 동일해야 함 */}
          <div id="cwt-filter-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Apply CWT</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
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
                <div class="col-md-4 justify-content-start">Scale</div>
                <div class="col-md-8 d-flex justify-content-end align-items-center">
                  {/* Range */}
                  <input
                    type="range"
                    id="scale"
                    min="2"
                    max="64"
                    step="2"
                    defaultValue="32"
                    class="form-range"
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
          <h2 class="accordion-header" id="stft-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#stft-collapse"
              aria-expanded="false"
              aria-controls="stft-collapse"
            >
              <FaRegChartBar class="processing-accordion-icon" />{" "}
              <span class="accordion-label">STFT</span>
            </button>
          </h2>
          <div id="stft-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Apply STFT</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
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

        {/* Comparison */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="comparison-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#comparison-collapse"
              aria-expanded="false"
              aria-controls="comparison-collapse"
            >
              <FaObjectUngroup class="processing-accordion-icon" />{" "}
              <span class="accordion-label">Comparison</span>
            </button>
          </h2>
          <div id="comparison-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Compare</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="compare"
                    onChange={(event) => dbUpdateData(event)}
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Target</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="target"
                    class="form-select form-select-sm legend-box"
                    onChange={(event) => dbUpdateData(event)}
                  >
                    {filteredSlots.map((slot) => (
                      <option value={slot.id}>Slot {slot.id}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">X Feature</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="xFeature"
                    class="form-select form-select-sm legend-box"
                    onChange={(event) => dbUpdateData(event)}
                  >
                    <option value="NoP">Number of Peaks</option>
                    <option value="EoS">Energy of Signal</option>
                    <option value="MPoS">Max Power of Signal</option>
                    <option value="MPIoS">Max Power Index of Signal</option>
                  </select>
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Y Feature</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="yFeature"
                    class="form-select form-select-sm legend-box"
                    onChange={(event) => dbUpdateData(event)}
                  >
                    <option value="NoP">Number of Peaks</option>
                    <option value="EoS">Energy of Signal</option>
                    <option value="MPoS">Max Power of Signal</option>
                    <option value="MPIoS">Max Power Index of Signal</option>
                  </select>
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
