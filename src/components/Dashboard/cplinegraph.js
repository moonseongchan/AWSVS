import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const CompareLineGraph = (props) => {
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

  const cpLineGraphRef = useRef(null);
  const initialWidth = getGraphWidth() - margin.left - margin.right;
  const [width, setWidth] = useState(initialWidth);
  const height = 250 - margin.top - margin.bottom;

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    const svg = d3.select(cpLineGraphRef.current);

    // Initialize
    const currentSlot = props.slot;
    const targetSlot = props.slots.filter(
      (slot) => slot.id === props.targetId
    )[0];

    const currentSD = currentSlot.sd.map((list) => {
      return list.map((item) => Math.abs(item));
    });
    const targetSD = targetSlot.sd.map((list) => {
      return list.map((item) => Math.abs(item));
    });

    const options = props.slot.options;

    if (currentSD.length > 0 && targetSD.length > 0) {
      //// Scale
      let xScale = d3
        .scaleLinear()
        // Domain => Time Series
        .domain([0, currentSD[0].length])
        .range([0, width]);

      let yScale;
      const minCurrent = d3.min(currentSD.flat());
      const maxCurrent = d3.max(currentSD.flat());
      const minTarget = d3.min(targetSD.flat());
      const maxTarget = d3.max(targetSD.flat());

      //// Logarithm Axis
      if (options.logScale) {
        // Domain => Value (Amplitude, Phase, etc.)
        // Use flat() to find the maximum of all values in data
        yScale = d3
          .scaleLog()
          .domain([
            Math.min(minCurrent, minTarget),
            Math.max(maxCurrent, maxTarget),
          ])
          .range([height, 0])
          .base(options.logBase);
      } else {
        yScale = d3
          .scaleLinear()
          .domain([
            Math.min(minCurrent, minTarget),
            Math.max(maxCurrent, maxTarget),
          ])
          .range([height, 0]);
      }

      svg.selectAll("*").remove();

      //// Axis
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);
      const xAxisG = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top + height})`)
        .call(d3.axisBottom(xScale));
      const yAxisG = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(yScale));

      //// Grid
      if (options.showGrid && !options.zomming) {
        svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top + height})`)
          // .transition().duration(2000)
          .call(xAxis.tickSize(-height).tickFormat(""))
          .attr("stroke", "#d0d0d0")
          .attr("opacity", ".2");

        svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`)
          // .transition().duration(2000)
          .call(yAxis.tickSize(-width).tickFormat(""))
          .attr("stroke", "#d0d0d0")
          .attr("opacity", ".2");
      }

      //// Zooming Interaction
      const zoomBehavior = d3
        .zoom()
        .scaleExtent([1, 8])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("zoom", onZoomed);

      // Initialize Zoom Behavior
      svg.call(zoomBehavior.scaleTo, 1);

      // Set Zooming Handler
      function onZoomed(event) {
        svg.selectAll("*").remove();
        const newXScale = event.transform.rescaleX(xScale);
        const lineColors = d3.schemeTableau10;

        const area = d3
          .area()
          .x((d, i) =>
            newXScale(i) < 0
              ? 0
              : newXScale(i) >= width
              ? newXScale(currentSD[0].length) - margin
              : newXScale(i)
          )
          .y0(yScale(Math.min(minCurrent, minTarget)))
          .y1((d) => yScale(d));

        const line = d3
          .line()
          .x((d, i) =>
            newXScale(i) < 0
              ? 0
              : newXScale(i) >= width
              ? newXScale(currentSD[0].length) - margin
              : newXScale(i)
          )
          .y((d) => yScale(d));

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

        const newXAxis = d3.axisBottom(newXScale);
        const yAxis = d3.axisLeft(yScale);

        if (options.showGrid) {
          svg
            .append("g")
            .attr(
              "transform",
              `translate(${margin.left},${margin.top + height})`
            )
            .call(newXAxis.tickSize(-height).tickFormat(""))
            .attr("stroke", "#d0d0d0")
            .attr("opacity", ".2");

          svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(yAxis.tickSize(-width).tickFormat(""))
            .attr("stroke", "#d0d0d0")
            .attr("opacity", ".2");
        }

        // Plot Area & Line
        if (maxTarget > maxCurrent) {
          targetSD.forEach((d) => {
            graph
              .append("path")
              .datum(d)
              .attr("fill", lineColors[2])
              .attr("opacity", "0.5")
              .attr("d", area);
          });

          targetSD.forEach((d) => {
            graph
              .append("path")
              .datum(d)
              .attr("fill", "none")
              .attr("stroke", lineColors[2])
              .attr("stroke-width", 1.5)
              .attr("d", line);
          });

          currentSD.forEach((d) => {
            graph
              .append("path")
              .datum(d)
              .attr("fill", lineColors[0])
              .attr("opacity", "0.5")
              .attr("d", area);
          });

          currentSD.forEach((d) => {
            graph
              .append("path")
              .datum(d)
              .attr("fill", "none")
              .attr("stroke", lineColors[0])
              .attr("stroke-width", 1.5)
              .attr("d", line);
          });
        } else {
          currentSD.forEach((d) => {
            graph
              .append("path")
              .datum(d)
              .attr("fill", lineColors[0])
              .attr("opacity", "0.5")
              .attr("d", area);
          });

          currentSD.forEach((d) => {
            graph
              .append("path")
              .datum(d)
              .attr("fill", "none")
              .attr("stroke", lineColors[0])
              .attr("stroke-width", 1.5)
              .attr("d", line);
          });

          targetSD.forEach((d) => {
            graph
              .append("path")
              .datum(d)
              .attr("fill", lineColors[2])
              .attr("opacity", "0.5")
              .attr("d", area);
          });

          targetSD.forEach((d) => {
            graph
              .append("path")
              .datum(d)
              .attr("fill", "none")
              .attr("stroke", lineColors[2])
              .attr("stroke-width", 1.5)
              .attr("d", line);
          });
        }
      }

      // Handle Zooming Interaction Event
      if (options.zooming) {
        // Set Zoom Behavior
        svg.call(zoomBehavior);
      } else {
        // Initialize Zoom Behavior
        svg.call(zoomBehavior.scaleTo, 1);
        svg.on(".zoom", null);
      }
    }
  }, [width, props.slots]);

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
        ref={cpLineGraphRef}
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      ></svg>
    </div>
  );
};

export default CompareLineGraph;
