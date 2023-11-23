import React, { useState, useEffect } from "react";
import LineGraph from "./linegraph.js";
import Spectrogram from "./spectrogram.js";
import CompareLineGraph from "./cplinegraph.js";
import CompareSpectrogram from "./cpspectrogram.js";

import { AiOutlineClose } from "react-icons/ai";
import { BiExpandVertical } from "react-icons/bi";
import { BiMenu } from "react-icons/bi";

import "./Dashboard.scss";

const Dashboard = (props) => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    // App.js에서 Info 정보 넣기
    setSlots(props.slots);
  }, [props.slots]);

  return (
    <div
      id="dashboard-content"
      class="col-md-9 h-100 position-relative overflow-scroll"
    >
      <div class="d-flex flex-row-reverse" style={{ paddingBottom: "0.75rem" }}>
        <button type="button" class="new-slot-btn" onClick={props.createSlot}>
          New Slot
        </button>
      </div>

      {slots.map((slot) => (
        <div key={slot.id} class="slot container w-100">
          {/* Slot Header */}
          <div class="slot-header row d-flex align-items-start align-items-center">
            <div class="slot-title-section position-relative ps-2 h-100 d-flex justify-content-start align-items-center">
              <div id={`slot${slot.id}`} class="slot-index">
                {slot.id}
              </div>
              <input
                type="text"
                id={`slot${slot.id}-title`}
                class="slot-title w-75"
                placeholder="Title"
              />
            </div>
            <div class="slot-close-section h-100 d-flex justify-content-end align-items-center">
              {/* <button
                type="button"
                class="slot-move-btn btn d-flex justify-content-end align-items-center accordion-button collapsed"
              >
                <BiMenu />
              </button> */}
              <button
                type="button"
                class="slot-toggle-btn btn d-flex justify-content-end align-items-center accordion-button collapsed"
                data-bs-toggle="collapse"
                data-bs-target={`#slot${slot.id}-body`}
                aria-expanded="false"
              >
                <BiExpandVertical />
              </button>
              <button
                type="button"
                class="slot-close-btn btn d-flex justify-content-end align-items-center"
                data-bs-toggle="modal"
                data-bs-target={`#slot${slot.id}-modal`}
              >
                <AiOutlineClose />
              </button>
            </div>
          </div>

          <div id={`slot${slot.id}-body`} class="accordion-collapse collapse">
            <div class="dashboard-body accordion-body">
              {/* Slot Content */}
              <div class="slot-content row align-items-center d-flex pb-1">
                {/* Line Graph */}
                <div id="line-graph" class="px-0 py-1">
                  <LineGraph slot={slot} />
                </div>

                {/* Spectrogram (only on status) */}
                {slot.options.showSpectrogram && (
                  <div id="spectrogram" class="px-0 py-1">
                    <Spectrogram slot={slot} />
                  </div>
                )}

                {/* Comparison (only on status) */}
                {slot.processing.compare && slot.processing.target !== null && (
                  <hr class="my-2" />
                )}

                {slot.processing.compare && slot.processing.target !== null && (
                  <div id="line-graph" class="px-0 py-1">
                    <CompareLineGraph
                      currentId={slot.id}
                      targetId={slot.processing.target}
                      slots={slots}
                      slot={slot}
                    />
                  </div>
                )}

                {/* <div id="spectrogram" class="px-0 py-0 my-1">
                      <CompareSpectrogram currentId={slot.id} target={slot.processing.target} slots={slots}/>
                    </div> */}

                {/* PCA & Cluster */}
                {/* <div
                  style={{ height: "5rem" }}
                  class="border border-1 border-danger my-1 px-3 d-flex align-items-center justify-content-center"
                >
                  <div
                    id={`slot${slot.id}-pca`}
                    style={{ height: "90%", width: "45%" }}
                    class="mx-3 border border-1 border-success"
                  >
                    PCA
                  </div>
                  <div
                    id={`slot${slot.id}-cluster`}
                    style={{ height: "90%", width: "45%" }}
                    class="mx-3 border border-1 border-success"
                  >
                    Cluster
                  </div>
                </div> */}
              </div>

              {/* Slot Footer */}
              {/* <div class="slot-footer row align-items-end d-flex align-items-center">
                <div>
                  Mean : <span id={`slot${slot.id}-mean`}> # </span> | Std :{" "}
                  <span id={`slot${slot.id}-std`}> # </span> | Max :{" "}
                  <span id={`slot${slot.id}-max`}> # </span> | Min :{" "}
                  <span id={`slot${slot.id}-min`}> # </span>
                </div>
              </div> */}
            </div>
          </div>

          {/* Modal */}
          <div class="modal fade" id={`slot${slot.id}-modal`} tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Delete Slot</h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <p>Are you sure to delete slot {slot.id}?</p>
                </div>
                <div class="modal-footer">
                  <button
                    type="submit"
                    class="btn btn-danger"
                    onClick={() => {
                      props.removeSlot(slot.id);
                    }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
