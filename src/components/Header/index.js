import React from "react";

import "./Header.scss";
import Image from "../../assets/logo_title.svg";

const Header = (props) => {
  return (
    <header class="row">
      <div class="col px-1">
        <img src={Image} alt="logo" height={55} />
      </div>
      <div class="col download">
        <button type="button" class="download-btn btn btn-outline-light">
          Download
        </button>
      </div>
    </header>
  );
};

export default Header;
