import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";

const ComparisonGraph = (props) => {
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
  const cpScatterGraphRef = useRef(null);
  const initialWidth = getGraphWidth() - margin.left - margin.right;
  const [width, setWidth] = useState(initialWidth);
  const cpLineHeight = 250 - margin.top - margin.bottom;
  const cpScatterHeight = 450 - margin.top - margin.bottom;

  //// Get Feature Data
  const getFeatures = async (currentCWT, targetCWT) => {
    let cFeatures, tFeatures;
    const currFormData = new FormData();
    currFormData.append("data", JSON.stringify(currentCWT));

    try {
      const response = await axios.post(
        "http://localhost:5000/feature",
        currFormData,
        { withCredentials: true }
      );
      cFeatures = response.data;
    } catch (error) {
      console.error("Error Uploading File:", error);
    }

    const targetFormData = new FormData();
    targetFormData.append("data", JSON.stringify(targetCWT));

    try {
      const response = await axios.post(
        "http://localhost:5000/feature",
        targetFormData,
        { withCredentials: true }
      );
      tFeatures = response.data;
    } catch (error) {
      console.error("Error Uploading File:", error);
    }
    return [cFeatures, tFeatures];
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    const cpLineSvg = d3.select(cpLineGraphRef.current);

    // Initialize
    const currentSlot = props.currentSlot;
    const targetSlot = props.targetSlot;

    const currentSD = currentSlot.sd.map((list) => {
      return list.map((item) => Math.abs(item));
    });
    const targetSD = targetSlot.sd.map((list) => {
      return list.map((item) => Math.abs(item));
    });

    const processing = props.currentSlot.processing;
    const options = props.currentSlot.options;

    ////////////////////////////////////////////////////////////
    //// Comparison Line Graph
    ////////////////////////////////////////////////////////////
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
          .range([cpLineHeight, 0])
          .base(options.logBase);
      } else {
        yScale = d3
          .scaleLinear()
          .domain([
            Math.min(minCurrent, minTarget),
            Math.max(maxCurrent, maxTarget),
          ])
          .range([cpLineHeight, 0]);
      }

      cpLineSvg.selectAll("*").remove();

      //// Axis
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);
      const xAxisG = cpLineSvg
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left},${margin.top + cpLineHeight})`
        )
        .call(d3.axisBottom(xScale));
      const yAxisG = cpLineSvg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(yScale));

      //// Grid
      if (options.showGrid && !options.zomming) {
        cpLineSvg
          .append("g")
          .attr(
            "transform",
            `translate(${margin.left},${margin.top + cpLineHeight})`
          )
          // .transition().duration(2000)
          .call(xAxis.tickSize(-cpLineHeight).tickFormat(""))
          .attr("stroke", "#d0d0d0")
          .attr("opacity", ".2");

        cpLineSvg
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
          [width, cpLineHeight],
        ])
        .extent([
          [0, 0],
          [width, cpLineHeight],
        ])
        .on("zoom", onZoomed);

      // Initialize Zoom Behavior
      cpLineSvg.call(zoomBehavior.scaleTo, 1);

      // Set Zooming Handler
      function onZoomed(event) {
        cpLineSvg.selectAll("*").remove();
        const newXScale = event.transform.rescaleX(xScale);
        const lineColors = d3.schemeTableau10;
        const yMin = yScale(Math.min(minCurrent, minTarget));
        const area = d3
          .area()
          .x((d, i) => (newXScale(i) < 0 ? 0 : newXScale(i)))
          .y0(yMin)
          .y1((d, i) => (newXScale(i) > width ? yMin : yScale(d)));

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

        const graph = cpLineSvg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        cpLineSvg
          .append("g")
          .attr(
            "transform",
            `translate(${margin.left},${margin.top + cpLineHeight})`
          )
          .call(d3.axisBottom(newXScale));

        cpLineSvg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .call(d3.axisLeft(yScale));

        const newXAxis = d3.axisBottom(newXScale);
        const yAxis = d3.axisLeft(yScale);

        if (options.showGrid) {
          cpLineSvg
            .append("g")
            .attr(
              "transform",
              `translate(${margin.left},${margin.top + cpLineHeight})`
            )
            .call(newXAxis.tickSize(-cpLineHeight).tickFormat(""))
            .attr("stroke", "#d0d0d0")
            .attr("opacity", ".2");

          cpLineSvg
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
        cpLineSvg.call(zoomBehavior);
      } else {
        // Initialize Zoom Behavior
        cpLineSvg.call(zoomBehavior.scaleTo, 1);
        cpLineSvg.on(".zoom", null);
      }
    }

    ////////////////////////////////////////////////////////////
    //// Comparison Scatter Graph (Feature)
    ////////////////////////////////////////////////////////////
    const cpScatterSvg = d3.select(cpScatterGraphRef.current);

    const currentCWT = currentSlot.cwt.map((list) => {
      return list.map((item) => Math.abs(item));
    });
    const targetCWT = targetSlot.cwt.map((list) => {
      return list.map((item) => Math.abs(item));
    });

    if (currentCWT.length > 0 && targetCWT.length > 0) {
      let currFeatures, targetFeatures;

      let results = getFeatures(currentCWT, targetCWT);
      results.then((result) => {
        currFeatures = result[0];
        targetFeatures = result[1];

        const currXValue = currFeatures[processing.xFeature];
        const currYValue = currFeatures[processing.yFeature];
        const targetXValue = targetFeatures[processing.xFeature];
        const targetYValue = targetFeatures[processing.yFeature];

        const currData = currXValue.map((value, idx) => [
          value,
          currYValue[idx],
        ]);
        const targetData = targetXValue.map((value, idx) => [
          value,
          targetYValue[idx],
        ]);

        //// Scale
        let xScale = d3
          .scaleLinear()
          // Domain => Time Series
          .domain([
            Math.min(...[...currXValue, ...targetXValue]),
            Math.max(...[...currXValue, ...targetXValue]),
          ])
          .range([0, width]);

        let yScale = d3
          .scaleLinear()
          .domain([
            Math.min(...[...currYValue, ...targetYValue]),
            Math.max(...[...currYValue, ...targetYValue]),
          ])
          .range([cpScatterHeight, 0]);

        const cellColors = d3.schemeTableau10;

        cpScatterSvg.selectAll("*").remove();

        // Plot Axis
        cpScatterSvg
          .append("g")
          .attr(
            "transform",
            `translate(${margin.left}, ${cpScatterHeight + margin.top})`
          )
          .call(d3.axisBottom(xScale));

        cpScatterSvg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .call(d3.axisLeft(yScale));

        // Plot Points
        const currentCell = cpScatterSvg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .selectAll("circle")
          .data(currData)
          .enter()
          .append("circle")
          .attr("cx", (d) => xScale(d[0]))
          .attr("cy", (d) => yScale(d[1]))
          .attr("fill", cellColors[0])
          .attr("fill-opacity", "0.6")
          .attr("stroke", cellColors[0])
          .attr("stroke-width", "0.1rem")
          .attr("r", 3.5);

        const targetCell = cpScatterSvg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .selectAll("circle")
          .data(targetData)
          .enter()
          .append("circle")
          .attr("cx", (d) => xScale(d[0]))
          .attr("cy", (d) => yScale(d[1]))
          .attr("fill", cellColors[2])
          .attr("fill-opacity", "0.6")
          .attr("stroke", cellColors[2])
          .attr("stroke-width", "0.1rem")
          .attr("r", 3.5);
      });
    }
  }, [width, props.currentSlot, props.targetSlot]);

  return (
    <div>
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
          height={cpLineHeight + margin.top + margin.bottom}
        ></svg>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <svg
          class="px-0 mt-3"
          ref={cpScatterGraphRef}
          width={width + margin.left + margin.right}
          height={cpScatterHeight + margin.top + margin.bottom}
        ></svg>
      </div>
    </div>
  );
};

export default ComparisonGraph;
