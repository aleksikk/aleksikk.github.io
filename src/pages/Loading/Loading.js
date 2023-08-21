import React, { Component } from "react";
import "./Loading.css";

import { Spinner } from "@blueprintjs/core";

class Loading extends Component {
  render() {
    return (
      <div className="Loading-main"
      style={{ color: 'white', background: '#10161A' }}
      >
        <div className="Loading-loader">
          <Spinner />
          <h2>Preparing your unboxing experience...</h2>
        </div>
      </div>
    );
  }
}

export default Loading;
