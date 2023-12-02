
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import './byYear.css';
const usData = require('./Data/output3.json').filter(
  (item) => item.Country === 'United States'
);

function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    let key = obj[property];
    if (key !== undefined && key !== '') {
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
    }
    return acc;
  }, {});
}
const groupedData = groupBy(usData, "Year");
console.log(groupedData);

function groupByTwo(objectArray, property1, property2) {
  return objectArray.reduce(function (acc, obj) {
    let key1 = obj[property1];
    let key2 = obj[property2];
    if (key1 !== undefined && key1 !== '' && key2 !== undefined && key2 !== '') {
      if (!acc[key1]) {
        acc[key1] = {};
      }
      if (!acc[key1][key2]) {
        acc[key1][key2] = [];
      }
      acc[key1][key2].push(obj);
    }
    return acc;
  }, {});
}

// Example usage
const groupedDataByTargetType = groupByTwo(usData, 'Year', 'Target_type');
const groupedDataByWeaponType = groupByTwo(usData, 'Year', 'Weapon_type');
// Now, groupedDataByTargetType and groupedDataByWeaponType will have the data grouped by Year and Target_type/Weapon_type, respectively


const ByYear = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  useEffect(() => {
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 }; // Increased bottom margin for axis labels
    d3.select("#line-chart").html("");
    d3.select("#pie-chart").html("");
    const svg = d3.select("#line-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scaleLinear()
      .domain([d3.min(Object.keys(groupedData)), d3.max(Object.keys(groupedData))])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(Object.values(groupedData), d => d.length)])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(+d[0]))
      .y(d => y(d[1].length));

    const xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));

    // Tooltip functions
    const tooltip = d3.select("#line-chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.1)");

    const showTooltip = (event, year, data) => {
      setSelectedYear(year);
      
      const yearData = groupedData[year];
      const totalCasualties = yearData.reduce((sum, item) => sum + item.casualities, 0);
      const yValue = yearData.length;

      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(`Year: ${year}<br/>Number of Terrorist Attacks: ${yValue}<br/>Total Casualties (Injured + Killed): ${totalCasualties}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 50) + "px");
    };

    const hideTooltip = () => {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    };

    // Add the path element for the line chart
    svg.append("path")
      .datum(Object.entries(groupedData))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add data points as circles
    svg.selectAll('circle')
      .data(Object.entries(groupedData))
      .enter()
      .append('circle')
      .attr('cx', d => x(+d[0]))
      .attr('cy', d => y(d[1].length))
      .attr('r', 4)
      .attr('fill', d => (selectedDataPoint === d[0]) ? 'orange' : 'steelblue')
      .style('opacity', 0.7)
      .on('click', (event, d) => {
        const [year, data] = d;

        // Toggle color on click
        setSelectedDataPoint((selectedDataPoint === year) ? null : year);
        showTooltip(event, year, data.length);
      });

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("x", width - margin.right)
      .attr("y", 30) // Adjusted y position
      .attr("text-anchor", "end")
      .text("Year");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40) // Adjusted y position
      .attr("dy", "-1.5em")
      .attr("text-anchor", "end")
      .text("Number of Terrorist Attacks");

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("text-decoration", "underline")
      .text("Number of Terrorist Attacks with their Corresponding Years in the US");

      if (selectedDataPoint !== null) {
        generatePieChart(selectedYear);
      }
  }, [selectedYear, selectedDataPoint]);
  const generatePieChart = (year) => {
    // Check if the selected year exists in the data
    if (groupedDataByTargetType[year]) {
      // Filter data for the selected year
      const dataForYear = groupedDataByTargetType[year];


      const totalWidth = 600; 
      const totalHeight = 300;
      const margin = { top: 10, right: 10, bottom: 60, left: 10 };
      const width = totalWidth - margin.left - margin.right;
      const height = totalHeight - margin.top - margin.bottom;
      const radius = Math.min(width, height) / 2;
  
      // Extract groups and lengths for the selected year
      const pieData = Object.entries(dataForYear).map(([group, items]) => ({
        group,
        length: items.length,
      }));
      console.log("pieData", pieData);
  
      // Set up color scale
      const color = d3.scaleOrdinal(d3.schemeCategory10);
  
      // Clean up the color scale domain
      color.domain(pieData.map(d => d.group));
  
      // Create a pie chart layout
      const pie = d3.pie().value((d) => d.length);
  
      // Create an arc function for generating pie slices
      const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
  
      // Create an SVG element
      const svg = d3.select("#pie-chart").html("").append("svg")
  .attr("width", totalWidth)
  .attr("height", totalHeight)
  .append("g")
  .attr('transform', `translate(${totalWidth / 4},${totalHeight / 2})`);
  
      // Generate pie slices
      const arcs = svg.selectAll("arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");
  
      // Draw each slice
      arcs.append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc);
  
      // Add labels to each slice
      arcs.append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text((d) => `${d.data.length}`);
  
      // Legend creation
      const legend = svg.selectAll(".legend")
        .data(pieData.map(d => d.group))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 15})`);

  
        legend.append("rect")
        .attr("x", width - 200)
        .attr("y", -100)
        .attr("width", 8) 
        .attr("height", 8)
        .style("fill", (d, i) => color(i));

      legend.append("text")
        .attr("x", width - 200)
        .attr("y", -95)
        .attr("dy", ".1em") 
        .style("text-anchor", "end")
        .style("font-size", "10px") 
        .text(d => d);

        svg.append("text")
      .attr("x", 110)
      .attr("y", -130)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("text-decoration", "underline")
      .text("Target Type of the Terrorist Attack");

    }
  };
  
  
  
  return (
    <div>
      <div id="line-chart">
        {/* Your line chart content goes here */}
      </div>
      <div id="pie-chart">
        {/* The pie chart will be rendered here */}
      </div>
    </div>
  );
  
};

export default ByYear;