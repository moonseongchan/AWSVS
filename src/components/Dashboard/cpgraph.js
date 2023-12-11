import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";

const ComparisonGraph = (props) => {
  // To resize the width of the graph
  const margin = { top: 10, right: 30, bottom: 40, left: 60 };
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
      // const xAxisG = cpLineSvg
      //   .append("g")
      //   .attr(
      //     "transform",
      //     `translate(${margin.left},${margin.top + cpLineHeight})`
      //   )
      //   .call(d3.axisBottom(xScale))
      //   .append('text')
      //   .attr('x', width / 2)
      //   .attr('y', margin.bottom - 5) // Adjust the position of the label
      //   .attr('text-anchor', 'middle')
      //   .attr('fill', 'black')
      //   .style("font-size", `14px`)
      //   .text("xAxisLabel");

      // const yAxisG = cpLineSvg
      //   .append("g")
      //   .attr("transform", `translate(${margin.left},${margin.top})`)
      //   .call(d3.axisLeft(yScale))
      //   .append('text')
      //   .attr('transform', 'rotate(-90)')
      //   .attr('x', -cpScatterHeight / 2)
      //   .attr('y', -margin.left + 20) // Adjust the position of the label
      //   .attr('text-anchor', 'middle')
      //   .attr('fill', 'black')
      //   .style("font-size", `14px`)
      //   .text("yAxisLabel");

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
          .call(d3.axisBottom(newXScale))
          .append("text")
          .attr("x", width / 2)
          .attr("y", margin.bottom - 5) // Adjust the position of the label
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .style("font-size", `14px`)
          .text("Sample Index");

        cpLineSvg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .call(d3.axisLeft(yScale))
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -cpLineHeight / 2 + 6)
          .attr("y", -margin.left + 10) // Adjust the position of the label
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .style("font-size", `14px`)
          .text("Amplitude [mV]");

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

      // Information Width & Height
      const cpScatterWidth = width * 0.8;
      const cpInfoWidth = width * 0.15;
      const cpWidthGap = width * 0.05;
      const cpBarHeight = cpScatterHeight * 0.425;
      const cpCmHeight = cpScatterHeight * 0.45;
      const cpHeightGap = cpScatterHeight * 0.05;

      const results = getFeatures(currentCWT, targetCWT);
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

        const xMin = Math.min(...[...currXValue, ...targetXValue]);
        const xMax = Math.max(...[...currXValue, ...targetXValue]);
        const yMin = Math.min(...[...currYValue, ...targetYValue]);
        const yMax = Math.max(...[...currYValue, ...targetYValue]);

        //// Scale
        let xScale = d3
          .scaleLinear()
          // Domain => Time Series
          .domain([xMin, xMax])
          .range([0, cpScatterWidth]);

        let yScale = d3
          .scaleLinear()
          .domain([yMin, yMax])
          .range([cpScatterHeight, 0]);

        const cpColors = d3.schemeTableau10;

        cpScatterSvg.selectAll("*").remove();

        // Plot Axis
        cpScatterSvg
          .append("g")
          .attr(
            "transform",
            `translate(${margin.left}, ${cpScatterHeight + margin.top})`
          )
          .call(d3.axisBottom(xScale))
          .append("text")
          .attr("x", cpScatterWidth / 2)
          .attr("y", margin.bottom - 5) // Adjust the position of the label
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .style("font-size", `14px`)
          .text(processing.xFeature);

        cpScatterSvg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .call(d3.axisLeft(yScale))
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -cpScatterHeight / 2 + 5)
          .attr("y", -margin.left + 10) // Adjust the position of the label
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .style("font-size", `14px`)
          .text(processing.yFeature);

        // Plot Points
        cpScatterSvg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .selectAll("circle")
          .data(currData)
          .enter()
          .append("circle")
          .attr("class", "currentPoint")
          .attr("cx", (d) => xScale(d[0]))
          .attr("cy", (d) => yScale(d[1]))
          .attr("fill", cpColors[0])
          .attr("fill-opacity", "0.7")
          .attr("stroke", cpColors[0])
          .attr("stroke-width", "0.1rem")
          .attr("r", 4.5);

        cpScatterSvg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .selectAll("circle")
          .data(targetData)
          .enter()
          .append("circle")
          .attr("class", "targetPoint")
          .attr("cx", (d) => xScale(d[0]))
          .attr("cy", (d) => yScale(d[1]))
          .attr("fill", cpColors[2])
          .attr("fill-opacity", "0.7")
          .attr("stroke", cpColors[2])
          .attr("stroke-width", "0.1rem")
          .attr("r", 4.5);

        let xCfPlot0 = xScale(Math.min(...[...currXValue, ...targetXValue]));
        let yCfPlot0 = yScale(Math.min(...[...currYValue, ...targetYValue]));
        let xCfPlot1 = xScale(Math.max(...[...currXValue, ...targetXValue]));
        let yCfPlot1 = yScale(Math.max(...[...currYValue, ...targetYValue]));

        // 구분선으로 분류되는 비율 변수
        let cfCurrentUpperRate, cfCurrentLowerRate;
        let cfTargetUpperRate, cfTargetLowerRate;

        //// Classification Line Interaction
        // Drag Start Event Function
        function dragStarted() {
          d3.select(this).raise();
          d3.selectAll(".cfLine").raise();
        }

        // Dragging Event Function
        function dragged(event) {
          const className = this.getAttribute("class");
          const cfLine = d3.selectAll(".cfLine");

          let xPos = event.x;
          let yPos = event.y;
          if (xScale.invert(event.x) < xMin) {
            xPos = xScale(xMin);
          } else if (xScale.invert(event.x) > xMax) {
            xPos = xScale(xMax);
          }
          if (yScale.invert(event.y) < yMin) {
            yPos = yScale(yMin);
          } else if (yScale.invert(event.y) > yMax) {
            yPos = yScale(yMax);
          }

          // console.log(xCfPlot0, yCfPlot0, xCfPlot1, yCfPlot1);
          // console.log(xPos, yPos, event.x, event.y);

          d3.select(this).attr("cx", xPos).attr("cy", yPos);
          if (className === "cfPoint0") {
            cfLine.attr(
              "d",
              d3.line()([
                [xPos, yPos],
                [xCfPlot1, yCfPlot1],
              ])
            );
            xCfPlot0 = xPos;
            yCfPlot0 = yPos;
          } else if (className === "cfPoint1") {
            cfLine.attr(
              "d",
              d3.line()([
                [xCfPlot0, yCfPlot0],
                [xPos, yPos],
              ])
            );
            xCfPlot1 = xPos;
            yCfPlot1 = yPos;
          }
        }

        // Drag End Event Function
        function dragEnded() {
          // y = ax + b
          let xCfPoint0 = xScale.invert(xCfPlot0);
          let yCfPoint0 = yScale.invert(yCfPlot0);
          let xCfPoint1 = xScale.invert(xCfPlot1);
          let yCfPoint1 = yScale.invert(yCfPlot1);
          const a = (yCfPoint1 - yCfPoint0) / (xCfPoint1 - xCfPoint0);
          const b = yCfPoint1 - a * xCfPoint1;

          // console.log(xCfPoint0, yCfPoint0, xCfPoint1, yCfPoint1);
          // console.log("a :", a);
          // console.log("b :", b);

          // Calcultate Total Error
          let currentError = 0;
          let targetError = 0;
          // Count Current Point (Upper & Lower)
          const currentPoints = d3.selectAll(".currentPoint");
          let cfCurrentUpper = 0;
          let cfCurrentLower = 0;
          currentPoints._groups[0].forEach((d) => {
            if (a === Infinity || b === Infinity) {
              if (d.__data__[0] - xCfPoint0 < 0) {
                cfCurrentUpper += 1;
              } else {
                cfCurrentLower += 1;
              }

              currentError += parseFloat(Math.abs(xCfPoint0 - d.__data__[0]));
            } else {
              if (d.__data__[1] >= d.__data__[0] * a + b) {
                cfCurrentUpper += 1;
              } else {
                cfCurrentLower += 1;
              }

              currentError += parseFloat(
                Math.abs(a * d.__data__[0] - d.__data__[1] + b) /
                  Math.sqrt(a * a + 1)
              );
            }
          });
          currentError /= currentPoints._groups[0].length;

          // Count Target Point (Upper & Lower)
          const targetPoints = d3.selectAll(".targetPoint");
          let cfTargetUpper = 0;
          let cfTargetLower = 0;
          targetPoints._groups[0].forEach((d) => {
            if (a === Infinity || b === Infinity) {
              if (d.__data__[0] - xCfPoint0 < 0) {
                cfTargetUpper += 1;
              } else {
                cfTargetLower += 1;
              }

              targetError += parseFloat(Math.abs(xCfPoint0 - d.__data__[0]));
            } else {
              if (d.__data__[1] >= d.__data__[0] * a + b) {
                cfTargetUpper += 1;
              } else {
                cfTargetLower += 1;
              }

              targetError += parseFloat(
                Math.abs(a * d.__data__[0] - d.__data__[1] + b) /
                  Math.sqrt(a * a + 1)
              );
            }
          });
          targetError /= targetPoints._groups[0].length;

          cfCurrentUpperRate =
            cfCurrentUpper / (cfCurrentUpper + cfCurrentLower);
          cfCurrentLowerRate = 1 - cfCurrentUpperRate;
          cfTargetUpperRate = cfTargetUpper / (cfTargetUpper + cfTargetLower);
          cfTargetLowerRate = 1 - cfTargetUpperRate;

          // console.log("Current :", cfCurrentUpper, "/", cfCurrentLower);
          // console.log("Target :", cfTargetUpper, "/", cfTargetLower);
          // console.log("Current :", cfCurrentUpperRate, "/", cfCurrentLowerRate);
          // console.log("Target :", cfTargetUpperRate, "/", cfTargetLowerRate);
          // console.log(currentError, targetError);

          ///////////////////////////////////////////////////////////
          // Confusion Matrix
          ///////////////////////////////////////////////////////////
          cpScatterSvg.select("g.cmGraph").remove();

          const cmColorScale = d3
            .scaleSequential(d3.interpolateBlues)
            .domain([0, 1]);
          const cmValueColorScale = d3
            .scaleSequential(d3.interpolateGreys)
            .domain([1, 0]);
          const cmGraph = cpScatterSvg
            .append("g")
            .attr("class", "cmGraph")
            .attr(
              "transform",
              `translate(${cpWidthGap / 2 + margin.left + cpScatterWidth}, ${
                margin.top + cpScatterHeight / 2
              })`
            )
            .attr("stroke", "black")
            .attr("stroke-width", "0.05rem");

          // For Confusion Matrix Constraint
          if (cfCurrentUpperRate < 0.5) {
            const temp1 = cfCurrentUpperRate;
            cfCurrentUpperRate = cfCurrentLowerRate;
            cfCurrentLowerRate = temp1;

            const temp2 = cfTargetUpperRate;
            cfTargetUpperRate = cfTargetLowerRate;
            cfTargetLowerRate = temp2;
          }

          let confusionMatrix = [
            [cfCurrentUpperRate, cfCurrentLowerRate],
            [cfTargetUpperRate, cfTargetLowerRate],
          ];

          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
              cmGraph
                .append("rect")
                .attr("x", j * (cpInfoWidth / 2) + cpWidthGap / 2)
                .attr("y", i * (cpCmHeight / 2) + cpHeightGap)
                .attr("width", cpInfoWidth / 2)
                .attr("height", cpCmHeight / 2)
                .attr("fill", cmColorScale(confusionMatrix[i][j]));
            }
          }

          // Plot Value
          cmGraph
            .append("text")
            .attr("x", cpWidthGap / 2 + cpInfoWidth / 4)
            .attr("y", cpHeightGap + cpCmHeight / 4)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.75rem")
            .attr("stroke", cmValueColorScale(cfCurrentUpperRate))
            .text(cfCurrentUpperRate.toFixed(4));

          cmGraph
            .append("text")
            .attr("x", cpWidthGap / 2 + (cpInfoWidth * 3) / 4)
            .attr("y", cpHeightGap + cpCmHeight / 4)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.75rem")
            .attr("stroke", cmValueColorScale(cfCurrentLowerRate))
            .text(cfCurrentLowerRate.toFixed(4));

          cmGraph
            .append("text")
            .attr("x", cpWidthGap / 2 + cpInfoWidth / 4)
            .attr("y", cpHeightGap + (cpCmHeight * 3) / 4)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.75rem")
            .attr("stroke", cmValueColorScale(cfTargetUpperRate))
            .text(cfTargetUpperRate.toFixed(4));

          cmGraph
            .append("text")
            .attr("x", cpWidthGap / 2 + (cpInfoWidth * 3) / 4)
            .attr("y", cpHeightGap + (cpCmHeight * 3) / 4)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.75rem")
            .attr("stroke", cmValueColorScale(cfTargetLowerRate))
            .text(cfTargetLowerRate.toFixed(4));

          // Confusion Matrix Label
          cmGraph
            .append("text")
            .attr("x", cpWidthGap / 2 + cpInfoWidth / 4)
            .attr("y", cpHeightGap / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.75rem")
            .text("Current");

          cmGraph
            .append("text")
            .attr("x", cpWidthGap / 2 + (cpInfoWidth * 3) / 4)
            .attr("y", cpHeightGap / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.75rem")
            .text("Target");

          cmGraph
            .append("text")
            .attr(
              "transform",
              `translate(${cpWidthGap / 4}, ${
                cpHeightGap + cpCmHeight / 4
              })rotate(${-90})`
            )
            .attr("text-anchor", "middle")
            .attr("font-size", "0.75rem")
            .text("Current");

          cmGraph
            .append("text")
            .attr(
              "transform",
              `translate(${cpWidthGap / 4}, ${
                cpHeightGap + (3 * cpCmHeight) / 4
              })rotate(${-90})`
            )
            .attr("text-anchor", "middle")
            .attr("font-size", "0.75rem")
            .text("Target");

          ///////////////////////////////////////////////////////////
          // Error Bar
          ///////////////////////////////////////////////////////////
          cpScatterSvg.select("g.errBar").remove();

          const errBarGraph = cpScatterSvg
            .append("g")
            .attr("class", "errBar")
            .attr(
              "transform",
              `translate(${cpWidthGap / 2 + margin.left + cpScatterWidth}, ${
                margin.top
              })`
            )
            .attr("stroke", "black")
            .attr("stroke-width", "0.05rem");

          let xScaleBar = d3
            .scaleBand()
            .domain(["Current", "Target"])
            .range([0, cpInfoWidth])
            .padding(0.5);
          let yScaleBar = d3
            .scaleLinear()
            .domain([0, Math.max(currentError, targetError)])
            .range([cpBarHeight, 0]);

          errBarGraph
            .append("g")
            .attr("transform", `translate(${cpWidthGap / 2},${cpBarHeight})`)
            .call(d3.axisBottom(xScaleBar));

          errBarGraph
            .append("g")
            .attr("transform", `translate(${cpWidthGap / 2},${0})`)
            .call(d3.axisLeft(yScaleBar).ticks(6, "f"));

          // console.log(currentError, targetError);

          errBarGraph
            .append("g")
            .attr("transform", `translate(${cpWidthGap / 2},${0})`)
            .selectAll(".bar")
            .data([
              ["Current", currentError, cpColors[0]],
              ["Target", targetError, cpColors[2]],
            ])
            .enter()
            .append("rect")
            .attr("x", (d) => xScaleBar(d[0]))
            .attr("y", (d) => yScaleBar(d[1]))
            .attr("width", xScaleBar.bandwidth())
            .attr("height", (d) => cpBarHeight - yScaleBar(d[1]))
            .attr("fill", (d) => d[2])
            .attr("fill-opacity", "0.7");
        }

        // Plot Line
        cpScatterSvg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .append("path")
          .attr("class", "cfLine")
          .attr("stroke", "black")
          .attr("stroke-dasharray", "0.5rem")
          .attr(
            "d",
            d3.line()([
              [xScale(xMin), yScale(yMin)],
              [xScale(xMax), yScale(yMax)],
            ])
          );

        // Plot Edge Points
        cpScatterSvg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .selectAll("circle")
          .data([
            [xMin, yMin],
            [xMax, yMax],
          ])
          .enter()
          .append("circle")
          .attr("class", (d, i) => "cfPoint" + i)
          .attr("cx", (d) => xScale(d[0]))
          .attr("cy", (d) => yScale(d[1]))
          .attr("fill", "white")
          .attr("stroke", "black")
          .attr("stroke-width", "0.1rem")
          .attr("r", 5.5)
          .attr("cursor", "pointer")
          .call(
            d3
              .drag()
              .on("start", dragStarted)
              .on("drag", dragged)
              .on("end", dragEnded)
          );

        // Plot Initial Confusion Matrix
        cpScatterSvg.select("g.cmGraph").remove();

        const cmGraph = cpScatterSvg
          .append("g")
          .attr("class", "cmGraph")
          .attr(
            "transform",
            `translate(${cpWidthGap / 2 + margin.left + cpScatterWidth}, ${
              margin.top + cpScatterHeight / 2
            })`
          )
          .attr("stroke", "black")
          .attr("stroke-width", "0.05rem");

        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            cmGraph
              .append("rect")
              .attr("x", j * (cpInfoWidth / 2) + cpWidthGap / 2)
              .attr("y", i * (cpCmHeight / 2) + cpHeightGap)
              .attr("width", cpInfoWidth / 2)
              .attr("height", cpCmHeight / 2)
              .attr("fill", "white");
          }
        }

        // Confusion Matrix Label
        cmGraph
          .append("text")
          .attr("x", cpWidthGap / 2 + cpInfoWidth / 4)
          .attr("y", cpHeightGap / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "0.75rem")
          .text("Current");

        cmGraph
          .append("text")
          .attr("x", cpWidthGap / 2 + (cpInfoWidth * 3) / 4)
          .attr("y", cpHeightGap / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "0.75rem")
          .text("Target");

        cmGraph
          .append("text")
          .attr(
            "transform",
            `translate(${cpWidthGap / 4}, ${
              cpHeightGap + cpCmHeight / 4
            })rotate(${-90})`
          )
          .attr("text-anchor", "middle")
          .attr("font-size", "0.75rem")
          .text("Current");

        cmGraph
          .append("text")
          .attr(
            "transform",
            `translate(${cpWidthGap / 4}, ${
              cpHeightGap + (3 * cpCmHeight) / 4
            })rotate(${-90})`
          )
          .attr("text-anchor", "middle")
          .attr("font-size", "0.75rem")
          .text("Target");

        // Plot Initial Confusion Matrix
        cpScatterSvg.select("g.errBar").remove();

        const errBarGraph = cpScatterSvg
          .append("g")
          .attr("class", "errBar")
          .attr(
            "transform",
            `translate(${cpWidthGap / 2 + margin.left + cpScatterWidth}, ${
              margin.top
            })`
          )
          .attr("stroke", "black")
          .attr("stroke-width", "0.05rem");

        let xScaleBar = d3
          .scaleBand()
          .domain(["Current", "Target"])
          .range([0, cpInfoWidth])
          .padding(0.5);
        let yScaleBar = d3.scaleLinear().domain([]).range([cpBarHeight, 0]);

        errBarGraph
          .append("g")
          .attr("transform", `translate(${cpWidthGap / 2},${cpBarHeight})`)
          .call(d3.axisBottom(xScaleBar));

        errBarGraph
          .append("g")
          .attr("transform", `translate(${cpWidthGap / 2},${0})`)
          .call(d3.axisLeft(yScaleBar));
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
          class="px-0"
          style={{ marginTop: "1.25rem" }}
          ref={cpScatterGraphRef}
          width={width + margin.left + margin.right}
          height={cpScatterHeight + margin.top + margin.bottom}
        ></svg>
      </div>
    </div>
  );
};

export default ComparisonGraph;
