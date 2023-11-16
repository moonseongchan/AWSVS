import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { data2 } from "./data";

const CustomSpectrogramComponent = (props) => {
  const margin = {top: 20, right: 20, bottom: 40, left: 40};
  const getGraphWidth = () => {
    const sidebar = document.getElementById('sidebar-content').getBoundingClientRect().width;
    const isSidebarNext = window.innerWidth - sidebar < 30 ? false : true;
    const width = isSidebarNext ? window.innerWidth * 0.69 : window.innerWidth * 0.88;
    return width;
  };
  const handleResize = () => {
    const width = getGraphWidth() - margin.left - margin.right;
    setWidth(width);
  };

  const initialWidth = getGraphWidth() - margin.left - margin.right;
  const [width, setWidth] = useState(initialWidth);
  const height = 200 - margin.bottom - margin.top;
  const graphSvg = useRef();

  useEffect(() => {
    let data = data2;
    window.addEventListener('resize', handleResize);
    const numRows = data.length;
    const numCols = data[0].length;
    const rect_width = width / numCols;
    const rect_height = height / numRows;

    const colorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain([
        d3.min(data, (row) => d3.min(row)),
        d3.max(data, (row) => d3.max(row)),
      ]);

    const svg = d3.select(graphSvg.current);

    for (let i = 0; i < numRows; i++)
      for (let j = 0; j < numCols; j++)
        svg
          .append("rect")
          .attr("x", j * rect_width)
          .attr("y", i * rect_height)
          .attr("width", rect_width)
          .attr("height", rect_height)
          .style("fill", colorScale(data[i][j]))
          .attr("transform", `translate(${margin.left}, 0)`);
  }, [width]);
  return (
    <div>
      <svg ref={graphSvg} width={width} height={height}></svg>
    </div>
  );
};

export default CustomSpectrogramComponent;
