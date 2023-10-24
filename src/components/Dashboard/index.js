import React from "react";
// import { BiChevronsLeft } from "react-icons/bi";

import "./Dashboard.scss";

const Dashboard = (props) => {
  return (
    <div class="col-md-9 p-2 border border-2 border-info h-100 position-relative overflow-scroll">
      <div class="d-flex flex-row-reverse pb-2">
        <button type="button" class="new-slot-btn">
          New Slot
        </button>
      </div>

      <div class="slot w-100 border border-1 border-success mb-2">Slot 1</div>
      <div class="slot w-100 border border-1 border-success mb-2">Slot 2</div>
    </div>
  );
};

export default Dashboard;
