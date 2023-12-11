import React from "react";

import "./Header.scss";
import Image from "../../assets/logo_title.svg";

const Header = (props) => {
  const JSZip = require("jszip");

  const exportDataToCSV = (zip, slot, type) => {
    const { id, sd, cwt } = slot;

    let data, filename;

    // Choose the data and filename based on the specified dataType
    switch (type) {
      case "sd":
        data = sd;
        filename = `slot_${id}_data_sd.csv`;
        break;
      case "cwt":
        data = cwt;
        filename = `slot_${id}_data_cwt.csv`;
        break;
      default:
        console.error("Invalid data type");
        return;
    }

    // Convert data to CSV format
    const csvContent = data.map((item) => [item].join(",")).join("\n");

    // Add the CSV content to the zip file
    zip.file(filename, csvContent);
  };

  // Function to export data for all slots
  const exportAllSlotsData = () => {
    const zip = new JSZip();

    props.slots.forEach((slot) => {
      if (slot.data.length !== 0) {
        exportDataToCSV(zip, slot, "sd");
        exportDataToCSV(zip, slot, "cwt");
      }
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      // Create a download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);

      // Set the download attribute and filename
      link.download = "slots_data.zip";

      // Append the link to the body and trigger the click event
      document.body.appendChild(link);
      link.click();

      // Remove the link from the DOM
      document.body.removeChild(link);
    });
  };

  return (
    <header class="row">
      <div class="col px-2" id="logo">
        <img src={Image} alt="logo" height={55} />
      </div>
      <div class="col download">
        <button
          type="button"
          class="download-btn btn btn-outline-light"
          onClick={exportAllSlotsData}
        >
          Download
        </button>
      </div>
    </header>
  );
};

export default Header;
