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
    <div class="col-md-3 border border-danger">
      <ul
        class="nav nav-underline nav-fill flex-column flex-sm-row mb-3 nav-border"
        id="pills-tab"
        role="tablist"
      >
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="pills-home-tab"
            data-bs-toggle="pill"
            data-bs-target="#pills-home"
            type="button"
            role="tab"
            aria-controls="pills-home"
            aria-selected="true"
          >
            <AiOutlineCloudUpload /> Import Data
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="pills-profile-tab"
            data-bs-toggle="pill"
            data-bs-target="#pills-profile"
            type="button"
            role="tab"
            aria-controls="pills-profile"
            aria-selected="false"
          >
            <VscSettings /> Processing
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="pills-contact-tab"
            data-bs-toggle="pill"
            data-bs-target="#pills-contact"
            type="button"
            role="tab"
            aria-controls="pills-contact"
            aria-selected="false"
          >
            <AiOutlineSetting /> Setting
          </button>
        </li>
      </ul>

      <div class="tab-content" id="pills-tabContent">
        <div
          class="tab-pane fade show active"
          id="pills-home"
          role="tabpanel"
          aria-labelledby="pills-home-tab"
          tabindex="0"
        >
          Import Data
        </div>
        <div
          class="tab-pane fade"
          id="pills-profile"
          role="tabpanel"
          aria-labelledby="pills-profile-tab"
          tabindex="0"
        >
          Processing
        </div>
        <div
          class="tab-pane fade"
          id="pills-contact"
          role="tabpanel"
          aria-labelledby="pills-contact-tab"
          tabindex="0"
        >
          Setting
        </div>
      </div>
    </div>
  );
};

export default SideBar;
