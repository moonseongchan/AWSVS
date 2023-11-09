//example https://velog.io/@dalkong/Flask-React-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0
import React, { useState, useEffect } from 'react';
import './App.css';
import * as d3 from 'd3';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {

    // ##### argument format ######
    // # param1: reserved
    // # param2: reserved
    // # param3: reserved
    // # param4: processing method [raw, pca, sg, cwt]
    // # param5: hyperparams1 for processing method
    // # param6: hyperparams2 for processing method


    const param0 = 'get';


    const param1 = 'all_type'; // Ipatov, STS1, STS2
    const param2 = 'all_env';  // LOS, NLOS data 
    const param3 = 'reserved';
    const param4 = 'raw';
    const param5 = 'hyper1';
    const param6 = 'hyper2';
    // ... etc.

    

    const apiUrl = `/${param0}?param1=${param1}&param2=${param2}&param3=${param3}&param4=${param4}&param5=${param5}&param6=${param6}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const svg = d3.select("#chart");
      const margin = { top: 20, right: 20, bottom: 40, left: 40 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      const lineColors = ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'maroon', 'navy', 'pink', 'brown'];
      const x = d3
        .scaleLinear()
        .domain([0, data[0].length - 1])
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([d3.min(data.flat()), d3.max(data.flat())]) // Use flat() to find the maximum of all values in data
        .range([height, 0]);

      const line = d3
        .line()
        .x((d, i) => x(i))
        .y((d) => y(d));

      svg.selectAll("*").remove();
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      g.append("g").call(d3.axisLeft(y));

      // Create a line graph for each data array in the data array
      data.forEach((lineData, index) => {
        g.append("path")
          .datum(lineData)
          .attr("fill", "none")
          .attr("stroke", lineColors[index % lineColors.length]) 
          .attr("stroke-width", 1.5)
          .attr("d", line);
      });
    }
  }, [data]);

  return (
    <div className="App">
      <h1>Test plot</h1>
      <div id="chart-container">
        <svg id="chart" width="800" height="400"></svg>
      </div>
    </div>
  );
}

export default App;
