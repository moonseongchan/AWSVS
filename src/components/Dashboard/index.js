import React from "react";

import { AiOutlineClose } from "react-icons/ai";
import "./Dashboard.scss";

const Dashboard = (props) => {
  return (
    <div class="dashboard-content col-md-9 h-100 position-relative overflow-scroll">
      <div class="d-flex flex-row-reverse pb-2">
        <button type="button" class="new-slot-btn">
          New Slot
        </button>
      </div>
      {/* N_th Slot */}
      <div class="slot container w-100">
        {/* Slot Header */}
        <div class="slot-header row d-flex align-items-start align-items-center">
          <div class="position-relative ps-2 h-100 col-md-6 d-flex justify-content-start align-items-center">
            <div id={"slot" + 1} class="slot-index">
              #
            </div>
            <input
              type="text"
              id="slot-1-title"
              class="slot-title w-75"
              placeholder="Title"
            />
          </div>
          <div class="slot-close col-md-6 d-flex justify-content-end align-items-center">
            <button
              type="button"
              class="slot-close-btn btn d-flex justify-content-end align-items-center"
            >
              <AiOutlineClose />
            </button>
          </div>
        </div>
        {/* Slot Content */}
        <div class="border border-2 border-warning slot-content row align-items-center d-flex">
          {/* Line Graph */}
          <div
            style={{ height: "20rem" }}
            class="border border-1 border-danger my-3 line-graph"
          >
            Line Graph
          </div>
          {/* Spectrogram */}
          <div
            style={{ height: "20rem" }}
            class="border border-1 border-danger my-3 spectrogram"
          >
            Spectrogram
          </div>
          {/* PCA */}
          <div
            style={{ height: "20rem" }}
            class="border border-1 border-danger my-3 px-3 d-flex align-items-center justify-content-center"
          >
            <div
              style={{ height: "90%", width: "45%" }}
              class="mx-3 border border-1 border-success"
            >
              PCA
            </div>
            <div
              style={{ height: "90%", width: "45%" }}
              class="mx-3 border border-1 border-success"
            >
              Cluster
            </div>
          </div>
        </div>

        {/* Slot Footer */}
        <div class="slot-footer row align-items-end d-flex align-items-center">
          <div>
            Mean : <span id={"mean-slot" + 1}> # </span> | Std :{" "}
            <span id={"std-slot" + 1}> # </span> | Max :{" "}
            <span id={"max-slot" + 1}> # </span> | Min :{" "}
            <span id={"min-slot" + 1}> # </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
