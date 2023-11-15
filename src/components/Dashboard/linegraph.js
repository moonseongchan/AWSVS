import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { data1 } from "./data";

const LineGraphComponent = (props) => {
  // const [data, setData] = useState([]);

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = 800 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  useEffect(() => {
    let data = data1;

    if (data.length > 0) {
      const svg = d3.select("#chart");

      const lineColors = d3.schemeTableau10;

      // Domain => Time Series
      const xScale = d3
        .scaleLinear()
        .domain([0, data[0].length])
        .range([0, width]);

      // Domain => Value (Amplitude, Phase, etc.)
      // Use flat() to find the maximum of all values in data
      const yScale = d3
        .scaleLinear()
        .domain([d3.min(data.flat()), d3.max(data.flat())])
        .range([height, 0]);

      const line = d3
        .line()
        .x((d, i) => xScale(i))
        .y((d) => yScale(d));

      svg.selectAll("*").remove();

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top + height})`)
        .call(d3.axisBottom(xScale));

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(yScale));

      const graph = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Create a line graph for each data array in the data array
      data.forEach((d, idx) => {
        graph
          .append("path")
          .datum(d)
          .attr("fill", "none")
          .attr("stroke", lineColors[idx % lineColors.length])
          .attr("stroke-width", 1.5)
          .attr("d", line);
      });
    }
  }, []);

  return (
    <div>
      <svg
        id="chart"
        width={width}
        height={height + margin.top + margin.bottom}
      ></svg>
    </div>
  );
};
export default LineGraphComponent;
