import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { data2 } from "./data";

const Spectrogram = (props) => {
  // To resize the width of the graph
  const margin = { top: 10, right: 30, bottom: 20, left: 40 };
  const getGraphWidth = () => {
    const sidebar = document
      .getElementById("sidebar-content")
      .getBoundingClientRect().width;
    const isSidebarNext = window.innerWidth - sidebar < 30 ? false : true;
    const width = isSidebarNext
      ? window.innerWidth * 0.68
      : window.innerWidth * 0.9;
    return width;
  };
  const handleResize = () => {
    const width = getGraphWidth() - margin.left - margin.right;
    setWidth(width);
  };

  const spectrogramRef = useRef(null);
  const initialWidth = getGraphWidth() - margin.left - margin.right;
  const [width, setWidth] = useState(initialWidth);
  const height = 200 - margin.top - margin.bottom;

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    const svg = d3.select(spectrogramRef.current);
    const raw = props.slot.data;
    const plot = props.slot.plot;
    const processing = props.slot.processing;
    const options = props.slot.options;

    if (plot.length > 0 ) {
      const scaled_x_min = props.slot.scaled_x_domain ? props.slot.scaled_x_domain[0] : 0;
      const scaled_x_max = props.scaled_x_domain ? props.slot.scaled_x_domain[1] : plot[0].length;
      const newPlot = plot.map(innerArray =>
          innerArray.slice(Math.floor(scaled_x_min), Math.ceil(scaled_x_max)));

      const numRows = newPlot.length;
      const numCols = newPlot[0].length;
      const rect_width = width / numCols;
      const rect_height = height / numRows;

      // Domain => Time Series
      const xScale = d3
        .scaleLinear()
        .domain([scaled_x_min, scaled_x_max])
        .range([0, width]);

      let colorScale;
      if (options.spectrogramColor === "Viridis") {
        colorScale = d3.scaleSequential(d3.interpolateViridis);
      } else if (options.spectrogramColor === "Cividis") {
        colorScale = d3.scaleSequential(d3.interpolateCividis);
      } else if (options.spectrogramColor === "Plasma") {
        colorScale = d3.scaleSequential(d3.interpolatePlasma);
      } else if (options.spectrogramColor === "Turbo") {
        colorScale = d3.scaleSequential(d3.interpolateTurbo);
      } else if (options.spectrogramColor === "CubehelixDefault") {
        colorScale = d3.scaleSequential(d3.interpolateCubehelixDefault);
      } else if (options.spectrogramColor === "Inferno") {
        colorScale = d3.scaleSequential(d3.interpolateInferno);
      }

      colorScale.domain([
        d3.min(plot, (row) => d3.min(row)),
        d3.max(plot, (row) => d3.max(row)),
      ]);

      svg.selectAll("*").remove();

      const graph = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      for (let i = 0; i < numRows; i++)
        for (let j = 0; j < numCols; j++)
          graph
            .append("rect")
            .attr("x", j * rect_width)
            .attr("y", i * rect_height)
            .attr("width", rect_width)
            .attr("height", rect_height)
            .style("fill", colorScale(newPlot[i][j]));

      // Axis
      svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top + height})`)
        .call(d3.axisBottom(xScale));
    }
  }, [width, props.slot]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <svg
        ref={spectrogramRef}
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      ></svg>
    </div>
  );
};

export default Spectrogram;
