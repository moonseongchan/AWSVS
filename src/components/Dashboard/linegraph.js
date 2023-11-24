import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";

import "./Dashboard.scss";

const LineGraph = (props) => {
  const lineGraphRef = useRef(null);
  const stftGraphRef = useRef(null);

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

  const initialWidth = getGraphWidth() - margin.left - margin.right;
  const [width, setWidth] = useState(initialWidth);
  const height = 250 - margin.top - margin.bottom;
  const heightSTFT = 150 - margin.top - margin.bottom;

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    const svg = d3.select(lineGraphRef.current);
    const stftSvg = d3.select(stftGraphRef.current);

    // Initialize
    const raw = props.slot.data.map((list) => {
      return list.map((item) => Math.abs(item));
    });
    const plot = props.slot.plot.map((list) => {
      return list.map((item) => Math.abs(item));
    });
    const sd = props.slot.sd.map((list) => {
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
      if (!processing.applyCWT && processing.applySD) {
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

        // For Synchronize with Spectrogram
        const [minX, maxX] = newXScale.domain();
        props.handleScaleChange(props.slot.id, [minX, maxX]);

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

        //// Line Hover Interaction
        if (processing.applyCWT && options.hover) {
          let lineIdx = -1;
          let guideLine = null;
          let isGuidelineOn = false;

          const paths = graph.selectAll("path");
          paths.on("mouseover", function (d, idx) {
            // 모든 라인의 스타일을 원래 스타일로 되돌리기
            paths
              .attr("stroke-width", 1.5)
              .attr("opacity", "0.3")
              .attr("cursor", "pointer");

            // 마우스 오버된 라인 강조
            d3.select(this)
              .attr("stroke-width", 3)
              .attr("opacity", "1")
              .attr("cursor", "pointer");
            lineIdx = idx;
          });

          // 마우스가 라인 위에서 벗어날 때 스타일 원래대로 되돌리기
          paths.on("mouseout", function () {
            paths
              .attr("stroke-width", 1.5)
              .attr("opacity", "1")
              .attr("cursor", "pointer"); 
            lineIdx = -1;
          });

          // // Vertical Guideline
          // function drawGuideline(x_point) {
          //   svg.select(".guide-line").remove();
          //   // 마우스 위치에 가이드 라인 생성

          //   if (x_point <= newXScale.domain()[0] || x_point >= width) {
          //     return;
          //   }
          //   guideLine = graph
          //     .append("line")
          //     .attr("class", "guide-line")
          //     .attr("x1", x_point)
          //     .attr("x2", x_point)
          //     .attr("y1", 0)
          //     .attr("y2", height)
          //     .attr("stroke", "orangered")
          //     .attr("stroke-dasharray", "3,3")
          //     .attr("stroke-width", 1.5)
          //     .attr("opacity", 0.7);
          // }

          // // Click 시 Guildeline 추가 / 삭제
          // svg.on("click", function (event, d) {
          //   if (isGuidelineOn) {
          //     isGuidelineOn = false;
          //     guideLine.remove();
          //     guideLine = null;
          //   } else {
          //     isGuidelineOn = true;
          //   }
          // });

          // // 마우스 클릭 시 세로 가이드 라인 생성 또는 삭제
          // paths.on("click", function (event, d) {
          //   const clickedPath = d3.select(this);

          //   // 클릭된 선의 x 좌표 값 가져오기
          //   //const pathNode = clickedPath.node();
          //   //const pathLength = pathNode.getTotalLength();
          //   //const mouse = d3.pointer(pathNode);

          // // 마우스 따라 이동하는 Guideline 처리
          // });
          // svg.on("mousemove", function (event) {
          //   if (isGuidelineOn) {
          //     const point_x = d3.pointer(event)[0] - margin.left;
          //     drawGuideline(point_x);
          //   }
          // });
        }

        //// Not CWT, but SG, Plot Raw Data for Comparison
        if (!processing.applyCWT && processing.applySD) {
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
            .attr("stroke-width", 1.5)
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

        async function brushed(event) {
          const selection = event.selection;
          let time;
          if (selection) {
            const [x0, x1] = selection.map(newXScale.invert);
            time = { start: parseInt(x0), end: parseInt(x1) };
          }

          //////////////////////////////////////////
          // STFT Plot
          //////////////////////////////////////////
          // Get STFT Result
          let stftResult;
          const formData = new FormData();
          formData.append("data", JSON.stringify(sd));
          formData.append("processing", JSON.stringify(processing));
          formData.append("time", JSON.stringify(time));

          try {
            const response = await axios.post(
              "http://localhost:5000/stft",
              formData,
              { withCredentials: true }
            );
            // console.log(response.data.result);
            stftResult = response.data.result;
          } catch (error) {
            console.error("Error Uploading File:", error);
          }

          let stftPlot = [];
          for (let i = time.start; i <= time.end; i++) {
            stftPlot.push([
              parseInt(i - (time.start + time.end) / 2),
              stftResult[i - time.start],
            ]);
          }

          stftSvg.selectAll("*").remove();

          const graphSTFT = stftSvg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

          // Scale
          let xScaleSTFT = d3
            .scaleBand()
            .domain(stftPlot.map((d) => d[0]))
            .range([0, width])
            .padding(0.8);

          let yScaleSTFT = d3
            .scaleLinear()
            .domain([0, d3.max(stftPlot, (d) => d[1])])
            .range([heightSTFT, 0]);

          const lineColorsSTFT = d3.schemeTableau10;

          graphSTFT
            .selectAll(".bar")
            .data(stftPlot)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScaleSTFT(d[0]) - xScaleSTFT.bandwidth() / 2)
            .attr("y", (d) => yScaleSTFT(d[1]))
            .attr("width", xScaleSTFT.bandwidth())
            .attr("height", (d) => heightSTFT - yScaleSTFT(d[1]))
            .attr("fill", lineColorsSTFT[0]);

          // Axis
          const xAxisSTFT = d3
            .axisBottom(xScaleSTFT)
            .tickValues(
              xScaleSTFT
                .domain()
                .filter((value) => value === 0 || value % 10 === 0)
            );
          const yAxisSTFT = d3.axisLeft(yScaleSTFT).ticks(6, "f");
          stftSvg
            .append("g")
            .attr(
              "transform",
              `translate(${margin.left},${margin.top + heightSTFT})`
            )
            .call(xAxisSTFT);
          stftSvg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(yAxisSTFT);
        }

        const brush = d3
          .brushX()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("end", brushed);

        if (processing.applySTFT) {
          svg
            .append("g")
            .attr("class", "brush")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(brush)
            .call(brush.move, [50, 150].map(newXScale))
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
          ref={lineGraphRef}
          width={width + margin.left + margin.right}
          height={height + margin.top + margin.bottom}
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
        {props.slot.processing.applySTFT && (
          <svg
            class="px-0 mt-3"
            ref={stftGraphRef}
            width={width + margin.left + margin.right}
            height={heightSTFT + margin.top + margin.bottom}
          ></svg>
        )}
      </div>
    </div>
  );
};

export default LineGraph;
