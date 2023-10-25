import React, { useState } from "react";

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
  return (
    <div class="col-md-3 h-100 position-relative overflow-y-scroll">
      <ul
        class="nav nav-underline nav-fill flex-column flex-sm-row mb-3 nav-border"
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

      <div class="tab-content" id="pills-tabContent">
        <Import />
        <Processing />
        <Setting />
      </div>
    </div>
  );
};

export default SideBar;
