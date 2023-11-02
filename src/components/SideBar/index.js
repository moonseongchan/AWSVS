import React, { useState, useEffect } from "react";

import { AiOutlineCloudUpload } from "react-icons/ai";
import { LuDatabaseBackup } from "react-icons/lu";
import { SiAlwaysdata } from "react-icons/si";
import { VscSettings } from "react-icons/vsc";
import { AiOutlineSetting } from "react-icons/ai";
// Plot Icon : MdOutlineDataThresholding

import Import from "./Import";
import Processing from "./Processing";
import Setting from "./Setting";

import "./SideBar.scss";

const SideBar = (props) => {
  const [currentSlot, setCurrentSlot] = useState("Select Slot");
  const [currentSlotId, setCurrentSlotId] = useState("Select Slot");
  const slots = props.slots;

  const selectSlot = (event, id) => {
    const value = event.target.innerHTML;
    setCurrentSlot(value);
    setCurrentSlotId("slot" + id);
  };

  return (
    <div
      id="sidebar-content"
      class=" col-md-3 h-100 d-flex flex-column min-vh-91 max-vh-91"
    >
      <div class="d-flex flex-column" style={{ height: "94%" }}>
        {/* NavBar */}
        <ul
          class="nav nav-underline nav-fill flex-column flex-sm-row mb-1 nav-border"
          id="pills-tab"
          role="tablist"
        >
          <li
            class="nav-item align-items-center justify-content-center"
            role="presentation"
          >
            <button
              class="nav-link"
              id="pills-import-data-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-import-data"
              type="button"
              role="tab"
              aria-controls="pills-import-data"
              aria-selected="true"
            >
              <div class="d-flex justify-content-center align-items-center">
                <AiOutlineCloudUpload class="nav-icon" /> Import Data
              </div>
            </button>
          </li>
          <li
            class="nav-item align-items-center justify-content-center"
            role="presentation"
          >
            <button
              class="nav-link"
              id="pills-processing-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-processing"
              type="button"
              role="tab"
              aria-controls="pills-processing"
              aria-selected="false"
            >
              <div class="d-flex justify-content-center align-items-center">
                <VscSettings class="nav-icon" /> Processing
              </div>
            </button>
          </li>
          <li
            class="nav-item align-items-center justify-content-center"
            role="presentation"
          >
            <button
              class="nav-link"
              id="pills-setting-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-setting"
              type="button"
              role="tab"
              aria-controls="pills-setting"
              aria-selected="false"
            >
              <div class="d-flex justify-content-center align-items-center">
                <AiOutlineSetting class="nav-icon" /> Setting
              </div>
            </button>
          </li>
        </ul>

        <div class="tab-content overflow-y-scroll" id="pills-tabContent">
          <Import />
          <Processing />
          <Setting />
        </div>
      </div>
      {/* Dropdown */}
      <div
        class="d-flex slot-select mt-auto align-items-center justify-content-end"
        style={{ height: "6%" }}
      >
        <div class="dropup-center dropup">
          <button
            class="dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="slot-select-btn"
          >
            {currentSlot}
          </button>
          <ul class="dropdown-menu">
            {slots.map((slot) => (
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  onClick={(event) => selectSlot(event, slot.id)}
                >
                  Slot {slot.id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
