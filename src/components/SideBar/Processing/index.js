import React, { useEffect } from "react";

import { AiOutlineDatabase } from "react-icons/ai";
import { MdNumbers } from "react-icons/md";
import { LuFilter } from "react-icons/lu";
import "./Processing.scss";

const Processing = (props) => {
  useEffect(() => {
    // Show Range Slider Values
    const showKalmanAlpha = document.getElementById("show-kalman-alpha");
    const kalmanAlpha = document.getElementById("kalman-alpha");
    showKalmanAlpha.innerHTML = kalmanAlpha.value;
    kalmanAlpha.addEventListener("change", (event) => {
      showKalmanAlpha.innerHTML = event.target.value;
    });
  }, []);

  return (
    <div
      class="tab-pane fade"
      id="pills-processing"
      role="tabpanel"
      tabindex="0"
    >
      <div class="accordion mt-2">
        {/* Temporary Settings */}
        {/* Data */}
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
              <AiOutlineDatabase class="accordion-icon" />{" "}
              <span class="accordion-label">Data</span>
            </button>
          </h2>
          <div id="data-collapse" class="accordion-collapse collapse">
            <div class="accordion-body ">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Subcarrier Counts
                </div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="30"
                    aria-label="subcarrier"
                  />
                </div>
              </div>

              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Frequency</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="200"
                    aria-label="frequency"
                  />
                </div>
              </div>

              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-12 d-flex justify-content-end aligh-items-center">
                  <button class="apply-btn" type="button" id="data-apply-btn">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parameter */}
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
              <MdNumbers class="accordion-icon" />{" "}
              <span class="accordion-label">Parameter</span>
            </button>
          </h2>
          <div id="parameter-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Smoothing Value
                </div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="5"
                    aria-label="smoothing-value"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-12 d-flex justify-content-end aligh-items-center">
                  <button
                    class="apply-btn"
                    type="button"
                    id="parameter-apply-btn"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hampel Filter */}
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
              <LuFilter class="accordion-icon" />{" "}
              <span class="accordion-label">Hampel Filter</span>
            </button>
          </h2>
          {/* Should Match ID of It */}
          <div id="hampel-filter-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Apply Filter</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="apply-hampel-filter"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Beta</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="3.5"
                    aria-label="hampel-beta"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Gamma</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="2"
                    aria-label="hampel-gamma"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-12 d-flex justify-content-end aligh-items-center">
                  <button
                    class="apply-btn"
                    type="button"
                    id="hampel-filter-apply-btn"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kalman Filter */}
        <div class="accordion-item">
          <h2 class="accordion-header" id="kalman-filter-head">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#kalman-filter-collapse"
              aria-expanded="false"
              aria-controls="kalman-filter-collapse"
            >
              <LuFilter class="accordion-icon" />{" "}
              <span class="accordion-label">Kalman Filter</span>
            </button>
          </h2>
          {/* Should Match ID of It */}
          <div id="kalman-filter-collapse" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Apply Filter</div>
                <div class="form-check form-switch col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="apply-kalman-filter"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Alpha</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  {/* Range */}
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    class="form-range"
                    id="kalman-alpha"
                  />
                  <div class="show-range-value" id="show-kalman-alpha"></div>
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Beta</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="7"
                    aria-label="kalman-beta"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-12 d-flex justify-content-end aligh-items-center">
                  <button
                    class="apply-btn"
                    type="button"
                    id="kalman-filter-apply-btn"
                  >
                    Apply
                  </button>
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
