import React, { useState, useEffect } from "react";
import LineGraphComponent from "./linegraph.js";
import CustomSpectrogramComponent from "./spectrogram.js";

import { AiOutlineClose } from "react-icons/ai";
import { BiExpandVertical } from "react-icons/bi";
import { BiMenu } from "react-icons/bi";

import "./Dashboard.scss";

const Dashboard = (props) => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    // App.js에서 Info 정보 넣기
    setSlots(props.slots);
  });

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
        <div key={slot.id} className="slot container w-100">
          {/* Slot Header */}
          <div className="slot-header row d-flex align-items-start align-items-center">
            <div className="slot-title-section position-relative ps-2 h-100 d-flex justify-content-start align-items-center">
              <div id={`slot${slot.id}`} className="slot-index">
                {slot.id}
              </div>
              <input
                type="text"
                id={`slot${slot.id}-title`}
                className="slot-title w-75"
                placeholder="Title"
              />
            </div>
            <div className="slot-close-section h-100 d-flex justify-content-end align-items-center">
              <button
                type="button"
                className="slot-move-btn btn d-flex justify-content-end align-items-center accordion-button collapsed"
              >
                <BiMenu />
              </button>
              <button
                type="button"
                className="slot-toggle-btn btn d-flex justify-content-end align-items-center accordion-button collapsed"
                data-bs-toggle="collapse"
                data-bs-target={`#slot${slot.id}-body`}
                aria-expanded="false"
              >
                <BiExpandVertical />
              </button>
              <button
                type="button"
                className="slot-close-btn btn d-flex justify-content-end align-items-center"
                data-bs-toggle="modal"
                data-bs-target={`#slot${slot.id}-modal`}
              >
                <AiOutlineClose />
              </button>
            </div>
          </div>

          <div id={`slot${slot.id}-body`} class="accordion-collapse collapse">
            <div class="accordion-body">
              {/* Slot Content */}
              <div className="border border-2 border-warning slot-content row align-items-center d-flex">
                {/* Line Graph */}
                <div
                  id={`slot${slot.id}-linegraph`}
                  style={{ height: "100%" }}
                  className="border border-1 border-danger my-3 line-graph"
                >
                  {/* 특성 Slot에 따른 Data props로 넘겨주어야 함 (using Slot ID) */}
                  {/* <LineGraphComponent/> */}
                </div>
                {/* Spectrogram */}
                <div
                  id={`slot${slot.id}-spectrogram`}
                  style={{ height: "100%" }}
                  className="border border-1 border-danger my-3 spectrogram"
                >
                  {/* <CustomSpectrogramComponent /> */}
                </div>
                {/* PCA & Cluster */}
                <div
                  style={{ height: "5rem" }}
                  className="border border-1 border-danger my-3 px-3 d-flex align-items-center justify-content-center"
                >
                  <div
                    id={`slot${slot.id}-pca`}
                    style={{ height: "90%", width: "45%" }}
                    className="mx-3 border border-1 border-success"
                  >
                    PCA
                  </div>
                  <div
                    id={`slot${slot.id}-cluster`}
                    style={{ height: "90%", width: "45%" }}
                    className="mx-3 border border-1 border-success"
                  >
                    Cluster
                  </div>
                </div>
              </div>

              {/* Slot Footer */}
              <div className="slot-footer row align-items-end d-flex align-items-center">
                <div>
                  Mean : <span id={`slot${slot.id}-mean`}> # </span> | Std :{" "}
                  <span id={`slot${slot.id}-std`}> # </span> | Max :{" "}
                  <span id={`slot${slot.id}-max`}> # </span> | Min :{" "}
                  <span id={`slot${slot.id}-min`}> # </span>
                </div>
              </div>
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
