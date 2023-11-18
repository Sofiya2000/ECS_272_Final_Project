
import React, { useEffect } from 'react';
import * as d3 from 'd3';  // Import D3 library

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
console.log(groupedData);
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
function initChart() {
  const totalWidth = 900; // Total width of the SVG container
  const totalHeight = 600;
  const margin = { top: 30, right: 30, bottom: 50, left: 280 };
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

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

  const handleMouseOver = function (event, d) {
    d3.select(this)
      .transition()
      .duration(100)
      .style('fill', 'black'); // Change color on mouseover
  };

  const handleMouseOut = function (event, d) {
    d3.select(this)
      .transition()
      .duration(100)
      .style('fill', d => color(d.group)); // Restore original color on mouseout
  };

  svg.selectAll('rect')
    .data(counts)
    .enter().append('rect')
    .attr('x', margin.left)
    .attr('y', d => yScale(d.group))
    .attr('width', d => xScale(d.count) - margin.left)
    .attr('height', yScale.bandwidth())
    .style('fill', d => color(d.group))
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut);

  // X-Axis
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .append('text')
    .attr('x', width / 2)
    .attr('y', 35)
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
    .attr('y', -35)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Group');

  // Title
  svg.append('text')
    .attr('x', totalWidth / 2)
    .attr('y', margin.top)
    .attr('text-anchor', 'middle')
    .style('font-size', '1em')
    .text('Terrorist Groups with Highest Terror Attacks');

  return svg.node();
}

const Page1 = () => {
  useEffect(() => {
    // Call the chart initialization function
    initChart();
  }, []);  // Empty dependency array ensures that the effect runs only once when the component mounts

  return (
    <div>
      <svg id="bar-svg"></svg>
      <div>This is Page 1</div>
    </div>
  );
};

export default Page1;