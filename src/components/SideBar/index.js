import React, { useState, useEffect } from "react";
import axios from "axios";

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
  // SideBar에서 선택된 Slot만을 고려하기 위한 Value들
  const [currentSlotLabel, setCurrentSlotLabel] = useState("Select Slot");
  const [currentSlotId, setCurrentSlotId] = useState(-1);

  const selectSlot = (event, id) => {
    setCurrentSlotLabel(event.target.innerHTML);
    setCurrentSlotId(id);
  };

  // currentSlot이 바뀔때마다 해당 Slot의 설정 값들로 변경해줘야 함
  // currentSlotId가 바뀔때마다 Rerendering 필요 (=> useEffect)
  const [slots, setSlots] = useState([]);

  // Processing으로 보낼 Info들 (선택된 Slot에 따라)
  const [processInfo, setProcessInfo] = useState({});

  // Setting으로 보낼 Info들 (선택된 Slot에 따라)
  const [optionsInfo, setOptionsInfo] = useState({});

  const getUpdatedData = async (key, value) => {
    // Slot이 아무것도 선택되지 않았으면 실행하지 않음
    if (currentSlotId !== -1) {
      let newSlots;
      if (key === "data") {
        //// Data
        newSlots = slots.map((slot) => {
          if (slot.id === currentSlotId) {
            return { ...slot, data: value };
          }
          return slot;
        });
      } else if (key === "processing") {
        //// Processing
        newSlots = slots.map((slot) => {
          if (slot.id === currentSlotId) {
            return { ...slot, processing: value };
          }
          return slot;
        });

        // Target이 Null 값이면 Compare 실행 안되게끔 처리
        if (value.target === null) {
          newSlots = newSlots.map((slot) => {
            if (slot.id === currentSlotId) {
              return {
                ...slot,
                processing: {
                  ...slot.processing,
                  compare: false,
                  // To Do - 여기는 추후 처리
                  // xFeature: false,
                  // yFeature: false,
                },
              };
            }
            return slot;
          });
        }

        // STFT와 Zooming / Threshold Line 기능 동시에 사용 못하게끔 처리
        if (value.applySTFT) {
          newSlots = newSlots.map((slot) => {
            if (slot.id === currentSlotId) {
              return {
                ...slot,
                options: {
                  ...slot.options,
                  zooming: false,
                  thresholdLine: false,
                },
              };
            }
            return slot;
          });
        }
      } else if (key === "options") {
        //// Options
        newSlots = slots.map((slot) => {
          if (slot.id === currentSlotId) {
            return { ...slot, options: value };
          }
          return slot;
        });

        // STFT와 Zooming / Threshold Line 기능 동시에 사용 못하게끔 처리
        newSlots = newSlots.map((slot) => {
          if (slot.id === currentSlotId) {
            if (slot.processing.applySTFT) {
              return {
                ...slot,
                options: {
                  ...slot.options,
                  zooming: false,
                  thresholdLine: false,
                },
              };
            }
          }
          return slot;
        });
      }

      const selectedSlot = newSlots.filter((slot) => slot.id === currentSlotId);
      if (selectedSlot[0].data.length !== 0) {
        // Plot Data 설정
        const formData = new FormData();
        formData.append("data", JSON.stringify(selectedSlot[0].data));
        formData.append(
          "processing",
          JSON.stringify(selectedSlot[0].processing)
        );
        try {
          const response = await axios.post(
            "http://localhost:5000/get",
            formData,
            { withCredentials: true }
          );
          // console.log(response.data.result);
          newSlots = newSlots.map((slot) => {
            if (slot.id === currentSlotId) {
              return { ...slot, plot: response.data.result };
            }
            return slot;
          });
        } catch (error) {
          console.error("Error Uploading File:", error);
        }

        // Signal Denoising Data 설정
        const sdFormData = new FormData();
        sdFormData.append("data", JSON.stringify(selectedSlot[0].data));
        sdFormData.append(
          "processing",
          JSON.stringify({
            ...selectedSlot[0].processing,
            applySD: true,
            applyCWT: false,
            applySTFT: false,
          })
        );
        try {
          const response = await axios.post(
            "http://localhost:5000/get",
            sdFormData,
            { withCredentials: true }
          );
          // console.log(response.data.result);
          newSlots = newSlots.map((slot) => {
            if (slot.id === currentSlotId) {
              return { ...slot, sd: response.data.result };
            }
            return slot;
          });
        } catch (error) {
          console.error("Error Uploading File:", error);
        }

        // CWT Data 설정
        const cwtFormData = new FormData();
        cwtFormData.append("data", JSON.stringify(selectedSlot[0].data));
        cwtFormData.append(
          "processing",
          JSON.stringify({
            ...selectedSlot[0].processing,
            applySD: false,
            applyCWT: true,
            applySTFT: false,
          })
        );
        try {
          const response = await axios.post(
            "http://localhost:5000/get",
            cwtFormData,
            { withCredentials: true }
          );
          // console.log(response.data.result);
          newSlots = newSlots.map((slot) => {
            if (slot.id === currentSlotId) {
              return { ...slot, cwt: response.data.result };
            }
            return slot;
          });
        } catch (error) {
          console.error("Error Uploading File:", error);
        }
      }

      // console.log("Updated", currentSlotId, newSlots);
      setSlots(newSlots);
      props.getUpdatedSlots(newSlots);
    }
  };

  useEffect(() => {
    setSlots(props.slots);
  }, [props]);

  useEffect(() => {
    // 초기 상태 고려
    if (currentSlotId === -1) {
      return;
    } else {
      const isSlotExist = props.slots.some((slot) => slot.id === currentSlotId);
      if (!isSlotExist) {
        setCurrentSlotId(-1);
        setCurrentSlotLabel("Select Slot");
      } else {
        // console.log(currentSlotId);
        const selectedSlot = slots.filter((slot) => slot.id === currentSlotId);
        const newProcessInfo = selectedSlot[0].processing;
        const optionsInfo = selectedSlot[0].options;
        setProcessInfo(newProcessInfo);
        setOptionsInfo(optionsInfo);
      }
    }
  }, [currentSlotId, props]);

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
          <Import
            currentSlotId={currentSlotId}
            getUpdatedData={getUpdatedData}
          />
          <Processing
            currentSlotId={currentSlotId}
            slots={slots}
            info={processInfo}
            getUpdatedData={getUpdatedData}
          />
          <Setting
            currentSlotId={currentSlotId}
            info={optionsInfo}
            getUpdatedData={getUpdatedData}
          />
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
            {currentSlotLabel}
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
