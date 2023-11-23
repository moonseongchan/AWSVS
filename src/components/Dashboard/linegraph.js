import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { data1 } from "./data";

const LineGraph = (props) => {
  const [STFTPlot, setSTFTPlot] = useState([]);

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

    // Initialize
    const raw = props.slot.data.map((list) => {
      return list.map((item) => Math.abs(item));
    });
    const plot = props.slot.plot.map((list) => {
      return list.map((item) => Math.abs(item));
    });
    const processing = props.slot.processing;
    const options = props.slot.options;

    if (plot.length > 0) {
      //// Scale
      let xScale = d3
        .scaleLinear()
        // Domain => Time Series
        .domain([0, plot[0].length])
        .range([0, width]);

      let yScale;
      const minRaw = d3.min(raw.flat());
      const maxRaw = d3.max(raw.flat());
      const minPlot = d3.min(plot.flat());
      const maxPlot = d3.max(plot.flat());

      let minValue;
      let maxValue;
      if (!processing.applyCWT && processing.applySignalDenoising) {
        minValue = Math.min(minRaw, minPlot);
        maxValue = Math.max(maxRaw, maxPlot);
      } else {
        minValue = minPlot;
        maxValue = maxPlot;
      }

      //// Logarithm Axis
      if (options.logScale) {
        // Domain => Value (Amplitude, Phase, etc.)
        // Use flat() to find the maximum of all values in data
        yScale = d3
          .scaleLog()
          .domain([minValue, maxValue])
          .range([height, 0])
          .base(options.logBase);
      } else {
        yScale = d3
          .scaleLinear()
          .domain([minValue, maxValue])
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
        const line = d3
          .line()
          .x((d, i) =>
            newXScale(i) < 0
              ? 0
              : newXScale(i) >= width
              ? newXScale(plot[0].length) - margin
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

        plot.forEach((d, idx) => {
          graph
            .append("path")
            .datum(d)
            .attr("fill", "none")
            .attr("stroke", lineColors[idx % lineColors.length])
            .attr("stroke-width", 1.5)
            .attr("d", line);
        });

        //// Not CWT, but SG, Plot Raw Data for Comparison
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

        //// Threshold Line (Drag Interaction)
        const dragStarted = (event, d) => {
          d3.select(".threshold-line").raise().attr("stroke", "gray");
        };

        const dragged = (event, d) => {
          let yPos = Math.max(0, Math.min(height, event.y));
          d3.select(".threshold-line").attr("y1", yPos).attr("y2", yPos);
        };

        const dragEnded = (event, d) => {
          d3.select(".threshold-line").attr("stroke", "orangered");
        };

        if (options.thresholdLine) {
          graph
            .append("line")
            .attr("class", "threshold-line")
            .attr("x1", (d, i) =>
              newXScale(i) < 0
                ? 0
                : newXScale(i) >= width
                ? newXScale(plot[0].length) - margin
                : newXScale(i)
            )
            .attr("x2", width)
            .attr("y1", yScale(minValue + 500))
            .attr("y2", yScale(minValue + 500))
            .attr("stroke", "orangered")
            .attr("stroke-width", 2)
            .attr("cursor", "grab")
            .call(
              d3
                .drag()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded)
            );
        }

        //// Brush (for STFT)
        function beforeBrushStarted(event) {
          const dx = newXScale(50) - newXScale(0); // Use a fixed width when recentering.
          const [[cx]] = d3.pointers(event);
          const [x0, x1] = [cx - dx / 2, cx + dx / 2];
          const [X0, X1] = newXScale.range();
          d3.select(this.parentNode).call(
            brush.move,
            x1 > X1 ? [X1 - dx, X1] : x0 < X0 ? [X0, X0 + dx] : [x0, x1]
          );
        }

        function brushed(event) {
          const selected = [];
          const selection = event.selection;
          if (selection) {
            const [x0, x1] = selection.map(newXScale.invert);
            // Brush 범위 안에 들어오는 X, Y값 저장 (추후 STFT에 사용)
            plot[0].forEach((d, i) => {
              if (x0 <= i && i <= x1) {
                console.log(i, d);
                selected.push({ x: i, y: d });
              }
            });
          }
          setSTFTPlot(selected);
        }

        const brush = d3
          .brushX()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("start brush end", brushed);

        if (processing.applySTFT) {
          svg
            .append("g")
            .attr("class", "brush")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(brush)
            .call(brush.move, [0, 100].map(newXScale))
            .call((g) =>
              g
                .select(".overlay")
                .datum({ type: "selection" })
                .on("mousedown touchstart", beforeBrushStarted)
            );
        } else {
          svg.on(".brush", null);
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
