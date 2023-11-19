import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { data1 } from "./data";

const LineGraph = (props) => {
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

  const lineGraphRef = useRef(null);
  const initialWidth = getGraphWidth() - margin.left - margin.right;
  const [width, setWidth] = useState(initialWidth);
  const height = 250 - margin.top - margin.bottom;

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    const svg = d3.select(lineGraphRef.current);
    const raw = props.slot.data;
    const plot = props.slot.plot;
    const processing = props.slot.processing;
    const options = props.slot.options;
    if (plot.length > 0) {
      // Domain => Time Series
      let xScale = d3
        .scaleLinear()
        .domain([0, plot[0].length])
        .range([0, width]);

      let yScale;
      const minRaw = d3.min(raw.flat());
      const maxRaw = d3.max(raw.flat());
      const minPlot = d3.min(plot.flat());
      const maxPlot = d3.max(plot.flat());

      // Handle Logarithm Axis
      if (options.logScale && minRaw >= 0 && minPlot >= 0) {
        // Domain => Value (Amplitude, Phase, etc.)
        // Use flat() to find the maximum of all values in data
        yScale = d3
          .scaleLog()
          .domain([minPlot, maxPlot])
          .range([height, 0])
          .base(options.logBase);

        if (!processing.applyCWT && processing.applySignalDenoising) {
          yScale = d3
            .scaleLog()
            .domain([Math.min(minRaw, minPlot), Math.max(maxRaw, maxPlot)])
            .range([height, 0])
            .base(options.logBase);
        }
      } else {
        // Alert
        if (options.logScale && !(minRaw >= 0 && minPlot >= 0)) {
          alert(
            "For using logarithm, domain must be strictly positive or negative"
          );
        }

        yScale = d3.scaleLinear().domain([minPlot, maxPlot]).range([height, 0]);

        if (!processing.applyCWT && processing.applySignalDenoising) {
          yScale = d3
            .scaleLinear()
            .domain([Math.min(minRaw, minPlot), Math.max(maxRaw, maxPlot)])
            .range([height, 0]);
        }
      }

      const lineColors = d3.schemeTableau10;

      const line = d3
        .line()
        .x((d, i) => xScale(i))
        .y((d) => yScale(d));

      svg.selectAll("*").remove();

      // Grid
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      if (options.showGrid) {
        svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top + height})`)
          .call(xAxis.tickSize(-height).tickFormat(""))
          .attr("stroke", "#d0d0d0")
          .attr("opacity", ".2");

        svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .call(yAxis.tickSize(-width).tickFormat(""))
          .attr("stroke", "#d0d0d0")
          .attr("opacity", ".2");
      }

      // Axis
      const xAxisG = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top + height})`)
        .call(d3.axisBottom(xScale));

      const yAxisG = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(yScale));

      // Plot Lines
      const graph = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Create a line graph for each data array in the data array
      plot.forEach((d, idx) => {
        graph
          .append("path")
          .datum(d)
          .attr("fill", "none")
          .attr("stroke", lineColors[idx % lineColors.length])
          .attr("stroke-width", 1.5)
          .attr("d", line);
      });

      if (!processing.applyCWT && processing.applySignalDenoising) {
        // Raw Data 고정 (Signal Denoising만 On되어 있을 때)
        raw.forEach((d, idx) => {
          graph
            .append("path")
            .datum(d)
            .attr("fill", "none")
            .attr("stroke", lineColors[idx % lineColors.length])
            .attr("stroke-width", 2)
            .attr("opacity", "0.5")
            .attr("d", line);
        });
      }



      if (options.zooming) {
        //set zoom behavior
        const zoomBehavior = d3
            .zoom()
            .scaleExtent([1, 8])
            .extent([[0, 0], [width, height]])
            .on('zoom', onZoomed);
        svg.call(zoomBehavior);
        //set handler
        function onZoomed(event) {
          svg.selectAll('*').remove();
          const newXScale = event.transform.rescaleX(xScale);
          const newline = d3
              .line()
              .x((d, i) => newXScale(i) < 0 ? 0 :
                  newXScale(i) > width ? newXScale(512) - margin : newXScale(i))
              .y((d) => yScale(d));
          const lineColors = d3.schemeTableau10;
          const graph = svg
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

          svg
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top + height})`)
              .call(d3.axisBottom(newXScale));
          svg
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`)
              .call(d3.axisLeft(yScale));

          plot.forEach((d, idx) => {
            graph
                .append("path")
                .datum(d)
                .attr("fill", "none")
                .attr("stroke", lineColors[idx % lineColors.length])
                .attr("stroke-width", 1.5)
                .attr("d", newline);
          });
        }
      } else {
        svg.on('.zoom', null);
      }

      if (options.guideLine) {
        // Guide Line
        // TODO
      }
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
        ref={lineGraphRef}
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      ></svg>
    </div>
  );
};

export default LineGraph;
