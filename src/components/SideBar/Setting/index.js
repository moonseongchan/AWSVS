import React from "react";

import { GoGraph } from "react-icons/go";
import { FiList } from "react-icons/fi";
import { FiSave } from "react-icons/fi";
import "./Setting.scss";

const Setting = (props) => {
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
                    class="form-control form-control-sm text-input"
                    placeholder="Default"
                    aria-label="axis-x"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Axis Y</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="Default"
                    aria-label="axis-y"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Maximum Value</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="100"
                    aria-label="max-value"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">Minimum Value</div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <input
                    type="text"
                    class="form-control form-control-sm text-input"
                    placeholder="0"
                    aria-label="min-value"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-12 d-flex justify-content-end aligh-items-center">
                  <button class="apply-btn" type="button" id="axis-apply-btn">
                    Apply
                  </button>
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
                    id="show-legend"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-6 justify-content-start">
                  Legend Position
                </div>
                <div class="col-md-6 d-flex justify-content-end align-items-center">
                  <select
                    id="legend-position"
                    class="form-select form-select-sm legend-box"
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
                    id="legend-align"
                    class="form-select form-select-sm legend-box"
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-12 d-flex justify-content-end aligh-items-center">
                  <button class="apply-btn" type="button" id="legend-apply-btn">
                    Apply
                  </button>
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
                    id="show-values"
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
                    id="show-captions"
                  />
                </div>
              </div>
              <div class="row d-flex accordion-component align-items-center">
                <div class="col-md-12 d-flex justify-content-end aligh-items-center">
                  <button class="apply-btn" type="button" id="values-apply-btn">
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

export default Setting;
