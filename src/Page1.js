import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';  // Import D3 library
import './Page1.css';
const data = require('./Data/output3.json');

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

const groupedData = groupBy(data, "Group");
// Convert the object into an array of key-value pairs
const groupedArray = Object.entries(groupedData);

// Sort the array based on the length of the arrays (number of elements in each group)
groupedArray.sort((a, b) => b[1].length - a[1].length);

const groupCount = groupedArray.slice(1, 15);


const processedData = {};

// Process data for each group
groupCount.forEach(([group, groupData]) => {
  // Initialize an object to store country-wise casualties
  const countryCasualties = {};

  // Process each entry in the group data
  groupData.forEach(entry => {
    const country = entry.Country;
    const casualties = entry.casualities; // Make sure the property name matches your data

    // Update or initialize the country's casualties
    countryCasualties[country] = (countryCasualties[country] || 0) + casualties;
  });

  // Store the results for the group
  processedData[group] = countryCasualties;
});

console.log(processedData);

const counts_all = Object.keys(groupedData).map(key => {
  return {
    group: key,
    count: groupedData[key].length
  };
});

// Sort the counts array
counts_all.sort((a, b) => b.count - a.count);

// Keep only the first 20 values
const counts = counts_all.slice(1, 15);

// Move these outside the initChart function
const handleMouseOver = function (event, d, setHoveredGroup) {
  d3.select(this)
    .transition()
    .duration(100)
    .style('fill', 'black'); // Change color on mouseover

  setHoveredGroup(d.group); // Update the state with the hovered group
};

const handleMouseOut = function (event, d, color, setHoveredGroup) {
  d3.select(this)
    .transition()
    .duration(100)
    .style('fill', d => color(d.group)); // Restore original color on mouseout

  setHoveredGroup(null); // Reset the state when the mouse is not over any bar
};

function initChart(setHoveredGroup) {
  const totalWidth = 900; // Total width of the SVG container
  const totalHeight = 900;
  const margin = { top: 30, right: 30, bottom: 50, left: 230 }; // Increased bottom margin for x-axis label
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom-200;

  const svg = d3.select('#bar-svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(counts, d => d.count)])
    .range([margin.left, width]);

  const yScale = d3.scaleBand()
    .domain(counts.map(d => d.group))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  const color = d3.scaleOrdinal()
    .domain(counts.map(d => d.group))
    .range(d3.quantize(t => d3.interpolatePlasma(t * 0.8 + 0.1), counts.length));

  svg.selectAll('rect')
    .data(counts)
    .enter().append('rect')
    .attr('x', margin.left)
    .attr('y', d => yScale(d.group))
    .attr('width', d => xScale(d.count) - margin.left)
    .attr('height', yScale.bandwidth())
    .style('fill', d => color(d.group))
    .on('mouseover', function (event, d) {
      handleMouseOver.call(this, event, d, setHoveredGroup);
    })
    .on('mouseout', function (event, d) {
      handleMouseOut.call(this, event, d, color, setHoveredGroup);
    });

  // X-Axis
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .append('text')
    .attr('x', width / 2)
    .attr('y', margin.bottom - 10) // Adjusted y-coordinate for x-axis label
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Count');

  // Y-Axis
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 10) // Adjusted y-coordinate for y-axis label
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Group');

  // Legend
  const legend = svg.append('g')
  .attr('transform', `translate(${width + margin.right - 210},${margin.top+ 300})`);

legend.selectAll('rect')
  .data(counts)
  .enter().append('rect')
  .attr('x', 0)
  .attr('y', (d, i) => i * 15)
  .attr('width', 10)
  .attr('height', 10)
  .style('fill', d => color(d.group));

legend.selectAll('text')
  .data(counts)
  .enter().append('text')
  .attr('x', 15)
  .attr('y', (d, i) => i * 15 + 9)
  .style('font-size', '8px')
  .text(d => d.group);


  // Title
  svg.append('text')
    .attr('x', totalWidth / 2)
    .attr('y', margin.top)
    .attr('text-anchor', 'middle')
    .style('font-size', '1em')
    .text('Terrorist Groups with Highest Terror Attacks');

  return svg.node();
}


const displayGroupData = (hoveredGroup) => {
  if (hoveredGroup && processedData[hoveredGroup]) {
    const groupData = processedData[hoveredGroup];

    // Display group data in the console (you can customize this part)
    console.log(`Data for ${hoveredGroup}:`, groupData);

    // Render the group data in a new div (you can customize this part)
    return (
      <div>
        <h2>{hoveredGroup} Data:</h2>
        <ul>
          {Object.entries(groupData).map(([country, casualties]) => (
            <li key={country}>{`${country}: ${casualties} casualties`}</li>
          ))}
        </ul>
      </div>
    );
  } else {
    return null; // If hoveredGroup is falsy or no data found, render nothing
  }
};

const Page1 = () => {
  const [hoveredGroup, setHoveredGroup] = useState(null);

  useEffect(() => {
    // Call the chart initialization function
    initChart(setHoveredGroup);
  }, []);

  return (
    <div className="page-container">
      <svg id="bar-svg"></svg>
      <div className="group-data-container">
        {displayGroupData(hoveredGroup)}
      </div>
    </div>
  );
};

export default Page1;